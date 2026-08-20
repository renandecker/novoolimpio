import React, {useEffect, useState, useCallback} from 'react';
import {
    ActivityIndicator,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    Keyboard,
    Alert
} from 'react-native';
import {api} from '../api';
import {Wizard} from '../Wizard';
import type {WizardStep} from '../Wizard';
import {AutoComplete} from '../AutoComplete';
import {useQuery} from '@tanstack/react-query';

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
    {value: 'TRANFERENCIA', label: 'Transf.'},
    {value: 'DEPOSITO', label: 'Depósito'},
];

type FormaPagamentoLinha = {
    tipoPagamento: TipoPagamento;
    valor: string;
    documento: string;
    cheque?: { data?: string; numero?: string };
    cartao?: { bandeiraId?: number; tipoPagamentoCartao?: string; quantidadeParcelas?: number };
    transferencia?: { data?: string; agenciaOrigem?: string; contaOrigem?: string; agenciaDestino?: string; contaDestino?: string };
    deposito?: { data?: string; agenciaDestino?: string; contaDestino?: string };
    boleto?: { barCode?: string };
};

type FechamentoCaixaTotais = {
    totalFundoCaixa: number;
    totalDinheiro: number;
    totalCheque: number;
    totalCartao: number;
    totalBoleto: number;
    totalTransferencia: number;
    totalDeposito: number;
    totalSangria: number;
    totalDinheiroCaixa: number;
    totalDesconto: number;
    totalJurosMulta: number;
    totalValor: number;
    totalValorPagar: number;
};

type ParcelaCalculo = {
    desconto: number;
    multa: number;
    juros: number;
    valorCobrado: number;
};

const money = (v: number | undefined | null) =>
    (v ? ? 0).toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'});

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

function fetchAutoComplete(path: string, valueKey: string, labelKey: string) {
    return async (query: string) => {
        if (!query || query.length < 2) return [];
        const {data} = await api.get<any[]>(path, {params: {q: query, limit: 20}});
        return data.map((item) => ({
            id: Number(item[valueKey]),
            label: String(item[labelKey] ? ? `#${item[valueKey]}`),
        }));
    };
}

export default function ViewPagamentoFechamentoCaixaWizardScreen() {
    const {data, updateFields, updateField} = React.useReducer(
        (state: FechamentoCaixaData, action: Partial<FechamentoCaixaData>) => ({...state, ...action}),
        initialData
    )[0] as any;

    // Using useState directly for complex state management
    const [state, setState] = useState<FechamentoCaixaData>(initialData);
    const [caixa, setCaixa] = useState<Caixa | null>(null);
    const [loading, setLoading] = useState(false);
    const [erro, setErro] = useState<string | null>(null);
    const [mensagem, setMensagem] = useState<string | null>(null);

    // For AutoComplete - using local state for search text
    const [usuarioSearch, setUsuarioSearch] = useState('');
    const [unidadeSearch, setUnidadeSearch] = useState('');
    const [impressoraSearch, setImpressoraSearch] = useState('');
    const [parcelaSearch, setParcelaSearch] = useState('');
    const [movimentoSearch, setMovimentoSearch] = useState('');

    const fetchUsuario = fetchAutoComplete('/api/view/usuario/listUsuario', 'id', 'nome');
    const fetchUnidade = fetchAutoComplete('/api/view/unidade/listUnidade', 'id', 'sucinto');
    const fetchImpressora = fetchAutoComplete('/api/view/impressora/listImpressora', 'id', 'descricao');
    const fetchParcela = fetchAutoComplete('/api/financeiro/parcela/buscar', 'id', 'descricao');
    const fetchMovimento = fetchAutoComplete('/api/view/movimento/listMovimento', 'id', 'descricaocompleta');

    // Load caixa when usuario/unidade change
    useEffect(() => {
        if (!state.usuarioId || !state.unidadeId) return;
        let cancelled = false;
        (async () => {
            try {
                const {data: caixaId} = await api.get<number | null>('/api/financeiro/caixa/buscar-abertura-caixa-com-usuario-unidade', {
                    params: {usuarioId: Number(state.usuarioId), unidadeId: Number(state.unidadeId)},
                });
                if (!cancelled && caixaId) {
                    const {data: caixaData} = await api.get<Caixa>(`/api/financeiro/caixa/${caixaId}`);
                    if (!cancelled) {
                        setCaixa(caixaData);
                        setState(s => ({
                            ...s,
                            caixaAberto: true,
                            caixaId: caixaData.id,
                            fundoCaixa: String(caixaData.fundoCaixa)
                        }));
                    }
                }
                if (!cancelled && !caixaId) {
                    const {data: sugerido} = await api.get<number | null>('/api/financeiro/caixa/fundo-caixa-sugerido', {
                        params: {usuarioId: Number(state.usuarioId), unidadeId: Number(state.unidadeId)},
                    });
                    if (sugerido != null && !cancelled) setState(s => ({...s, fundoCaixa: String(sugerido)}));
                }
            } catch {
                if (!cancelled) setState(s => ({...s, caixaAberto: false, caixaId: null}));
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [state.usuarioId, state.unidadeId]);

    const setField = useCallback((key: keyof FechamentoCaixaData, value: any) => {
        setState(s => ({...s, [key]: value}));
    }, []);

    const setFields = useCallback((fields: Partial<FechamentoCaixaData>) => {
        setState(s => ({...s, ...fields}));
    }, []);

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
            if (totalFormas < (d.calculo.valorCobrado ? ? 0)) return 'Valor recebido deve ser >= valor cobrado';
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
                usuarioId: Number(state.usuarioId),
                unidadeId: Number(state.unidadeId),
                fundoCaixa: Number(state.fundoCaixa || 0),
                impressoraId: state.impressoraId ? Number(state.impressoraId) : null,
            });
            setCaixa(newCaixa);
            setFields({caixaAberto: true, caixaId: newCaixa.id});
            setMensagem('Caixa aberto com sucesso!');
        } catch (e: any) {
            setErro(e?.response?.data?.message ? ? 'Erro ao abrir o caixa!');
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
            setFields({caixaAberto: true, caixaId: reopened.id});
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
                valor: Number(state.valorParcela || 0),
                dataVencimento: state.dataVencimento || null,
                parcelaSequencia: Number(state.parcelaSequencia || 0),
                percentualDesconto: Number(state.percentualDesconto || 0),
                percentualMulta: Number(state.percentualMulta || 0),
                percentualJuros: Number(state.percentualJuros || 0),
                diasToleranciaMulta: Number(state.diasTolerancia || 0),
                feriadoNoDiaAnteriorVencimento: false,
            });
            setField('calculo', calc);
        } catch {
            setErro('Não foi possível calcular os valores da parcela.');
        }
    };

    const addFormaPagamento = () => {
        setField('formasPagamento', [...state.formasPagamento, {tipoPagamento: 'DINHEIRO', valor: '', documento: ''}]);
    };

    const removeFormaPagamento = (idx: number) => {
        if (state.formasPagamento.length <= 1) return;
        setField('formasPagamento', state.formasPagamento.filter((_, i) => i !== idx));
    };

    const updateFormaPagamento = (idx: number, patch: Partial<FormaPagamentoLinha>) => {
        setField('formasPagamento', state.formasPagamento.map((f, i) => i === idx ? {...f, ...patch} : f));
    };

    const registrarPagamento = async () => {
        if (!caixa || !state.calculo) return;
        setErro(null);
        setLoading(true);
        try {
            await api.post('/api/financeiro/caixa/registrar-pagamento-parcela', {
                caixaId: caixa.id,
                parcelaId: Number(state.parcelaId),
                usuarioId: Number(state.usuarioId),
                valorCobrado: state.calculo.valorCobrado,
                desconto: state.calculo.desconto,
                multaJuros: state.calculo.multa + state.calculo.juros,
                movimentacoes: state.formasPagamento
                    .filter((f) => Number(f.valor) > 0)
                    .map((f) => ({
                        tipoPagamento: f.tipoPagamento,
                        valor: Number(f.valor),
                        documento: f.documento || null
                    })),
            });
            setMensagem('Pagamento registrado com sucesso!');
            setFields({
                parcelaId: '', valorParcela: '', dataVencimento: '', calculo: null,
                formasPagamento: [{tipoPagamento: 'DINHEIRO', valor: '', documento: ''}]
            });
        } catch (e: any) {
            setErro(e?.response?.data?.message ? ? 'Erro ao registrar pagamento!');
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
                historico: state.historico,
                valor: Number(state.valorExtra || 0),
                movimentoId: Number(state.movimentoId),
                tipoPagamento: state.tipoPagamentoExtra,
                caixaId: caixa.id,
                usuarioId: Number(state.usuarioId),
                valorTroco: 0,
            });
            setMensagem('Movimentação registrada com sucesso!');
            setFields({historico: '', valorExtra: '', movimentoId: ''});
        } catch (e: any) {
            setErro(e?.response?.data?.message ? ? 'Erro ao registrar movimentação!');
        } finally {
            setLoading(false);
        }
    };

    const registrarSangria = async () => {
        if (!caixa) return;
        setErro(null);
        setLoading(true);
        try {
            await api.post(`/api/financeiro/caixa/${caixa.id}/sangria`, {valor: Number(state.valorSangria || 0)});
            setMensagem('Sangria registrada com sucesso!');
            setField('valorSangria', '');
            await carregarTotais();
        } catch (e: any) {
            setErro(e?.response?.data?.message ? ? 'Dinheiro em caixa insuficiente!');
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
            setField('totais', tot);
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
            setFields({caixaAberto: true, caixaId: closed.id});
            setMensagem('Caixa fechado com sucesso!');
        } catch {
            setErro('Erro ao fechar o caixa!');
        }
        finally {
            setLoading(false);
        }
    };

    const goToStep = (index: number) => {
        if (index === 1 && !state.caixaAberto) {
            setErro('Você precisa configurar e abrir o caixa antes!');
            return;
        }
        if (index === 2 && !state.caixaId) {
            setErro('Caixa não está aberto!');
            return;
        }
        setErro(null);
    };

    const valorRecebido = state.formasPagamento.reduce((acc, f) => acc + (Number(f.valor) || 0), 0);
    const troco = state.calculo ? Math.max(0, valorRecebido - state.calculo.valorCobrado) : 0;

    // Step 1 - Configuração
    const passo1 = (
        <ScrollView style={styles.scrollView}>
            <Text style={styles.stepDescription}>
                Informe o usuário e a unidade para localizar (ou abrir) o caixa do dia.
            </Text>

            <View style={styles.fieldRow}>
                <AutoComplete
                    label="Usuário *"
                    placeholder="Digite para buscar..."
                    value={state.usuarioId ? {id: Number(state.usuarioId), label: ''} : null}
                    onChange={(opt) => {
                        setField('usuarioId', opt ? String(opt.id) : '');
                        setUsuarioSearch(opt?.label || '');
                    }}
                    fetchOptions={fetchUsuario}
                    minChars={2}
                    style={styles.autoComplete}
                />
                <AutoComplete
                    label="Unidade *"
                    placeholder="Digite para buscar..."
                    value={state.unidadeId ? {id: Number(state.unidadeId), label: ''} : null}
                    onChange={(opt) => {
                        setField('unidadeId', opt ? String(opt.id) : '');
                        setUnidadeSearch(opt?.label || '');
                    }}
                    fetchOptions={fetchUnidade}
                    minChars={2}
                    style={styles.autoComplete}
                />
            </View>

            {state.caixaAberto && caixa ? (
                <View style={styles.caixaInfo}>
                    <Text>
                        Caixa <Text style={styles.bold}>#{caixa.idCaixaUnidade}</Text> aberto em{' '}
                        {new Date(caixa.data).toLocaleString('pt-BR')} —{' '}
                        {caixa.dataFechamento ? (
                            <Text style={styles.statusFechado}>Fechado</Text>
                        ) : (
                            <Text style={styles.statusAberto}>Aberto</Text>
                        )}
                    </Text>
                    <Text>Fundo de caixa: {money(caixa.fundoCaixa)}</Text>
                    {caixa.dataFechamento && (
                        <Pressable style={[styles.primaryButton, loading && styles.buttonDisabled]}
                                   onPress={reabrirCaixa} disabled={loading}>
                            <Text style={styles.primaryButtonText}>Abrir caixa novamente</Text>
                        </Pressable>
                    )}
                </View>
            ) : (
                <View style={styles.caixaConfig}>
                    <Text style={styles.hint}>Nenhum caixa aberto hoje. Configure a impressora e o fundo de
                        caixa.</Text>
                    <View style={styles.fieldRow}>
                        <AutoComplete
                            label="Impressora *"
                            placeholder="Digite para buscar..."
                            value={state.impressoraId ? {id: Number(state.impressoraId), label: ''} : null}
                            onChange={(opt) => {
                                setField('impressoraId', opt ? String(opt.id) : '');
                                setImpressoraSearch(opt?.label || '');
                            }}
                            fetchOptions={fetchImpressora}
                            minChars={2}
                            style={styles.autoComplete}
                        />
                        <View style={styles.fieldGroup}>
                            <Text style={styles.fieldLabel}>Fundo de Caixa *</Text>
                            <TextInput
                                style={styles.input}
                                value={state.fundoCaixa}
                                onChangeText={(v) => setField('fundoCaixa', v)}
                                keyboardType="numeric"
                                placeholder="0,00"
                            />
                        </View>
                    </View>
                    <Pressable style={[styles.primaryButton, loading && styles.buttonDisabled]} onPress={abrirNovoCaixa}
                               disabled={loading || !state.usuarioId || !state.unidadeId}>
                        <Text style={styles.primaryButtonText}>Abrir Caixa</Text>
                    </Pressable>
                </View>
            )}
        </ScrollView>
    );

    // Step 2 - Movimentação
    const passo2 = (
        <ScrollView style={styles.scrollView}>
            {!state.caixaAberto && <Text style={styles.warning}>Caixa não está aberto!</Text>}

            <View style={styles.subTabsRow}>
                {(['parcela', 'extra', 'sangria'] as const).map((k) => (
                    <Pressable key={k} onPress={() => setField('movSubTab', k)} style={[styles.chip, state.movSubTab === k && styles.chipActive]}>
                    <Text style={[styles.chipText, state.movSubTab === k && styles.chipTextActive]}>
                    {k === 'parcela' ? 'Pagamento de Parcela' : k === 'extra' ? 'Movimentação Extra' : 'Sangria'}
                    </Text>
                    </Pressable>
                    ))}
            </View>

            {state.movSubTab === 'parcela' && (
                <View>
                    <View style={styles.fieldRow}>
                        <AutoComplete
                            label="Nº Parcela / Aluno *"
                            placeholder="Número da parcela ou nome do aluno..."
                            value={state.parcelaId ? {
                                id: Number(state.parcelaId),
                                label: `Parcela #${state.parcelaId}`
                            } : null}
                            onChange={(opt) => {
                                setField('parcelaId', opt ? String(opt.id) : '');
                                setParcelaSearch(opt?.label || '');
                            }}
                            fetchOptions={fetchParcela}
                            minChars={2}
                            style={styles.autoComplete}
                        />
                        <View style={styles.fieldGroup}>
                            <Text style={styles.fieldLabel}>Valor</Text>
                            <TextInput style={styles.input} value={state.valorParcela}
                                       onChangeText={(v) => setField('valorParcela', v)} keyboardType="numeric"/>
                        </View>
                        <View style={styles.fieldGroup}>
                            <Text style={styles.fieldLabel}>Vencimento</Text>
                            <TextInput style={styles.input} value={state.dataVencimento}
                                       onChangeText={(v) => setField('dataVencimento', v)} placeholder="AAAA-MM-DD"/>
                        </View>
                        <View style={styles.fieldGroup}>
                            <Text style={styles.fieldLabel}>Nº Parcela (0 = entrada)</Text>
                            <TextInput style={styles.input} value={state.parcelaSequencia}
                                       onChangeText={(v) => setField('parcelaSequencia', v)} keyboardType="numeric"/>
                        </View>
                    </View>

                    <View style={styles.fieldRow}>
                        <View style={styles.fieldGroup}>
                            <Text style={styles.fieldLabel}>% Desconto</Text>
                            <TextInput style={styles.input} value={state.percentualDesconto}
                                       onChangeText={(v) => setField('percentualDesconto', v)} keyboardType="numeric"/>
                        </View>
                        <View style={styles.fieldGroup}>
                            <Text style={styles.fieldLabel}>% Multa</Text>
                            <TextInput style={styles.input} value={state.percentualMulta}
                                       onChangeText={(v) => setField('percentualMulta', v)} keyboardType="numeric"/>
                        </View>
                        <View style={styles.fieldGroup}>
                            <Text style={styles.fieldLabel}>% Juros a.m.</Text>
                            <TextInput style={styles.input} value={state.percentualJuros}
                                       onChangeText={(v) => setField('percentualJuros', v)} keyboardType="numeric"/>
                        </View>
                        <View style={styles.fieldGroup}>
                            <Text style={styles.fieldLabel}>Dias tolerância</Text>
                            <TextInput style={styles.input} value={state.diasTolerancia}
                                       onChangeText={(v) => setField('diasTolerancia', v)} keyboardType="numeric"/>
                        </View>
                    </View>

                    <Pressable style={styles.secondaryButton} onPress={calcularValores}>
                        <Text style={styles.secondaryButtonText}>Calcular valores</Text>
                    </Pressable>

                    {state.calculo && (
                        <View style={styles.calculoCard}>
                            <Text>Desconto: {money(state.calculo.desconto)}</Text>
                            <Text>Multa + Juros: {money(state.calculo.multa + state.calculo.juros)}</Text>
                            <Text style={styles.bold}>Valor Cobrado: {money(state.calculo.valorCobrado)}</Text>
                        </View>
                    )}

                    <Text style={styles.sectionTitle}>Formas de Pagamento</Text>
                    {state.formasPagamento.map((f, idx) => (
                        <View key={idx} style={styles.formaPagamentoRow}>
                            <View style={styles.fieldGroup}>
                                <Text style={styles.fieldLabel}>Tipo</Text>
                                <AutoComplete
                                    label=""
                                    placeholder="Tipo"
                                    value={f.tipoPagamento ? {
                                        id: TIPOS_PAGAMENTO.findIndex(t => t.value === f.tipoPagamento),
                                        label: f.tipoPagamento
                                    } : null}
                                    onChange={(opt) => {
                                        const tp = TIPOS_PAGAMENTO[opt?.id ? ? 0];
                                        if (tp) updateFormaPagamento(idx, {tipoPagamento: tp.value});
                                    }}
                                    fetchOptions={async () => TIPOS_PAGAMENTO.map((t, i) => ({id: i, label: t.label}))}
                                    minChars={0}
                                    style={styles.autoCompleteSmall}
                                />
                            </View>
                            <View style={styles.fieldGroup}>
                                <Text style={styles.fieldLabel}>Valor</Text>
                                <TextInput style={styles.input} value={f.valor}
                                           onChangeText={(v) => updateFormaPagamento(idx, {valor: v})}
                                           keyboardType="numeric"/>
                            </View>
                            {f.tipoPagamento !== 'DINHEIRO' && f.tipoPagamento !== 'PIX' && (
                                <View style={styles.fieldGroup}>
                                    <Text style={styles.fieldLabel}>Documento / nº</Text>
                                    <TextInput style={styles.input} value={f.documento}
                                               onChangeText={(v) => updateFormaPagamento(idx, {documento: v})}/>
                                </View>
                            )}
                            {f.tipoPagamento === 'CHEQUE' && (
                                <View style={styles.formaDetalhe}>
                                    <View style={styles.fieldGroup}>
                                        <Text style={styles.fieldLabel}>Data cheque</Text>
                                        <TextInput style={styles.input} value={f.cheque?.data || ''}
                                                   onChangeText={(v) => updateFormaPagamento(idx, {
                                                       cheque: {
                                                           ...f.cheque,
                                                           data: v
                                                       }
                                                   })} placeholder="AAAA-MM-DD"/>
                                    </View>
                                    <View style={styles.fieldGroup}>
                                        <Text style={styles.fieldLabel}>Nº cheque</Text>
                                        <TextInput style={styles.input} value={f.cheque?.numero || ''}
                                                   onChangeText={(v) => updateFormaPagamento(idx, {
                                                       cheque: {
                                                           ...f.cheque,
                                                           numero: v
                                                       }
                                                   })}/>
                                    </View>
                                </View>
                            )}
                            {f.tipoPagamento === 'CARTAO' && (
                                <View style={styles.formaDetalhe}>
                                    <View style={styles.fieldGroup}>
                                        <Text style={styles.fieldLabel}>Bandeira</Text>
                                        <AutoComplete
                                            label=""
                                            placeholder="Buscar bandeira..."
                                            value={f.cartao?.bandeiraId ? {id: f.cartao.bandeiraId, label: ''} : null}
                                            onChange={(opt) => updateFormaPagamento(idx, {
                                                cartao: {
                                                    ...f.cartao,
                                                    bandeiraId: opt ? opt.id : 0
                                                }
                                            })}
                                            fetchOptions={fetchAutoComplete('/api/view/bandeira/listBandeira', 'id', 'descricao')}
                                            minChars={2}
                                            style={styles.autoCompleteSmall}
                                        />
                                    </View>
                                    <View style={styles.fieldGroup}>
                                        <Text style={styles.fieldLabel}>Tipo</Text>
                                        <AutoComplete
                                            label=""
                                            placeholder="Tipo"
                                            value={f.cartao?.tipoPagamentoCartao ? {
                                                id: f.cartao.tipoPagamentoCartao === 'CREDITO' ? 0 : 1,
                                                label: f.cartao.tipoPagamentoCartao
                                            } : null}
                                            onChange={(opt) => {
                                                const tipo = opt?.id === 0 ? 'CREDITO' : 'DEBITO';
                                                if (tipo) updateFormaPagamento(idx, {
                                                    cartao: {
                                                        ...f.cartao,
                                                        tipoPagamentoCartao: tipo
                                                    }
                                                });
                                            }}
                                            fetchOptions={async () => [{id: 0, label: 'Crédito'}, {
                                                id: 1,
                                                label: 'Débito'
                                            }]}
                                            minChars={0}
                                            style={styles.autoCompleteSmall}
                                        />
                                    </View>
                                    <View style={styles.fieldGroup}>
                                        <Text style={styles.fieldLabel}>Parcelas</Text>
                                        <TextInput style={styles.input}
                                                   value={String(f.cartao?.quantidadeParcelas || '')}
                                                   onChangeText={(v) => updateFormaPagamento(idx, {
                                                       cartao: {
                                                           ...f.cartao,
                                                           quantidadeParcelas: Number(v) || 1
                                                       }
                                                   })} keyboardType="numeric"/>
                                    </View>
                                </View>
                            )}
                            {f.tipoPagamento === 'TRANFERENCIA' && (
                                <View style={styles.formaDetalhe}>
                                    <View style={styles.fieldGroup}>
                                        <Text style={styles.fieldLabel}>Data</Text>
                                        <TextInput style={styles.input} value={f.transferencia?.data || ''}
                                                   onChangeText={(v) => updateFormaPagamento(idx, {
                                                       transferencia: {
                                                           ...f.transferencia,
                                                           data: v
                                                       }
                                                   })} placeholder="AAAA-MM-DD"/>
                                    </View>
                                    <View style={styles.fieldGroup}>
                                        <Text style={styles.fieldLabel}>Ag. Origem</Text>
                                        <TextInput style={styles.input} value={f.transferencia?.agenciaOrigem || ''}
                                                   onChangeText={(v) => updateFormaPagamento(idx, {
                                                       transferencia: {
                                                           ...f.transferencia,
                                                           agenciaOrigem: v
                                                       }
                                                   })}/>
                                    </View>
                                    <View style={styles.fieldGroup}>
                                        <Text style={styles.fieldLabel}>Cta. Origem</Text>
                                        <TextInput style={styles.input} value={f.transferencia?.contaOrigem || ''}
                                                   onChangeText={(v) => updateFormaPagamento(idx, {
                                                       transferencia: {
                                                           ...f.transferencia,
                                                           contaOrigem: v
                                                       }
                                                   })}/>
                                    </View>
                                    <View style={styles.fieldGroup}>
                                        <Text style={styles.fieldLabel}>Ag. Destino</Text>
                                        <TextInput style={styles.input} value={f.transferencia?.agenciaDestino || ''}
                                                   onChangeText={(v) => updateFormaPagamento(idx, {
                                                       transferencia: {
                                                           ...f.transferencia,
                                                           agenciaDestino: v
                                                       }
                                                   })}/>
                                    </View>
                                    <View style={styles.fieldGroup}>
                                        <Text style={styles.fieldLabel}>Cta. Destino</Text>
                                        <TextInput style={styles.input} value={f.transferencia?.contaDestino || ''}
                                                   onChangeText={(v) => updateFormaPagamento(idx, {
                                                       transferencia: {
                                                           ...f.transferencia,
                                                           contaDestino: v
                                                       }
                                                   })}/>
                                    </View>
                                </View>
                            )}
                            {f.tipoPagamento === 'DEPOSITO' && (
                                <View style={styles.formaDetalhe}>
                                    <View style={styles.fieldGroup}>
                                        <Text style={styles.fieldLabel}>Data</Text>
                                        <TextInput style={styles.input} value={f.deposito?.data || ''}
                                                   onChangeText={(v) => updateFormaPagamento(idx, {
                                                       deposito: {
                                                           ...f.deposito,
                                                           data: v
                                                       }
                                                   })} placeholder="AAAA-MM-DD"/>
                                    </View>
                                    <View style={styles.fieldGroup}>
                                        <Text style={styles.fieldLabel}>Ag. Destino</Text>
                                        <TextInput style={styles.input} value={f.deposito?.agenciaDestino || ''}
                                                   onChangeText={(v) => updateFormaPagamento(idx, {
                                                       deposito: {
                                                           ...f.deposito,
                                                           agenciaDestino: v
                                                       }
                                                   })}/>
                                    </View>
                                    <View style={styles.fieldGroup}>
                                        <Text style={styles.fieldLabel}>Cta. Destino</Text>
                                        <TextInput style={styles.input} value={f.deposito?.contaDestino || ''}
                                                   onChangeText={(v) => updateFormaPagamento(idx, {
                                                       deposito: {
                                                           ...f.deposito,
                                                           contaDestino: v
                                                       }
                                                   })}/>
                                    </View>
                                </View>
                            )}
                            {f.tipoPagamento === 'BOLETO' && (
                                <View style={styles.formaDetalhe}>
                                    <View style={styles.fieldGroup}>
                                        <Text style={styles.fieldLabel}>Cód. Barras</Text>
                                        <TextInput style={styles.input} value={f.boleto?.barCode || ''}
                                                   onChangeText={(v) => updateFormaPagamento(idx, {
                                                       boleto: {
                                                           ...f.boleto,
                                                           barCode: v
                                                       }
                                                   })}/>
                                    </View>
                                </View>
                            )}
                            {state.formasPagamento.length > 1 && (
                                <Pressable onPress={() => removeFormaPagamento(idx)} style={styles.removeButton}>
                                    <Text style={styles.removeText}>Remover</Text>
                                </Pressable>
                            )}
                        </View>
                    ))}
                    <Pressable style={styles.secondaryButton} onPress={addFormaPagamento}>
                        <Text style={styles.secondaryButtonText}>+ Adicionar forma de pagamento</Text>
                    </Pressable>

                    <View style={styles.totaisParcelas}>
                        <Text>Valor recebido: <Text style={styles.bold}>{money(valorRecebido)}</Text>
                            {state.calculo && troco > 0 && <Text> — Troco: {money(troco)}</Text>}
                        </Text>
                    </View>

                    <Pressable
                        style={[styles.primaryButton, (!state.calculo || valorRecebido < (state.calculo?.valorCobrado ? ? Infinity)) && styles.buttonDisabled]}
                        disabled={loading || !state.calculo || valorRecebido < (state.calculo?.valorCobrado ? ? Infinity)}
                        onPress={registrarPagamento}
                    >
                        <Text style={styles.primaryButtonText}>Confirmar Pagamento</Text>
                    </Pressable>
                </View>
            )}

            {state.movSubTab === 'extra' && (
                <View>
                    <View style={styles.fieldGroup}>
                        <Text style={styles.fieldLabel}>Descrição / Histórico *</Text>
                        <TextInput style={styles.input} value={state.historico}
                                   onChangeText={(v) => setField('historico', v)}
                                   placeholder="Descrição da movimentação"/>
                    </View>
                    <View style={styles.fieldGroup}>
                        <Text style={styles.fieldLabel}>Valor *</Text>
                        <TextInput style={styles.input} value={state.valorExtra}
                                   onChangeText={(v) => setField('valorExtra', v)} keyboardType="numeric"/>
                    </View>
                    <AutoComplete
                        label="Tipo de Movimento *"
                        placeholder="Buscar movimento..."
                        value={state.movimentoId ? {id: Number(state.movimentoId), label: ''} : null}
                        onChange={(opt) => {
                            setField('movimentoId', opt ? String(opt.id) : '');
                            setMovimentoSearch(opt?.label || '');
                        }}
                        fetchOptions={fetchMovimento}
                        minChars={2}
                        style={styles.autoComplete}
                    />
                    <View style={styles.fieldGroup}>
                        <Text style={styles.fieldLabel}>Forma de Pagamento</Text>
                        <AutoComplete
                            label=""
                            placeholder="Tipo"
                            value={state.tipoPagamentoExtra ? {
                                id: TIPOS_PAGAMENTO.findIndex(t => t.value === state.tipoPagamentoExtra),
                                label: state.tipoPagamentoExtra
                            } : null}
                            onChange={(opt) => {
                                const tp = TIPOS_PAGAMENTO[opt?.id ? ? 0];
                                if (tp) setField('tipoPagamentoExtra', tp.value);
                            }}
                            fetchOptions={async () => TIPOS_PAGAMENTO.map((t, i) => ({id: i, label: t.label}))}
                            minChars={0}
                            style={styles.autoCompleteSmall}
                        />
                    </View>
                    <Pressable style={styles.primaryButton} onPress={registrarMovimentacaoExtra} disabled={loading}>
                        <Text style={styles.primaryButtonText}>Registrar Movimentação</Text>
                    </Pressable>
                </View>
            )}

            {state.movSubTab === 'sangria' && (
                <View>
                    <View style={styles.fieldGroup}>
                        <Text style={styles.fieldLabel}>Valor da Sangria *</Text>
                        <TextInput style={styles.input} value={state.valorSangria}
                                   onChangeText={(v) => setField('valorSangria', v)} keyboardType="numeric"/>
                    </View>
                    <Pressable style={styles.primaryButton} onPress={registrarSangria} disabled={loading}>
                        <Text style={styles.primaryButtonText}>Registrar Sangria</Text>
                    </Pressable>
                </View>
            )}
        </ScrollView>
    );

    // Step 3 - Fechamento
    const passo3 = (
        <ScrollView style={styles.scrollView}>
            {caixa && <Text style={styles.sectionTitle}>Totais do Caixa #{caixa.idCaixaUnidade}</Text>}
            {!state.totais && (
                <Pressable style={styles.secondaryButton} onPress={carregarTotais} disabled={loading}>
                    <Text style={styles.secondaryButtonText}>Carregar totais</Text>
                </Pressable>
            )}
            {loading && <ActivityIndicator style={styles.activityIndicator}/>}
            {state.totais && (
                <View style={styles.totaisCard}>
                    <Text>Fundo de Caixa: {money(state.totais.totalFundoCaixa)}</Text>
                    <Text>Dinheiro: {money(state.totais.totalDinheiro)}</Text>
                    <Text>Cheque: {money(state.totais.totalCheque)}</Text>
                    <Text>Cartão: {money(state.totais.totalCartao)}</Text>
                    <Text>Boleto: {money(state.totais.totalBoleto)}</Text>
                    <Text>Transferência: {money(state.totais.totalTransferencia)}</Text>
                    <Text>Depósito: {money(state.totais.totalDeposito)}</Text>
                    <Text>Sangria: {money(state.totais.totalSangria)}</Text>
                    <Text>Desconto concedido: {money(state.totais.totalDesconto)}</Text>
                    <Text>Multa/Juros recebidos: {money(state.totais.totalJurosMulta)}</Text>
                    <Text style={styles.bold}>Total Dinheiro em Caixa: {money(state.totais.totalDinheiroCaixa)}</Text>
                    <Text style={styles.bold}>Valor Total: {money(state.totais.totalValor)}</Text>
                    <Text style={styles.bold}>Valor a Pagar/Receber: {money(state.totais.totalValorPagar)}</Text>
                    <Pressable style={styles.secondaryButton} onPress={carregarTotais} disabled={loading}>
                        <Text style={styles.secondaryButtonText}>Atualizar totais</Text>
                    </Pressable>
                </View>
            )}
            {caixa && !caixa.dataFechamento && (
                <Pressable style={[styles.primaryButton, loading && styles.buttonDisabled]} onPress={fecharCaixa}
                           disabled={loading}>
                    <Text style={styles.primaryButtonText}>Fechar Caixa</Text>
                </Pressable>
            )}
        </ScrollView>
    );

    const steps: WizardStep[] = [
        {
            key: 'configuracao',
            label: 'Configuração do Caixa',
            content: passo1,
            validate: validateStep1,
        },
        {
            key: 'movimentacao',
            label: 'Movimentação Financeira',
            content: passo2,
            validate: validateStep2,
        },
        {
            key: 'fechamento',
            label: 'Fechamento do Caixa',
            nextLabel: 'Fechar Caixa',
            content: passo3,
            onEnter: carregarTotais,
            validate: validateStep3,
        },
    ];

    return (
        <View style={styles.page}>
            <Text style={styles.title}>Fechamento de Caixa</Text>

            {erro && (
                <View style={styles.errorBanner}>
                    <Text style={styles.errorText}>{erro}</Text>
                    <Pressable onPress={() => setErro(null)} style={styles.errorClose}>
                        <Text style={styles.errorCloseText}>✕</Text>
                    </Pressable>
                </View>
            )}
            {mensagem && (
                <View style={styles.successBanner}>
                    <Text style={styles.successText}>{mensagem}</Text>
                    <Pressable onPress={() => setMensagem(null)} style={styles.successClose}>
                        <Text style={styles.successCloseText}>✕</Text>
                    </Pressable>
                </View>
            )}

            <Wizard
                initialData={state}
                onDataChange={setFields}
                steps={steps}
                onComplete={fecharCaixa}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    page: {flex: 1, padding: 12, backgroundColor: '#ffffff'},
    title: {fontSize: 18, fontWeight: '700', marginBottom: 8},
    scrollView: {flex: 1},
    stepDescription: {color: '#666', marginBottom: 16, fontSize: 14},
    fieldRow: {flexDirection: 'row', gap: 12, flexWrap: 'wrap', marginBottom: 12},
    fieldGroup: {flex: 1, minWidth: 160, marginBottom: 12},
    fieldLabel: {fontSize: 12, color: '#555', marginBottom: 4, fontWeight: '500'},
    input: {
        borderWidth: 1,
        borderColor: '#d3d3d3',
        borderRadius: 6,
        paddingHorizontal: 10,
        paddingVertical: 10,
        fontSize: 14
    },
    autoComplete: {flex: 1, minWidth: 160},
    autoCompleteSmall: {minWidth: 140},
    caixaInfo: {
        padding: 16,
        backgroundColor: '#e8f5e9',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#c8e6c9',
        marginBottom: 16
    },
    caixaConfig: {
        padding: 16,
        backgroundColor: '#fff3e0',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ffe0b2',
        marginBottom: 16
    },
    hint: {color: '#e65100', marginBottom: 12, fontSize: 13},
    bold: {fontWeight: '700'},
    statusAberto: {color: '#28a745', fontWeight: '700'},
    statusFechado: {color: '#dc3545', fontWeight: '700'},
    warning: {
        padding: 12,
        backgroundColor: '#fff3cd',
        borderWidth: 1,
        borderColor: '#ffeeba',
        borderRadius: 6,
        color: '#856404',
        marginBottom: 12,
        fontSize: 13
    },
    sectionTitle: {fontSize: 14, fontWeight: '700', marginTop: 12, marginBottom: 8},
    subTabsRow: {flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 12},
    chip: {
        borderWidth: 1,
        borderColor: '#d3d3d3',
        borderRadius: 16,
        paddingHorizontal: 12,
        paddingVertical: 8,
        marginRight: 6
    },
    chipActive: {backgroundColor: '#2a5a88', borderColor: '#265a88'},
    chipText: {fontSize: 12, color: '#333'},
    chipTextActive: {color: '#ffffff', fontWeight: '700'},
    formaPagamentoRow: {
        flexDirection: 'row',
        gap: 8,
        flexWrap: 'wrap',
        marginBottom: 10,
        padding: 12,
        backgroundColor: '#f8f9fa',
        borderRadius: 6,
        borderWidth: 1,
        borderColor: '#e9ecef'
    },
    formaDetalhe: {
        flexDirection: 'row',
        gap: 8,
        flexWrap: 'wrap',
        marginTop: 8,
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: '#ddd',
        width: '100%'
    },
    removeButton: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        backgroundColor: '#dc3545',
        borderRadius: 4,
        marginTop: 4
    },
    removeText: {color: '#fff', fontSize: 12},
    calculoCard: {
        padding: 12,
        backgroundColor: '#f8f9fa',
        borderRadius: 6,
        borderWidth: 1,
        borderColor: '#e9ecef',
        marginVertical: 8
    },
    totaisParcelas: {padding: 12, backgroundColor: '#f8f9fa', borderRadius: 6, marginVertical: 12},
    totaisCard: {
        borderWidth: 1,
        borderColor: '#e0e0e0',
        borderRadius: 8,
        padding: 16,
        backgroundColor: '#fafafa',
        marginTop: 8
    },
    primaryButton: {
        backgroundColor: '#2a5a88',
        borderRadius: 6,
        paddingVertical: 14,
        alignItems: 'center',
        marginTop: 12
    },
    primaryButtonText: {color: '#ffffff', fontWeight: '700', fontSize: 15},
    secondaryButton: {
        borderWidth: 1,
        borderColor: '#2a5a88',
        borderRadius: 6,
        paddingVertical: 12,
        alignItems: 'center',
        marginTop: 8,
        marginBottom: 8
    },
    secondaryButtonText: {color: '#2a5a88', fontWeight: '700', fontSize: 14},
    buttonDisabled: {opacity: 0.5},
    errorBanner: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 12,
        backgroundColor: '#f8d7da',
        borderWidth: 1,
        borderColor: '#f5c6cb',
        borderRadius: 6,
        marginBottom: 12
    },
    errorText: {color: '#721c24', flex: 1},
    errorClose: {padding: 4},
    errorCloseText: {color: '#721c24', fontWeight: '700'},
    successBanner: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 12,
        backgroundColor: '#d4edda',
        borderWidth: 1,
        borderColor: '#c3e6cb',
        borderRadius: 6,
        marginBottom: 12
    },
    successText: {color: '#155724', flex: 1},
    successClose: {padding: 4},
    successCloseText: {color: '#155724', fontWeight: '700'},
    activityIndicator: {marginVertical: 16},
});