import {useState, useEffect, useCallback} from 'react';
import {useQuery} from '@tanstack/react-query';
import {api} from '../api';
import {useAuth} from '../auth';
import {PermissionGate} from '../permissions';
import {AutoComplete, type AutoCompleteOption} from '../AutoComplete';
import {Wizard, useWizardData} from '../Wizard';
import './FechamentoCaixa.css';

type Caixa = {
    id: number;
    data: string;
    dataFechamento: string | null;
    usuarioId: number;
    fundoCaixa: number;
    impressoraId: number | null;
    unidadeId: number;
    idCaixaUnidade: number;
    documento: string | null;
};

type TipoPagamento = 'DINHEIRO' | 'CHEQUE' | 'CARTAO' | 'BOLETO' | 'PIX' | 'TRANFERENCIA' | 'DEPOSITO';
const TIPOS_PAGAMENTO: { value: TipoPagamento; label: string }[] = [
    {value: 'DINHEIRO', label: 'Dinheiro'},
    {value: 'CHEQUE', label: 'Cheque'},
    {value: 'CARTAO', label: 'Cartão'},
    {value: 'BOLETO', label: 'Boleto'},
    {value: 'PIX', label: 'Pix'},
    {value: 'TRANFERENCIA', label: 'Transferência'},
    {value: 'DEPOSITO', label: 'Depósito'},
];

type FormaPagamentoLinha = {
    tipoPagamento: TipoPagamento;
    valor: string;
    documento: string;
    cheque?: { data: string; numero: string };
    cartao?: { bandeiraId: number; tipoPagamentoCartao: string; quantidadeParcelas: number };
    transferencia?: { data: string; agenciaOrigem: string; contaOrigem: string; agenciaDestino: string; contaDestino: string };
    deposito?: { data: string; agenciaDestino: string; contaDestino: string };
    boleto?: { barCode: string };
};

type FechamentoCaixaTotais = {
    caixaId: number;
    totalFundoCaixa: number;
    totalDinheiro: number;
    totalCheque: number;
    totalCartao: number;
    totalBoleto: number;
    totalTransferencia: number;
    totalDeposito: number;
    totalSangria: number;
    totalDinheiroCaixa: number;
    totalValor: number;
    totalDesconto: number;
    totalJurosMulta: number;
    totalValorPagar: number;
};

type ParcelaCalculo = {
    desconto: number;
    multa: number;
    juros: number;
    valorCobrado: number;
};

const money = (v: number | undefined | null) =>
    (v ?? 0).toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'});

function toOptions(arr: Array<{ id: number; nome: string }>): AutoCompleteOption[] {
    return arr.map((a) => ({id: a.id, label: a.nome}));
}

function fetchAutoComplete(path: string, valueKey: string, labelKey: string) {
    return async (query: string): Promise<AutoCompleteOption[]> => {
        if (!query || query.length < 2) return [];
        const {data} = await api.get<Array<Record<string, unknown>>>(path, {
            params: {q: query, limit: 20},
        });
        return data.map((item) => ({
            id: Number(item[valueKey]),
            label: String(item[labelKey] ?? `#${item[valueKey]}`),
        }));
    };
}

interface FechamentoCaixaData {
    // Step 1 - Configuração
    usuarioId: string;
    unidadeId: string;
    impressoraId: string;
    fundoCaixa: string;
    caixaAberto: boolean;
    caixaId: number | null;

    // Step 2 - Movimentação
    movSubTab: 'parcela' | 'extra' | 'sangria';

    // Parcela
    parcelaId: string;
    valorParcela: string;
    dataVencimento: string;
    parcelaSequencia: string;
    percentualDesconto: string;
    percentualMulta: string;
    percentualJuros: string;
    diasTolerancia: string;
    formasPagamento: FormaPagamentoLinha[];
    calculo: ParcelaCalculo | null;

    // Extra
    historico: string;
    valorExtra: string;
    movimentoId: string;
    tipoPagamentoExtra: TipoPagamento;

    // Sangria
    valorSangria: string;

    // Step 3 - Fechamento
    totais: FechamentoCaixaTotais | null;
}

const initialData: FechamentoCaixaData = {
    usuarioId: '',
    unidadeId: '',
    impressoraId: '',
    fundoCaixa: '',
    caixaAberto: false,
    caixaId: null,
    movSubTab: 'parcela',
    parcelaId: '',
    valorParcela: '',
    dataVencimento: '',
    parcelaSequencia: '1',
    percentualDesconto: '0',
    percentualMulta: '2',
    percentualJuros: '1',
    diasTolerancia: '0',
    formasPagamento: [{tipoPagamento: 'DINHEIRO', valor: '', documento: ''}],
    calculo: null,
    historico: '',
    valorExtra: '',
    movimentoId: '',
    tipoPagamentoExtra: 'DINHEIRO',
    valorSangria: '',
    totais: null,
};

export default function ViewPagamentoFechamentoCaixaWizardScreen() {
    const {session} = useAuth();
    const {data, updateFields, updateField} = useWizardData<FechamentoCaixaData>(initialData);

    const [erro, setErro] = useState<string | null>(null);
    const [mensagem, setMensagem] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [caixa, setCaixa] = useState<Caixa | null>(null);

    // AutoComplete fetch functions
    const fetchUsuario = fetchAutoComplete('/api/view/usuario/listUsuario', 'id', 'nome');
    const fetchUnidade = fetchAutoComplete('/api/view/unidade/listUnidade', 'id', 'sucinto');
    const fetchImpressora = fetchAutoComplete('/api/view/impressora/listImpressora', 'id', 'descricao');
    const fetchParcela = fetchAutoComplete('/api/financeiro/parcela/buscar', 'id', 'descricao');
    const fetchMovimento = fetchAutoComplete('/api/view/movimento/listMovimento', 'id', 'descricaocompleta');
    const fetchCategoriaFinanceira = fetchAutoComplete('/api/view/tipoMovimento/listTipoMovimento', 'id', 'descricao');
    const fetchBandeira = fetchAutoComplete('/api/view/bandeira/listBandeira', 'id', 'descricao');

    // AutoComplete fetchById functions (for loading label when value has ID but no label)
    const fetchUsuarioById = async (id: number) => {
        const {data} = await api.get(`/api/view/usuario/${id}`);
        return {id: data.id, label: data.nome};
    };
    const fetchUnidadeById = async (id: number) => {
        const {data} = await api.get(`/api/view/unidade/${id}`);
        return {id: data.id, label: data.sucinto};
    };
    const fetchImpressoraById = async (id: number) => {
        const {data} = await api.get(`/api/view/impressora/${id}`);
        return {id: data.id, label: data.descricao};
    };
    const fetchParcelaById = async (id: number) => {
        const {data} = await api.get(`/api/financeiro/parcela/${id}`);
        return {id: data.id, label: data.descricao};
    };
    const fetchMovimentoById = async (id: number) => {
        const {data} = await api.get(`/api/view/movimento/${id}`);
        return {id: data.id, label: data.descricaocompleta};
    };
    const fetchCategoriaFinanceiraById = async (id: number) => {
        const {data} = await api.get(`/api/view/tipoMovimento/${id}`);
        return {id: data.id, label: data.descricao};
    };
    const fetchBandeiraById = async (id: number) => {
        const {data} = await api.get(`/api/view/bandeira/${id}`);
        return {id: data.id, label: data.descricao};
    };

    // Load caixa when usuario/unidade change
    useEffect(() => {
        if (!data.usuarioId || !data.unidadeId) return;
        let cancelled = false;
        (async () => {
            try {
                const {data: caixaId} = await api.get<number | null>('/api/financeiro/caixa/buscar-abertura-caixa-com-usuario-unidade', {
                    params: {usuarioId: Number(data.usuarioId), unidadeId: Number(data.unidadeId)},
                });
                if (!cancelled && caixaId) {
                    const {data: caixaData} = await api.get<Caixa>(`/api/financeiro/caixa/${caixaId}`);
                    if (!cancelled) {
                        setCaixa(caixaData);
                        updateField('caixaAberto', true);
                        updateField('caixaId', caixaData.id);
                        updateField('fundoCaixa', String(caixaData.fundoCaixa));
                    }
                }
                if (!cancelled && !caixaId) {
                    const {data: sugerido} = await api.get<number | null>('/api/financeiro/caixa/fundo-caixa-sugerido', {
                        params: {usuarioId: Number(data.usuarioId), unidadeId: Number(data.unidadeId)},
                    });
                    if (sugerido != null && !cancelled) updateField('fundoCaixa', String(sugerido));
                }
            } catch {
                if (!cancelled) {
                    updateField('caixaAberto', false);
                    updateField('caixaId', null);
                }
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [data.usuarioId, data.unidadeId, updateField]);

    // Step validation functions
    const validateStep1 = useCallback(async (d: FechamentoCaixaData) => {
        if (!d.usuarioId) return 'Selecione o usuário';
        if (!d.unidadeId) return 'Selecione a unidade';
        if (!d.caixaAberto) {
            if (!d.impressoraId) return 'Selecione a impressora';
            if (!d.fundoCaixa || Number(d.fundoCaixa) < 0) return 'Informe o fundo de caixa (>= 0)';
        }
        return true;
    }, []);

    const validateStep2 = useCallback(async (d: FechamentoCaixaData) => {
        if (!d.caixaId) return 'Caixa não está aberto';

        if (d.movSubTab === 'parcela') {
            if (!d.parcelaId) return 'Informe o número da parcela ou busque por aluno';
            if (!d.calculo) return 'Calcule os valores antes de confirmar';
            const totalFormas = d.formasPagamento.reduce((acc, f) => acc + (Number(f.valor) || 0), 0);
            if (totalFormas < (d.calculo.valorCobrado ?? 0)) return 'Valor recebido deve ser >= valor cobrado';
        } else if (d.movSubTab === 'extra') {
            if (!d.historico) return 'Informe a descrição/histórico';
            if (!d.valorExtra || Number(d.valorExtra) <= 0) return 'Informe o valor (> 0)';
            if (!d.movimentoId) return 'Selecione o tipo de movimento';
        } else if (d.movSubTab === 'sangria') {
            if (!d.valorSangria || Number(d.valorSangria) <= 0) return 'Informe o valor da sangria (> 0)';
        }
        return true;
    }, []);

    const validateStep3 = useCallback(async (d: FechamentoCaixaData) => {
        if (!d.caixaId) return 'Caixa não está aberto';
        if (!d.totais) return 'Carregue os totais antes de fechar';
        return true;
    }, []);

    // Actions
    const abrirNovoCaixa = async () => {
        setErro(null);
        setLoading(true);
        try {
            const {data: newCaixa} = await api.post<Caixa>('/api/financeiro/caixa/abrir-novo-caixa', {
                data: new Date().toISOString(),
                usuarioId: Number(data.usuarioId),
                unidadeId: Number(data.unidadeId),
                fundoCaixa: Number(data.fundoCaixa || 0),
                impressoraId: data.impressoraId ? Number(data.impressoraId) : null,
            });
            setCaixa(newCaixa);
            updateFields({caixaAberto: true, caixaId: newCaixa.id});
            setMensagem('Caixa aberto com sucesso!');
        } catch (e: any) {
            setErro(e?.response?.data?.message ?? 'Erro ao abrir o caixa!');
        } finally {
            setLoading(false);
        }
    };

    const reabrirCaixa = async () => {
        if (!caixa) return;
        setLoading(true);
        setErro(null);
        try {
            const {data: reopened} = await api.post<Caixa>(`/api/financeiro/caixa/${caixa.id}/abrir`);
            setCaixa(reopened);
            updateFields({caixaAberto: true, caixaId: reopened.id});
            setMensagem('Caixa reaberto com sucesso!');
        } catch {
            setErro('Erro ao reabrir o caixa!');
        }
        finally {
            setLoading(false);
        }
    };

    const calcularValores = async () => {
        setErro(null);
        try {
            const {data: calc} = await api.post<ParcelaCalculo>('/api/financeiro/caixa/calcular-valores-parcela', {
                valor: Number(data.valorParcela || 0),
                dataVencimento: data.dataVencimento || null,
                parcelaSequencia: Number(data.parcelaSequencia || 0),
                percentualDesconto: Number(data.percentualDesconto || 0),
                percentualMulta: Number(data.percentualMulta || 0),
                percentualJuros: Number(data.percentualJuros || 0),
                diasToleranciaMulta: Number(data.diasTolerancia || 0),
                feriadoNoDiaAnteriorVencimento: false,
            });
            updateField('calculo', calc);
        } catch {
            setErro('Não foi possível calcular os valores da parcela.');
        }
    };

    const addFormaPagamento = () => {
        updateFields({
            formasPagamento: [...data.formasPagamento, {tipoPagamento: 'DINHEIRO', valor: '', documento: ''}]
        });
    };

    const removeFormaPagamento = (idx: number) => {
        if (data.formasPagamento.length <= 1) return;
        updateFields({
            formasPagamento: data.formasPagamento.filter((_, i) => i !== idx)
        });
    };

    const updateFormaPagamento = (idx: number, patch: Partial<FormaPagamentoLinha>) => {
        updateFields({
            formasPagamento: data.formasPagamento.map((f, i) => i === idx ? {...f, ...patch} : f)
        });
    };

    const registrarPagamento = async () => {
        if (!caixa || !data.calculo) return;
        setErro(null);
        setLoading(true);
        try {
            await api.post('/api/financeiro/caixa/registrar-pagamento-parcela', {
                caixaId: caixa.id,
                parcelaId: Number(data.parcelaId),
                usuarioId: Number(data.usuarioId),
                valorCobrado: data.calculo.valorCobrado,
                desconto: data.calculo.desconto,
                multaJuros: data.calculo.multa + data.calculo.juros,
                movimentacoes: data.formasPagamento
                    .filter((f) => Number(f.valor) > 0)
                    .map((f) => ({
                        tipoPagamento: f.tipoPagamento,
                        valor: Number(f.valor),
                        documento: f.documento || null
                    })),
            });
            setMensagem('Pagamento registrado com sucesso!');
            updateFields({
                parcelaId: '', valorParcela: '', dataVencimento: '', calculo: null,
                formasPagamento: [{tipoPagamento: 'DINHEIRO', valor: '', documento: ''}]
            });
        } catch (e: any) {
            setErro(e?.response?.data?.message ?? 'Erro ao registrar pagamento!');
        } finally {
            setLoading(false);
        }
    };

    const registrarMovimentacaoExtra = async () => {
        if (!caixa) return;
        setErro(null);
        setLoading(true);
        try {
            await api.post('/api/financeiro/movimentacao-financeira/movimentacao-extra', {
                historico: data.historico,
                valor: Number(data.valorExtra || 0),
                movimentoId: Number(data.movimentoId),
                tipoPagamento: data.tipoPagamentoExtra,
                caixaId: caixa.id,
                usuarioId: Number(data.usuarioId),
                valorTroco: 0,
            });
            setMensagem('Movimentação registrada com sucesso!');
            updateFields({historico: '', valorExtra: '', movimentoId: ''});
        } catch (e: any) {
            setErro(e?.response?.data?.message ?? 'Erro ao registrar movimentação!');
        } finally {
            setLoading(false);
        }
    };

    const registrarSangria = async () => {
        if (!caixa) return;
        setErro(null);
        setLoading(true);
        try {
            await api.post(`/api/financeiro/caixa/${caixa.id}/sangria`, {valor: Number(data.valorSangria || 0)});
            setMensagem('Sangria registrada com sucesso!');
            updateField('valorSangria', '');
            await carregarTotais();
        } catch (e: any) {
            setErro(e?.response?.data?.message ?? 'Dinheiro em caixa insuficiente!');
        } finally {
            setLoading(false);
        }
    };

    const carregarTotais = async () => {
        if (!caixa) return;
        setLoading(true);
        setErro(null);
        try {
            const {data: tot} = await api.get<FechamentoCaixaTotais>(`/api/financeiro/caixa/${caixa.id}/totais-fechamento`);
            updateField('totais', tot);
        } catch {
            setErro('Não foi possível carregar os totais do caixa.');
        }
        finally {
            setLoading(false);
        }
    };

    const fecharCaixa = async () => {
        if (!caixa) return;
        setErro(null);
        setLoading(true);
        try {
            const {data: closed} = await api.post<Caixa>(`/api/financeiro/caixa/${caixa.id}/fechar`);
            setCaixa(closed);
            updateFields({caixaAberto: true, caixaId: closed.id});
            setMensagem('Caixa fechado com sucesso!');
        } catch {
            setErro('Erro ao fechar o caixa!');
        }
        finally {
            setLoading(false);
        }
    };

    const goToStep = (index: number) => {
        if (index === 1 && !data.caixaAberto) {
            setErro('Você precisa configurar e abrir o caixa antes!');
            return;
        }
        if (index === 2 && !data.caixaId) {
            setErro('Caixa não está aberto!');
            return;
        }
        setErro(null);
    };

    const valorRecebido = data.formasPagamento.reduce((acc, f) => acc + (Number(f.valor) || 0), 0);
    const troco = data.calculo ? Math.max(0, valorRecebido - data.calculo.valorCobrado) : 0;

    return (
        <PermissionGate permission="READ">
            <main className="fechamento-caixa-wizard">
                <h1>Fechamento de Caixa</h1>

                <Wizard
                    initialData={data}
                    onDataChange={updateFields}
                    steps={[
                        {
                            key: 'configuracao',
                            label: 'Configuração do Caixa',
                            content: (
                                <section className="step-content">
                                    <p className="step-description">
                                        Informe o usuário e a unidade para localizar (ou abrir) o caixa do dia.
                                    </p>

                                    <div className="field-row">
                                        <AutoComplete
                                            id="usuario"
                                            label="Usuário *"
                                            placeholder="Digite para buscar..."
                                            value={data.usuarioId ? {id: Number(data.usuarioId), label: ''} : null}
                                            onChange={(opt) => updateField('usuarioId', opt ? String(opt.id) : '')}
                                            fetchOptions={fetchUsuario}
                                            fetchById={fetchUsuarioById}
                                            minChars={2}
                                        />
                                        <AutoComplete
                                            id="unidade"
                                            label="Unidade *"
                                            placeholder="Digite para buscar..."
                                            value={data.unidadeId ? {id: Number(data.unidadeId), label: ''} : null}
                                            onChange={(opt) => updateField('unidadeId', opt ? String(opt.id) : '')}
                                            fetchOptions={fetchUnidade}
                                            fetchById={fetchUnidadeById}
                                            minChars={2}
                                        />
                                    </div>

                                    {data.caixaAberto && caixa ? (
                                        <div className="caixa-info">
                                            <p>
                                                Caixa <strong>#{caixa.idCaixaUnidade}</strong> aberto em{' '}
                                                {new Date(caixa.data).toLocaleString('pt-BR')} —{' '}
                                                {caixa.dataFechamento ? (
                                                    <strong className="status-fechado">Fechado</strong>
                                                ) : (
                                                    <strong className="status-aberto">Aberto</strong>
                                                )}
                                            </p>
                                            <p>Fundo de caixa: {money(caixa.fundoCaixa)}</p>
                                            {caixa.dataFechamento && (
                                                <button className="btn-secondary" onClick={reabrirCaixa}
                                                        disabled={loading}>
                                                    Abrir caixa novamente
                                                </button>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="caixa-config">
                                            <p>Nenhum caixa aberto hoje para este usuário/unidade.</p>
                                            <div className="field-row">
                                                <AutoComplete
                                                    id="impressora"
                                                    label="Impressora *"
                                                    placeholder="Digite para buscar..."
                                                    value={data.impressoraId ? {
                                                        id: Number(data.impressoraId),
                                                        label: ''
                                                    } : null}
                                                    onChange={(opt) => updateField('impressoraId', opt ? String(opt.id) : '')}
                                                    fetchOptions={fetchImpressora}
                                                    fetchById={fetchImpressoraById}
                                                    minChars={2}
                                                />
                                                <div className="field-group">
                                                    <label>Fundo de Caixa *</label>
                                                    <input
                                                        type="number"
                                                        step="0.01"
                                                        min="0"
                                                        value={data.fundoCaixa}
                                                        onChange={(e) => updateField('fundoCaixa', e.target.value)}
                                                        placeholder="0,00"
                                                    />
                                                </div>
                                            </div>
                                            <button
                                                className="btn-primary"
                                                onClick={abrirNovoCaixa}
                                                disabled={loading || !data.usuarioId || !data.unidadeId}
                                            >
                                                Abrir Caixa
                                            </button>
                                        </div>
                                    )}
                                </section>
                            ),
                            validate: validateStep1,
                        },
                        {
                            key: 'movimentacao',
                            label: 'Movimentação Financeira',
                            content: (
                                <section className="step-content">
                                    {!data.caixaAberto && <p className="warning">Caixa não está aberto!</p>}

                                    <div className="sub-tabs">
                                        <button
                                            className={data.movSubTab === 'parcela' ? 'active' : ''}
                                            onClick={() => updateField('movSubTab', 'parcela')}
                                        >
                                            Pagamento de Parcela
                                        </button>
                                        <button
                                            className={data.movSubTab === 'extra' ? 'active' : ''}
                                            onClick={() => updateField('movSubTab', 'extra')}
                                        >
                                            Movimentação Extra
                                        </button>
                                        <button
                                            className={data.movSubTab === 'sangria' ? 'active' : ''}
                                            onClick={() => updateField('movSubTab', 'sangria')}
                                        >
                                            Sangria
                                        </button>
                                    </div>

                                    {data.movSubTab === 'parcela' && (
                                        <div className="sub-content">
                                            <div className="field-row">
                                                <AutoComplete
                                                    id="parcela"
                                                    label="Nº Parcela / Buscar Aluno *"
                                                    placeholder="Número da parcela ou nome do aluno..."
                                                    value={data.parcelaId ? {
                                                        id: Number(data.parcelaId),
                                                        label: `Parcela #${data.parcelaId}`
                                                    } : null}
                                                    onChange={(opt) => updateField('parcelaId', opt ? String(opt.id) : '')}
                                                    fetchOptions={fetchParcela}
                                                    fetchById={fetchParcelaById}
                                                    minChars={2}
                                                />
                                                <div className="field-group">
                                                    <label>Valor da Parcela</label>
                                                    <input
                                                        type="number"
                                                        step="0.01"
                                                        value={data.valorParcela}
                                                        onChange={(e) => updateField('valorParcela', e.target.value)}
                                                    />
                                                </div>
                                                <div className="field-group">
                                                    <label>Data Vencimento</label>
                                                    <input
                                                        type="date"
                                                        value={data.dataVencimento}
                                                        onChange={(e) => updateField('dataVencimento', e.target.value)}
                                                    />
                                                </div>
                                                <div className="field-group">
                                                    <label>Nº Parcela (0 = entrada)</label>
                                                    <input
                                                        type="number"
                                                        value={data.parcelaSequencia}
                                                        onChange={(e) => updateField('parcelaSequencia', e.target.value)}
                                                    />
                                                </div>
                                            </div>

                                            <div className="field-row">
                                                <div className="field-group">
                                                    <label>% Desconto</label>
                                                    <input
                                                        type="number"
                                                        step="0.01"
                                                        value={data.percentualDesconto}
                                                        onChange={(e) => updateField('percentualDesconto', e.target.value)}
                                                    />
                                                </div>
                                                <div className="field-group">
                                                    <label>% Multa</label>
                                                    <input
                                                        type="number"
                                                        step="0.01"
                                                        value={data.percentualMulta}
                                                        onChange={(e) => updateField('percentualMulta', e.target.value)}
                                                    />
                                                </div>
                                                <div className="field-group">
                                                    <label>% Juros a.m.</label>
                                                    <input
                                                        type="number"
                                                        step="0.01"
                                                        value={data.percentualJuros}
                                                        onChange={(e) => updateField('percentualJuros', e.target.value)}
                                                    />
                                                </div>
                                                <div className="field-group">
                                                    <label>Dias tolerância</label>
                                                    <input
                                                        type="number"
                                                        value={data.diasTolerancia}
                                                        onChange={(e) => updateField('diasTolerancia', e.target.value)}
                                                    />
                                                </div>
                                            </div>

                                            <button className="btn-secondary" onClick={calcularValores}
                                                    style={{marginTop: 8}}>
                                                Calcular valores
                                            </button>

                                            {data.calculo && (
                                                <table className="calculo-table">
                                                    <tbody>
                                                    <tr>
                                                        <td>Desconto</td>
                                                        <td>{money(data.calculo.desconto)}</td>
                                                    </tr>
                                                    <tr>
                                                        <td>Multa + Juros</td>
                                                        <td>{money(data.calculo.multa + data.calculo.juros)}</td>
                                                    </tr>
                                                    <tr className="total">
                                                        <td><strong>Valor Cobrado</strong></td>
                                                        <td><strong>{money(data.calculo.valorCobrado)}</strong></td>
                                                    </tr>
                                                    </tbody>
                                                </table>
                                            )}

                                            <h3>Formas de Pagamento</h3>
                                            {data.formasPagamento.map((f, idx) => (
                                                <div key={idx} className="forma-pagamento-row">
                                                    <select
                                                        value={f.tipoPagamento}
                                                        onChange={(e) => updateFormaPagamento(idx, {tipoPagamento: e.target.value as TipoPagamento})}
                                                    >
                                                        {TIPOS_PAGAMENTO.map((t) => (
                                                            <option key={t.value} value={t.value}>{t.label}</option>
                                                        ))}
                                                    </select>
                                                    <input
                                                        type="number"
                                                        step="0.01"
                                                        min="0"
                                                        placeholder="Valor"
                                                        value={f.valor}
                                                        onChange={(e) => updateFormaPagamento(idx, {valor: e.target.value})}
                                                    />
                                                    {f.tipoPagamento !== 'DINHEIRO' && f.tipoPagamento !== 'PIX' && (
                                                        <input
                                                            placeholder="Documento / nº"
                                                            value={f.documento}
                                                            onChange={(e) => updateFormaPagamento(idx, {documento: e.target.value})}
                                                        />
                                                    )}
                                                    {f.tipoPagamento === 'CHEQUE' && (
                                                        <div className="forma-detalhe">
                                                            <input type="date" placeholder="Data do cheque"
                                                                   value={f.cheque?.data || ''}
                                                                   onChange={(e) => updateFormaPagamento(idx, {
                                                                       cheque: {
                                                                           ...f.cheque,
                                                                           data: e.target.value
                                                                       }
                                                                   })}/>
                                                            <input type="text" placeholder="Número do cheque"
                                                                   value={f.cheque?.numero || ''}
                                                                   onChange={(e) => updateFormaPagamento(idx, {
                                                                       cheque: {
                                                                           ...f.cheque,
                                                                           numero: e.target.value
                                                                       }
                                                                   })}/>
                                                        </div>
                                                    )}
{f.tipoPagamento === 'CARTAO' && (
                                                            <div className="forma-detalhe">
                                                                <AutoComplete
                                                                    label="Bandeira"
                                                                    placeholder="Buscar bandeira..."
                                                                    value={f.cartao?.bandeiraId ? {
                                                                        id: f.cartao.bandeiraId,
                                                                        label: ''
                                                                    } : null}
                                                                    onChange={(opt) => updateFormaPagamento(idx, {
                                                                        cartao: {
                                                                            ...f.cartao,
                                                                            bandeiraId: opt ? opt.id : 0
                                                                        }
                                                                    })}
                                                                    fetchOptions={fetchBandeira}
                                                                    fetchById={fetchBandeiraById}
                                                                    minChars={2}
                                                                />
                                                            <select value={f.cartao?.tipoPagamentoCartao || ''}
                                                                    onChange={(e) => updateFormaPagamento(idx, {
                                                                        cartao: {
                                                                            ...f.cartao,
                                                                            tipoPagamentoCartao: e.target.value
                                                                        }
                                                                    })}>
                                                                <option value="">Tipo de Pagamento</option>
                                                                <option value="CREDITO">Crédito</option>
                                                                <option value="DEBITO">Débito</option>
                                                            </select>
                                                            <input type="number" min="1" placeholder="Parcelas"
                                                                   value={f.cartao?.quantidadeParcelas || ''}
                                                                   onChange={(e) => updateFormaPagamento(idx, {
                                                                       cartao: {
                                                                           ...f.cartao,
                                                                           quantidadeParcelas: Number(e.target.value) || 1
                                                                       }
                                                                   })}/>
                                                        </div>
                                                    )}
                                                    {f.tipoPagamento === 'TRANFERENCIA' && (
                                                        <div className="forma-detalhe">
                                                            <input type="date" placeholder="Data"
                                                                   value={f.transferencia?.data || ''}
                                                                   onChange={(e) => updateFormaPagamento(idx, {
                                                                       transferencia: {
                                                                           ...f.transferencia,
                                                                           data: e.target.value
                                                                       }
                                                                   })}/>
                                                            <input placeholder="Agência Origem"
                                                                   value={f.transferencia?.agenciaOrigem || ''}
                                                                   onChange={(e) => updateFormaPagamento(idx, {
                                                                       transferencia: {
                                                                           ...f.transferencia,
                                                                           agenciaOrigem: e.target.value
                                                                       }
                                                                   })}/>
                                                            <input placeholder="Conta Origem"
                                                                   value={f.transferencia?.contaOrigem || ''}
                                                                   onChange={(e) => updateFormaPagamento(idx, {
                                                                       transferencia: {
                                                                           ...f.transferencia,
                                                                           contaOrigem: e.target.value
                                                                       }
                                                                   })}/>
                                                            <input placeholder="Agência Destino"
                                                                   value={f.transferencia?.agenciaDestino || ''}
                                                                   onChange={(e) => updateFormaPagamento(idx, {
                                                                       transferencia: {
                                                                           ...f.transferencia,
                                                                           agenciaDestino: e.target.value
                                                                       }
                                                                   })}/>
                                                            <input placeholder="Conta Destino"
                                                                   value={f.transferencia?.contaDestino || ''}
                                                                   onChange={(e) => updateFormaPagamento(idx, {
                                                                       transferencia: {
                                                                           ...f.transferencia,
                                                                           contaDestino: e.target.value
                                                                       }
                                                                   })}/>
                                                        </div>
                                                    )}
                                                    {f.tipoPagamento === 'DEPOSITO' && (
                                                        <div className="forma-detalhe">
                                                            <input type="date" placeholder="Data"
                                                                   value={f.deposito?.data || ''}
                                                                   onChange={(e) => updateFormaPagamento(idx, {
                                                                       deposito: {
                                                                           ...f.deposito,
                                                                           data: e.target.value
                                                                       }
                                                                   })}/>
                                                            <input placeholder="Agência Destino"
                                                                   value={f.deposito?.agenciaDestino || ''}
                                                                   onChange={(e) => updateFormaPagamento(idx, {
                                                                       deposito: {
                                                                           ...f.deposito,
                                                                           agenciaDestino: e.target.value
                                                                       }
                                                                   })}/>
                                                            <input placeholder="Conta Destino"
                                                                   value={f.deposito?.contaDestino || ''}
                                                                   onChange={(e) => updateFormaPagamento(idx, {
                                                                       deposito: {
                                                                           ...f.deposito,
                                                                           contaDestino: e.target.value
                                                                       }
                                                                   })}/>
                                                        </div>
                                                    )}
                                                    {f.tipoPagamento === 'BOLETO' && (
                                                        <div className="forma-detalhe">
                                                            <input type="text" placeholder="Código de barras"
                                                                   value={f.boleto?.barCode || ''}
                                                                   onChange={(e) => updateFormaPagamento(idx, {
                                                                       boleto: {
                                                                           ...f.boleto,
                                                                           barCode: e.target.value
                                                                       }
                                                                   })}/>
                                                        </div>
                                                    )}
                                                    <button type="button" onClick={() => removeFormaPagamento(idx)}
                                                            disabled={data.formasPagamento.length === 1}
                                                            className="btn-danger-sm">
                                                        Remover
                                                    </button>
                                                </div>
                                            ))}
                                            <button type="button" className="btn-secondary" onClick={addFormaPagamento}>
                                                + Adicionar forma de pagamento
                                            </button>

                                            <div className="totais-parcelas">
                                                <p>Valor recebido: <strong>{money(valorRecebido)}</strong>
                                                    {data.calculo && troco > 0 && <span> — Troco: {money(troco)}</span>}
                                                </p>
                                            </div>

                                            <button
                                                className="btn-primary"
                                                onClick={registrarPagamento}
                                                disabled={loading || !data.calculo || valorRecebido < (data.calculo?.valorCobrado ?? Infinity)}
                                            >
                                                Confirmar Pagamento
                                            </button>
                                        </div>
                                    )}

                                    {data.movSubTab === 'extra' && (
                                        <div className="sub-content">
                                            <div className="field-row">
                                                <div className="field-group full">
                                                    <label>Descrição / Histórico *</label>
                                                    <input
                                                        value={data.historico}
                                                        onChange={(e) => updateField('historico', e.target.value)}
                                                        placeholder="Descrição da movimentação"
                                                    />
                                                </div>
                                                <AutoComplete
                                                    id="movimento"
                                                    label="Tipo de Movimento *"
                                                    placeholder="Buscar movimento..."
                                                    value={data.movimentoId ? {
                                                        id: Number(data.movimentoId),
                                                        label: ''
                                                    } : null}
                                                    onChange={(opt) => updateField('movimentoId', opt ? String(opt.id) : '')}
                                                    fetchOptions={fetchMovimento}
                                                    fetchById={fetchMovimentoById}
                                                    minChars={2}
                                                />
                                                <div className="field-group">
                                                    <label>Valor *</label>
                                                    <input
                                                        type="number"
                                                        step="0.01"
                                                        min="0.01"
                                                        value={data.valorExtra}
                                                        onChange={(e) => updateField('valorExtra', e.target.value)}
                                                    />
                                                </div>
                                                <div className="field-group">
                                                    <label>Forma de Pagamento</label>
                                                    <select
                                                        value={data.tipoPagamentoExtra}
                                                        onChange={(e) => updateField('tipoPagamentoExtra', e.target.value as TipoPagamento)}
                                                    >
                                                        {TIPOS_PAGAMENTO.map((t) => (
                                                            <option key={t.value} value={t.value}>{t.label}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>
                                            <button className="btn-primary" onClick={registrarMovimentacaoExtra}
                                                    disabled={loading}>
                                                Registrar Movimentação
                                            </button>
                                        </div>
                                    )}

                                    {data.movSubTab === 'sangria' && (
                                        <div className="sub-content">
                                            <div className="field-group">
                                                <label>Valor da Sangria *</label>
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    min="0.01"
                                                    value={data.valorSangria}
                                                    onChange={(e) => updateField('valorSangria', e.target.value)}
                                                />
                                            </div>
                                            <button className="btn-primary" onClick={registrarSangria}
                                                    disabled={loading}>
                                                Registrar Sangria
                                            </button>
                                        </div>
                                    )}
                                </section>
                            ),
                            validate: validateStep2,
                        },
                        {
                            key: 'fechamento',
                            label: 'Fechamento do Caixa',
                            nextLabel: 'Fechar Caixa',
                            content: (
                                <section className="step-content">
                                    {!data.caixaAberto && <p className="warning">Caixa não está aberto!</p>}

                                    <h3>Totais do Caixa #{caixa?.idCaixaUnidade}</h3>
                                    {data.totais ? (
                                        <table className="totais-table">
                                            <tbody>
                                            <tr>
                                                <td>Fundo de Caixa</td>
                                                <td>{money(data.totais.totalFundoCaixa)}</td>
                                            </tr>
                                            <tr>
                                                <td>Dinheiro</td>
                                                <td>{money(data.totais.totalDinheiro)}</td>
                                            </tr>
                                            <tr>
                                                <td>Cheque</td>
                                                <td>{money(data.totais.totalCheque)}</td>
                                            </tr>
                                            <tr>
                                                <td>Cartão</td>
                                                <td>{money(data.totais.totalCartao)}</td>
                                            </tr>
                                            <tr>
                                                <td>Boleto</td>
                                                <td>{money(data.totais.totalBoleto)}</td>
                                            </tr>
                                            <tr>
                                                <td>Transferência</td>
                                                <td>{money(data.totais.totalTransferencia)}</td>
                                            </tr>
                                            <tr>
                                                <td>Depósito</td>
                                                <td>{money(data.totais.totalDeposito)}</td>
                                            </tr>
                                            <tr>
                                                <td>Sangria</td>
                                                <td>{money(data.totais.totalSangria)}</td>
                                            </tr>
                                            <tr>
                                                <td>Desconto concedido</td>
                                                <td>{money(data.totais.totalDesconto)}</td>
                                            </tr>
                                            <tr>
                                                <td>Multa/Juros recebidos</td>
                                                <td>{money(data.totais.totalJurosMulta)}</td>
                                            </tr>
                                            <tr className="total-row">
                                                <td><strong>Total Dinheiro em Caixa</strong></td>
                                                <td><strong>{money(data.totais.totalDinheiroCaixa)}</strong></td>
                                            </tr>
                                            <tr className="total-row">
                                                <td><strong>Valor Total</strong></td>
                                                <td><strong>{money(data.totais.totalValor)}</strong></td>
                                            </tr>
                                            <tr className="total-row">
                                                <td><strong>Valor a Pagar/Receber</strong></td>
                                                <td><strong>{money(data.totais.totalValorPagar)}</strong></td>
                                            </tr>
                                            </tbody>
                                        </table>
                                    ) : (
                                        <p className="loading">Carregando totais...</p>
                                    )}

                                    <button className="btn-secondary" onClick={carregarTotais} disabled={loading}>
                                        Atualizar Totais
                                    </button>
                                </section>
                            ),
                            onEnter: carregarTotais,
                            validate: validateStep3,
                        },
                    ]}
                    onComplete={fecharCaixa}
                />

                {erro && <div className="error-message">{erro}</div>}
                {mensagem && <div className="success-message">{mensagem}</div>}
            </main>
        </PermissionGate>
    );
}