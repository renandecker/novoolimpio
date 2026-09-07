import {useEffect, useState} from 'react';

import {api} from '../../shared/services/api';

import {useAuth} from '../../features/auth/auth';

import {PermissionGate} from '../../shared/services/permissions';

import '../../shared/components/Wizard.css';

import {useQuery, useQueryClient} from '@tanstack/react-query';



// ==== Tipos espelhando os DTOs REST de financeiro.zip (módulo caixa) ====

type Caixa = {

    id: number; data: string; dataFechamento: string | null; usuarioId: number; fundoCaixa: number;

    impressoraId: number | null; unidadeId: number; idCaixaUnidade: number; documento: string | null;

};



type TipoPagamento = 'DINHEIRO' | 'CHEQUE' | 'CARTAO' | 'BOLETO' | 'PIX' | 'TRANFERENCIA' | 'DEPOSITO';

const TIPOS_PAGAMENTO: { value: TipoPagamento; label: string }[] = [

    {value: 'DINHEIRO', label: 'Dinheiro'}, {value: 'CHEQUE', label: 'Cheque'}, {value: 'CARTAO', label: 'Cartão'},

    {value: 'BOLETO', label: 'Boleto'}, {value: 'PIX', label: 'Pix'}, {value: 'TRANFERENCIA', label: 'Transferência'},

    {value: 'DEPOSITO', label: 'Depósito'},

];



type FormaPagamentoLinha = { tipoPagamento: TipoPagamento; valor: string; documento: string };



type FechamentoCaixaTotais = {

    caixaId: number; totalFundoCaixa: number; totalDinheiro: number; totalCheque: number; totalCartao: number;

    totalBoleto: number; totalTransferencia: number; totalDeposito: number; totalSangria: number;

    totalDinheiroCaixa: number; totalValor: number; totalDesconto: number; totalJurosMulta: number; totalValorPagar: number;

};



const money = (v: number | undefined | null) =>

    (v ?? 0).toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'});



const STEPS = [

    {key: 'configuracao', label: 'Configurações impressora'},

    {key: 'movimentacao', label: 'Movimentação Financeira'},

    {key: 'fechamento', label: 'Fechamento Caixa'},

] as

const ;



export default function ViewPagamentoFechamentoCaixaListScreen() {

    const {session} = useAuth();

    void session;

    const queryClient = useQueryClient();



    // Sessão ainda não carrega usuarioId/unidadeId (ver auth.tsx) - mantidos editáveis até que o

    // módulo básico exponha esses campos no token/sessão.

    const [usuarioId, setUsuarioId] = useState<string>('');

    const [unidadeId, setUnidadeId] = useState<string>('');

    const [impressoraId, setImpressoraId] = useState<number | null>(null);



    // Combo search for Usuario

    const [usuarioOptions, setUsuarioOptions] = useState<Array<{ id: number; nome: string }>>([]);

    const [loadingUsuario, setLoadingUsuario] = useState(false);

    const usuarioQuery = useQuery({

        queryKey: ['combo-usuario'],

        queryFn: async () => {

            setLoadingUsuario(true);

            try {

                const {data} = await api.get('/api/view/usuario/listUsuario');

                setUsuarioOptions(data.map((u: any) => ({id: u.id, nome: u.nome})));

            } catch {

                setUsuarioOptions([])

            }

            finally {

                setLoadingUsuario(false);

            }

        },

    });

    // Combo search for Unidade

    const [unidadeOptions, setUnidadeOptions] = useState<Array<{ id: number; nome: string }>>([]);

    const [loadingUnidade, setLoadingUnidade] = useState(false);

    const unidadeQuery = useQuery({

        queryKey: ['combo-unidade'],

        queryFn: async () => {

            setLoadingUnidade(true);

            try {

                const {data} = await api.get('/api/view/unidade/listUnidade');

                setUnidadeOptions(data.map((u: any) => ({id: u.id, nome: u.sucinto})));

            } catch {

                setUnidadeOptions([]);

            }

            finally {

                setLoadingUnidade(false);

            }

        },

        enabled: false,

    });

    // Combo search for Impressora

    const [impressoraOptions, setImpressoraOptions] = useState<Array<{ id: number; nome: string }>>([]);

    const [loadingImpressora, setLoadingImpressora] = useState(false);

    const impressoraQuery = useQuery({

        queryKey: ['combo-impressora'],

        queryFn: async () => {

            setLoadingImpressora(true);

            try {

                const {data} = await api.get('/api/view/impressora/listImpressora');

                setImpressoraOptions(data.map((i: any) => ({id: i.id, nome: i.sicrito})));

            } catch {

                setImpressoraOptions([]);

            }

            finally {

                setLoadingImpressora(false);

            }

        },

        enabled: false,

    });



    useEffect(() => {

        queryClient.prefetchQuery({queryKey: ['combo-usuario']});

        queryClient.prefetchQuery({queryKey: ['combo-unidade']});

        queryClient.prefetchQuery({queryKey: ['combo-impressora']});

    }, [queryClient]);



    const [step, setStep] = useState<number>(0);

    const [caixa, setCaixa] = useState<Caixa | null>(null);

    const [loading, setLoading] = useState(false);

    const [erro, setErro] = useState<string | null>(null);

    const [mensagem, setMensagem] = useState<string | null>(null);



    // ---- Passo 1: Configurações impressora / abertura de caixa ----

    const [fundoCaixa, setFundoCaixa] = useState('');



    useEffect(() => {

        if (!usuarioId || !unidadeId) return;

        (async () => {

            try {

                const {data: caixaId} = await api.get<number | null>('/api/financeiro/caixa/buscar-abertura-caixa-com-usuario-unidade', {

                    params: {usuarioId, unidadeId},

                });

                if (caixaId) {

                    const {data} = await api.get<Caixa>(`/api/financeiro/caixa/${caixaId}`);

                    setCaixa(data);

                    setImpressoraId(data.impressoraId ?? null);

                } else {

                    try {

                        const {data: impressoraDoId} = await api.get<number | null>('/api/financeiro/impressora/buscar-impressoras-unidade', {

                            params: {unidadeId},

                        });

                        if (impressoraDoId != null) setImpressoraId(impressoraDoId);

                    } catch (err) { console.warn('Erro ao buscar impressora da unidade:', err); }

                }

                const {data: sugerido} = await api.get<number | null>('/api/financeiro/caixa/fundo-caixa-sugerido', {

                    params: {usuarioId, unidadeId},

                });

                if (sugerido != null) setFundoCaixa(String(sugerido));

            } catch {

                // Sem caixa aberto ainda / configuração não encontrada - segue no fluxo de abertura.

            }

        })();

    }, [usuarioId, unidadeId]);



    async function abrirNovoCaixa() {

        setErro(null);

        setLoading(true);

        try {

            const {data} = await api.post<Caixa>('/api/financeiro/caixa/abrir-novo-caixa', {

                data: new Date().toISOString(), usuarioId: Number(usuarioId), unidadeId: Number(unidadeId),

                fundoCaixa: Number(fundoCaixa || 0), impressoraId: impressoraId ? Number(impressoraId) : null,

            });

            setCaixa(data);

            setMensagem('Caixa aberto com sucesso!');

            setStep(1);

        } catch (e: any) {

            setErro(e?.response?.data?.message ?? 'Ocorreu um erro ao abrir o caixa!');

        } finally {

            setLoading(false);

        }

    }



    async function reabrirCaixa() {

        if (!caixa) return;

        setLoading(true);

        setErro(null);

        try {

            const {data} = await api.post<Caixa>(`/api/financeiro/caixa/${caixa.id}/abrir`);

            setCaixa(data);

            setMensagem('Caixa aberto com sucesso!');

        } catch {

            setErro('Ocorreu um erro ao abrir o caixa!');

        } finally {

            setLoading(false);

        }

    }



    // ---- Passo 2: Movimentação Financeira ----

    const [movSubTab, setMovSubTab] = useState<'parcela' | 'extra' | 'sangria'>('parcela');



    // Pagamento de parcela (equivalente a EfetuarPagamentoController)

    const [parcelaId, setParcelaId] = useState('');

    const [valorParcela, setValorParcela] = useState('');

    const [dataVencimento, setDataVencimento] = useState('');

    const [parcelaSequencia, setParcelaSequencia] = useState('1');

    const [percentualDesconto, setPercentualDesconto] = useState('0');

    const [percentualMulta, setPercentualMulta] = useState('2');

    const [percentualJuros, setPercentualJuros] = useState('1');

    const [diasTolerancia, setDiasTolerancia] = useState('0');

    const [calculo, setCalculo] = useState<{ desconto: number; multa: number; juros: number; valorCobrado: number } | null>(null);

    const [formasPagamento, setFormasPagamento] = useState<FormaPagamentoLinha[]>([{

        tipoPagamento: 'DINHEIRO',

        valor: '',

        documento: ''

    }]);



    const valorRecebido = formasPagamento.reduce((acc, f) => acc + (Number(f.valor) || 0), 0);

    const troco = calculo ? Math.max(0, valorRecebido - calculo.valorCobrado) : 0;



    async function calcularValores() {

        setErro(null);

        try {

            const {data} = await api.post('/api/financeiro/caixa/calcular-valores-parcela', {

                valor: Number(valorParcela || 0),

                dataVencimento: dataVencimento || null,

                parcelaSequencia: Number(parcelaSequencia || 0),

                percentualDesconto: Number(percentualDesconto || 0),

                percentualMulta: Number(percentualMulta || 0),

                percentualJuros: Number(percentualJuros || 0),

                diasToleranciaMulta: Number(diasTolerancia || 0),

                feriadoNoDiaAnteriorVencimento: false,

            });

            setCalculo(data);

        } catch {

            setErro('Não foi possível calcular os valores da parcela.');

        }

    }



    function addFormaPagamento() {

        setFormasPagamento((list) => [...list, {tipoPagamento: 'DINHEIRO', valor: '', documento: ''}]);

    }



    function removeFormaPagamento(idx: number) {

        setFormasPagamento((list) => list.filter((_, i) => i !== idx));

    }



    function updateFormaPagamento(idx: number, patch: Partial<FormaPagamentoLinha>) {

        setFormasPagamento((list) => list.map((f, i) => (i === idx ? {...f, ...patch} : f)));

    }



    async function registrarPagamento() {

        if (!caixa || !calculo) return;

        setErro(null);

        setLoading(true);

        try {

            await api.post('/api/financeiro/caixa/registrar-pagamento-parcela', {

                caixaId: caixa.id,

                parcelaId: Number(parcelaId),

                usuarioId: Number(usuarioId),

                valorCobrado: calculo.valorCobrado,

                desconto: calculo.desconto,

                multaJuros: calculo.multa + calculo.juros,

                movimentacoes: formasPagamento

                    .filter((f) => Number(f.valor) > 0)

                    .map((f) => ({

                        tipoPagamento: f.tipoPagamento,

                        valor: Number(f.valor),

                        documento: f.documento || null

                    })),

            });

            setMensagem('Pagamento registrado com sucesso!');

            setParcelaId('');

            setValorParcela('');

            setDataVencimento('');

            setCalculo(null);

            setFormasPagamento([{tipoPagamento: 'DINHEIRO', valor: '', documento: ''}]);

        } catch (e: any) {

            setErro(e?.response?.data?.message ?? 'Ocorreu um erro ao registrar esta movimentação!');

        } finally {

            setLoading(false);

        }

    }



    // Movimentação extra (entrada/saída manual - equivalente a CaixaController.salvar)

    const [historico, setHistorico] = useState('');

    const [valorExtra, setValorExtra] = useState('');

    const [movimentoId, setMovimentoId] = useState('');

    const [tipoPagamentoExtra, setTipoPagamentoExtra] = useState<TipoPagamento>('DINHEIRO');



    async function registrarMovimentacaoExtra() {

        if (!caixa) return;

        setErro(null);

        setLoading(true);

        try {

            await api.post('/api/financeiro/movimentacao-financeira/movimentacao-extra', {

                historico, valor: Number(valorExtra || 0), movimentoId: Number(movimentoId),

                tipoPagamento: tipoPagamentoExtra, caixaId: caixa.id, usuarioId: Number(usuarioId), valorTroco: 0,

            });

            setMensagem('Movimentação registrada com sucesso!');

            setHistorico('');

            setValorExtra('');

            setMovimentoId('');

        } catch (e: any) {

            setErro(e?.response?.data?.message ?? 'Ocorreu um erro ao registrar esta movimentação!');

        } finally {

            setLoading(false);

        }

    }



    // Sangria

    const [valorSangria, setValorSangria] = useState('');



    async function registrarSangria() {

        if (!caixa) return;

        setErro(null);

        setLoading(true);

        try {

            await api.post(`/api/financeiro/caixa/${caixa.id}/sangria`, {valor: Number(valorSangria || 0)});

            setMensagem('Sangria registrada com sucesso!');

            setValorSangria('');

            await carregarTotais();

        } catch (e: any) {

            setErro(e?.response?.data?.message ?? 'Dinheiro em caixa insuficiente!');

        } finally {

            setLoading(false);

        }

    }



    // ---- Passo 3: Fechamento de caixa ----

    const [totais, setTotais] = useState<FechamentoCaixaTotais | null>(null);



    async function carregarTotais() {

        if (!caixa) return;

        setLoading(true);

        setErro(null);

        try {

            const {data} = await api.get<FechamentoCaixaTotais>(`/api/financeiro/caixa/${caixa.id}/totais-fechamento`);

            setTotais(data);

        } catch {

            setErro('Não foi possível carregar os totais do caixa.');

        } finally {

            setLoading(false);

        }

    }



    async function fecharCaixa() {

        if (!caixa) return;

        setErro(null);

        setLoading(true);

        try {

            const {data} = await api.post<Caixa>(`/api/financeiro/caixa/${caixa.id}/fechar`);

            setCaixa(data);

            setMensagem('Caixa fechado com sucesso!');

        } catch {

            setErro('Ocorreu um erro ao fechar o caixa!');

        } finally {

            setLoading(false);

        }

    }



    useEffect(() => {

        if (step === 2) carregarTotais();

        /* eslint-disable-next-line react-hooks/exhaustive-deps */

    }, [step, caixa?.id]);



    function goToStep(index: number) {

        if (index === 1 && !caixa) {

            setErro('Você precisa configurar uma impressora e o fundo de caixa antes!');

            return;

        }

        setErro(null);

        setStep(index);

    }



    return (

        <PermissionGate permission="READ">

            <main>

                <h1>Fechamento Caixa</h1>



                <div className="wizard">

                    <div className="wizard-steps">

                        {STEPS.map((s, i) => (

                            <div

                                key={s.key}

                                className={`wizard-step ${i === step ? 'wizard-step-active' : i < step ? 'wizard-step-done' : 'wizard-step-pending'}`}

                                onClick={() => goToStep(i)}

                            >

                                <span className="wizard-step-number">{i + 1}</span>

                                {s.label}

                            </div>

                        ))}

                    </div>



                    {erro && <p style={{color: '#b00020'}}>{erro}</p>}

                    {mensagem && <p style={{color: '#2e7d32'}}>{mensagem}</p>}



                    <div className="wizard-content">

                        {step === 0 && (

                            <section>

                                <p>Informe o usuário e a unidade para localizar (ou abrir) o caixa do dia.</p>

                                <div style={{display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 12}}>

                                    <label>Usuário <select

                                        value={usuarioId}

                                        onChange={(e) => setUsuarioId(e.target.value)}

                                        disabled={loadingUsuario}

                                    >

                                        <option value="">-- Selecione --</option>

                                        {loadingUsuario ? <option>Carregando...</option> : usuarioOptions.map((u) => (

                                            <option key={u.id} value={u.id}>{u.nome}</option>

                                        ))}

                                    </select></label>

                                    <label>Unidade <select

                                        value={unidadeId}

                                        onChange={(e) => setUnidadeId(e.target.value)}

                                        disabled={loadingUnidade}

                                    >

                                        <option value="">-- Selecione --</option>

                                        {loadingUnidade ? <option>Carregando...</option> : unidadeOptions.map((u) => (

                                            <option key={u.id} value={u.id}>{u.nome}</option>

                                        ))}

                                    </select></label>

                                </div>



                                {caixa ? (

                                    <div>

                                        <p>

                                            Caixa <strong>#{caixa.idCaixaUnidade}</strong> aberto

                                            em {new Date(caixa.data).toLocaleString('pt-BR')} â�'��??{' '}

                                            {caixa.dataFechamento ?

                                                <strong style={{color: '#b00020'}}>Fechado</strong> :

                                                <strong style={{color: '#2e7d32'}}>Aberto</strong>}

                                        </p>

                                        <p>Fundo de caixa: {money(caixa.fundoCaixa)}</p>

                                        {caixa.dataFechamento && (

                                            <button className="wizard-btn-next" onClick={reabrirCaixa}

                                                    disabled={loading}>Abrir caixa novamente</button>

                                        )}

                                    </div>

                                ) : (

                                    <div>

                                        <p>Nenhum caixa aberto hoje para este usuário/unidade. Configure a impressora e

                                            o fundo de caixa para abrir um novo caixa.</p>

                                        <div style={{display: 'flex', gap: 12, flexWrap: 'wrap'}}>

                                            <label>Impressora <select

                                                value={impressoraId !== null ? String(impressoraId) : ''}

                                                onChange={(e) => setImpressoraId(e.target.value ? Number(e.target.value) : null)}

                                                disabled={loadingImpressora}

                                            >

                                                <option value="">-- Selecione --</option>

                                                {loadingImpressora ?

                                                    <option>Carregando...</option> : impressoraOptions.map((imp) => (

                                                        <option key={imp.id} value={imp.id}>{imp.nome}</option>

                                                    ))}

                                            </select></label>

                                            <label>Fundo de Caixa <input value={fundoCaixa}

                                                                         onChange={(e) => setFundoCaixa(e.target.value)}/></label>

                                        </div>

                                        <button className="wizard-btn-next" onClick={abrirNovoCaixa}

                                                disabled={loading || !usuarioId || !unidadeId}>

                                            Abrir Caixa

                                        </button>

                                    </div>

                                )}

                            </section>

                        )}



                        {step === 1 && caixa && (

                            <section>

                                <div className="wizard-steps" style={{borderBottom: 'none', marginBottom: 8}}>

                                    <div

                                        className={`wizard-step ${movSubTab === 'parcela' ? 'wizard-step-active' : ''}`}

                                        onClick={() => setMovSubTab('parcela')}>Pagamento de Parcela

                                    </div>

                                    <div className={`wizard-step ${movSubTab === 'extra' ? 'wizard-step-active' : ''}`}

                                         onClick={() => setMovSubTab('extra')}>Movimentação Extra

                                    </div>

                                    <div

                                        className={`wizard-step ${movSubTab === 'sangria' ? 'wizard-step-active' : ''}`}

                                        onClick={() => setMovSubTab('sangria')}>Sangria

                                    </div>

                                </div>



                                {movSubTab === 'parcela' && (

                                    <div>

                                        <div style={{display: 'flex', gap: 12, flexWrap: 'wrap'}}>

                                            <label>Nº da Parcela <input value={parcelaId}

                                                                        onChange={(e) => setParcelaId(e.target.value)}/></label>

                                            <label>Valor <input value={valorParcela}

                                                                onChange={(e) => setValorParcela(e.target.value)}/></label>

                                            <label>Vencimento <input type="date" value={dataVencimento}

                                                                     onChange={(e) => setDataVencimento(e.target.value)}/></label>

                                            <label>Nº Parcela (0 = entrada) <input value={parcelaSequencia}

                                                                                   onChange={(e) => setParcelaSequencia(e.target.value)}/></label>

                                        </div>

                                        <div style={{display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 8}}>

                                            <label>% Desconto <input value={percentualDesconto}

                                                                     onChange={(e) => setPercentualDesconto(e.target.value)}/></label>

                                            <label>% Multa <input value={percentualMulta}

                                                                  onChange={(e) => setPercentualMulta(e.target.value)}/></label>

                                            <label>% Juros a.m. <input value={percentualJuros}

                                                                       onChange={(e) => setPercentualJuros(e.target.value)}/></label>

                                            <label>Dias tolerância <input value={diasTolerancia}

                                                                          onChange={(e) => setDiasTolerancia(e.target.value)}/></label>

                                        </div>

                                        <button onClick={calcularValores} style={{marginTop: 8}}>Calcular valores

                                        </button>



                                        {calculo && (

                                            <table style={{marginTop: 12}}>

                                                <tbody>

                                                <tr>

                                                    <td>Desconto</td>

                                                    <td>{money(calculo.desconto)}</td>

                                                </tr>

                                                <tr>

                                                    <td>Multa + Juros</td>

                                                    <td>{money(calculo.multa + calculo.juros)}</td>

                                                </tr>

                                                <tr>

                                                    <td><strong>Valor Cobrado</strong></td>

                                                    <td><strong>{money(calculo.valorCobrado)}</strong></td>

                                                </tr>

                                                </tbody>

                                            </table>

                                        )}



                                        <h3>Formas de pagamento</h3>

                                        {formasPagamento.map((f, idx) => (

                                            <div key={idx} style={{

                                                display: 'flex',

                                                gap: 8,

                                                marginBottom: 6,

                                                alignItems: 'center'

                                            }}>

                                                <select value={f.tipoPagamento}

                                                        onChange={(e) => updateFormaPagamento(idx, {tipoPagamento: e.target.value as TipoPagamento})}>

                                                    {TIPOS_PAGAMENTO.map((t) => <option key={t.value}

                                                                                        value={t.value}>{t.label}</option>)}

                                                </select>

                                                <input placeholder="Valor" value={f.valor}

                                                       onChange={(e) => updateFormaPagamento(idx, {valor: e.target.value})}/>

                                                {f.tipoPagamento !== 'DINHEIRO' && (

                                                    <input placeholder="Documento / nº" value={f.documento}

                                                           onChange={(e) => updateFormaPagamento(idx, {documento: e.target.value})}/>

                                                )}

                                                <button onClick={() => removeFormaPagamento(idx)}

                                                        disabled={formasPagamento.length === 1}>Remover

                                                </button>

                                            </div>

                                        ))}

                                        <button onClick={addFormaPagamento}>+ Adicionar forma de pagamento</button>



                                        <p>Valor

                                            recebido: <strong>{money(valorRecebido)}</strong>{calculo && troco > 0 && ` â�'��?? Troco: ${money(troco)}`}

                                        </p>



                                        <button

                                            className="wizard-btn-next"

                                            onClick={registrarPagamento}

                                            disabled={loading || !calculo || valorRecebido < (calculo?.valorCobrado ?? Infinity)}

                                        >

                                            Confirmar Pagamento

                                        </button>

                                    </div>

                                )}



                                {movSubTab === 'extra' && (

                                    <div>

                                        <div style={{display: 'flex', gap: 12, flexWrap: 'wrap'}}>

                                            <label>Descrição <input value={historico}

                                                                    onChange={(e) => setHistorico(e.target.value)}/></label>

                                            <label>Valor <input value={valorExtra}

                                                                onChange={(e) => setValorExtra(e.target.value)}/></label>

                                            <label>Movimento ID <input value={movimentoId}

                                                                       onChange={(e) => setMovimentoId(e.target.value)}/></label>

                                            <label>

                                                Forma de pagamento

                                                <select value={tipoPagamentoExtra}

                                                        onChange={(e) => setTipoPagamentoExtra(e.target.value as TipoPagamento)}>

                                                    {TIPOS_PAGAMENTO.map((t) => <option key={t.value}

                                                                                        value={t.value}>{t.label}</option>)}

                                                </select>

                                            </label>

                                        </div>

                                        <button className="wizard-btn-next" onClick={registrarMovimentacaoExtra}

                                                disabled={loading}>Registrar Movimentação

                                        </button>

                                    </div>

                                )}



                                {movSubTab === 'sangria' && (

                                    <div>

                                        <label>Valor da sangria <input value={valorSangria}

                                                                       onChange={(e) => setValorSangria(e.target.value)}/></label>

                                        <div>

                                            <button className="wizard-btn-next" onClick={registrarSangria}

                                                    disabled={loading}>Registrar Sangria

                                            </button>

                                        </div>

                                    </div>

                                )}



                                <div className="wizard-actions">

                                    <button className="wizard-btn-back" onClick={() => goToStep(0)}>Voltar</button>

                                    <button className="wizard-btn-next" onClick={() => goToStep(2)}>Ir para Fechamento

                                    </button>

                                </div>

                            </section>

                        )}



                        {step === 2 && caixa && (

                            <section>

                                <h3>Totais do Caixa #{caixa.idCaixaUnidade}</h3>

                                {totais ? (

                                    <table>

                                        <tbody>

                                        <tr>

                                            <td>Fundo de Caixa</td>

                                            <td>{money(totais.totalFundoCaixa)}</td>

                                        </tr>

                                        <tr>

                                            <td>Dinheiro</td>

                                            <td>{money(totais.totalDinheiro)}</td>

                                        </tr>

                                        <tr>

                                            <td>Cheque</td>

                                            <td>{money(totais.totalCheque)}</td>

                                        </tr>

                                        <tr>

                                            <td>Cartão</td>

                                            <td>{money(totais.totalCartao)}</td>

                                        </tr>

                                        <tr>

                                            <td>Boleto</td>

                                            <td>{money(totais.totalBoleto)}</td>

                                        </tr>

                                        <tr>

                                            <td>Transferência</td>

                                            <td>{money(totais.totalTransferencia)}</td>

                                        </tr>

                                        <tr>

                                            <td>Depósito</td>

                                            <td>{money(totais.totalDeposito)}</td>

                                        </tr>

                                        <tr>

                                            <td>Sangria</td>

                                            <td>{money(totais.totalSangria)}</td>

                                        </tr>

                                        <tr>

                                            <td>Desconto concedido</td>

                                            <td>{money(totais.totalDesconto)}</td>

                                        </tr>

                                        <tr>

                                            <td>Multa/Juros recebidos</td>

                                            <td>{money(totais.totalJurosMulta)}</td>

                                        </tr>

                                        <tr>

                                            <td><strong>Total Dinheiro em Caixa</strong></td>

                                            <td><strong>{money(totais.totalDinheiroCaixa)}</strong></td>

                                        </tr>

                                        </tbody>

                                    </table>

                                ) : <p>Carregando totais...</p>}



                                <div className="wizard-actions">

                                    <button className="wizard-btn-back" onClick={() => goToStep(1)}>Voltar</button>

                                    <button onClick={carregarTotais} disabled={loading}>Atualizar totais</button>

                                    {!caixa.dataFechamento && (

                                        <button className="wizard-btn-next" onClick={fecharCaixa}

                                                disabled={loading}>Fechar Caixa</button>

                                    )}

                                </div>

                            </section>

                        )}

                    </div>

                </div>

            </main>

        </PermissionGate>

    );

}


