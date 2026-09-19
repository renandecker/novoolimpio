import React, {useEffect, useState} from 'react';
import {
    ActivityIndicator,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    Text as RNText
} from 'react-native';
import {api} from '../api';
import {Wizard} from '../Wizard';
import type {WizardStep} from '../Wizard';
import {useQuery, useQueryClient} from '@tanstack/react-query';

type Caixa = {
    id: number; data: string; dataFechamento: string | null; usuarioId: number; fundoCaixa: number;
    impressoraId: number | null; unidadeId: number; idCaixaUnidade: number; documento: string | null;
};

type TipoPagamento = 'DINHEIRO' | 'CHEQUE' | 'CARTAO' | 'BOLETO' | 'PIX' | 'TRANFERENCIA' | 'DEPOSITO';
const TIPOS_PAGAMENTO: { value: TipoPagamento; label: string }[] = [
    {value: 'DINHEIRO', label: 'Dinheiro'}, {value: 'CHEQUE', label: 'Cheque'}, {value: 'CARTAO', label: 'Cartão'},
    {value: 'BOLETO', label: 'Boleto'}, {value: 'PIX', label: 'Pix'}, {value: 'TRANFERENCIA', label: 'Transf.'},
    {value: 'DEPOSITO', label: 'Depósito'},
];

type FormaPagamentoLinha = { tipoPagamento: TipoPagamento; valor: string; documento: string };

type FechamentoCaixaTotais = {
    totalFundoCaixa: number; totalDinheiro: number; totalCheque: number; totalCartao: number;
    totalBoleto: number; totalTransferencia: number; totalDeposito: number; totalSangria: number;
    totalDinheiroCaixa: number; totalDesconto: number; totalJurosMulta: number;
};

const money = (v: number | undefined | null) => (v ?? 0).toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'});

function Field({label, value, onChangeText, keyboardType}: { label: string; value: string; onChangeText: (v: string) => void; keyboardType?: 'numeric' | 'default' }) {
    return (
        <View style={styles.field}>
            <Text style={styles.fieldLabel}>{label}</Text>
            <TextInput style={styles.input} value={value} onChangeText={onChangeText} keyboardType={keyboardType}/>
        </View>
    );
}

function ChipSelect<T extends string>({options, value, onChange}: { options: { value: T; label: string }[]; value: T; onChange: (v: T) => void }) {
    return (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{marginBottom: 8}}>
            {options.map((o) => (
                <Pressable key={o.value} onPress={() => onChange(o.value)}
                           style={[styles.chip, value === o.value && styles.chipActive]}>
                    <Text style={[styles.chipText, value === o.value && styles.chipTextActive]}>{o.label}</Text>
                </Pressable>
            ))}
        </ScrollView>
    );
}

export default function ViewPagamentoFechamentoCaixaListScreen() {
    const queryClient = useQueryClient();
    const [usuarioId, setUsuarioId] = useState('');
    const [unidadeId, setUnidadeId] = useState('');
    const [caixa, setCaixa] = useState<Caixa | null>(null);
    const [stepIndex, setStepIndex] = useState(0);
    const [loading, setLoading] = useState(false);
    const [erro, setErro] = useState('');
    const [mensagem, setMensagem] = useState('');

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
                setUsuarioOptions([]);
            }
            finally {
                setLoadingUsuario(false);
            }
        },
        enabled: false,
    });
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
    const [impressoraOptions, setImpressoraOptions] = useState<Array<{ id: number; nome: string }>>([]);
    const [loadingImpressora, setLoadingImpressora] = useState(false);
    const impressoraQuery = useQuery({
        queryKey: ['combo-impressora'],
        queryFn: async () => {
            setLoadingImpressora(true);
            try {
                const {data} = await api.get('/api/view/impressora/listImpressora');
                setImpressoraOptions(data.map((i: any) => ({id: i.id, nome: i.sucinto})));
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

    const [fundoCaixa, setFundoCaixa] = useState('');
    const [impressoraId, setImpressoraId] = useState('');

    useEffect(() => {
        const uId = usuarioId ? Number(usuarioId) : null;
        const unId = unidadeId ? Number(unidadeId) : null;
        if (!uId || isNaN(uId) || !unId || isNaN(unId)) return;
        (async () => {
            try {
                const {data: caixaId} = await api.get<number | null>('/api/financeiro/caixa/buscar-abertura-caixa-com-usuario-unidade', {
                    params: {
                        usuarioId: uId,
                        unidadeId: unId
                    }
                });
                if (caixaId) {
                    const {data} = await api.get<Caixa>(`/api/financeiro/caixa/${caixaId}`);
                    setCaixa(data);
                    if (data.dataFechamento) {
                        setMensagem('O caixa do dia já foi fechado e não pode ser aberto novamente hoje.');
                        setStepIndex(0);
                    } else {
                        setStepIndex(1);
                    }
                } else {
                    setStepIndex(0);
                }
                const {data: sugerido} = await api.get<number | null>('/api/financeiro/caixa/fundo-caixa-sugerido', {
                    params: {
                        usuarioId,
                        unidadeId
                    }
                });
                if (sugerido != null) setFundoCaixa(String(sugerido));
            } catch {
                // sem caixa aberto ainda
            }
        })();
    }, [usuarioId, unidadeId]);

    async function abrirNovoCaixa() {
        setErro('');
        setLoading(true);
        try {
            const {data} = await api.post<Caixa>('/api/financeiro/caixa/abrir-novo-caixa', {
                data: new Date().toISOString(), usuarioId: Number(usuarioId), unidadeId: Number(unidadeId),
                fundoCaixa: Number(fundoCaixa || 0), impressoraId: impressoraId ? Number(impressoraId) : null,
            });
            setCaixa(data);
            setMensagem('Caixa aberto com sucesso!');
            setStepIndex(1);
        } catch (e: any) {
            setErro(e?.response?.data?.message ?? 'Ocorreu um erro ao abrir o caixa!');
        } finally {
            setLoading(false);
        }
    }

    const [movSubTab, setMovSubTab] = useState<'parcela' | 'extra' | 'sangria'>('parcela');

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
        setErro('');
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

    async function registrarPagamento() {
        if (!caixa || !calculo) return;
        setErro('');
        setLoading(true);
        try {
            await api.post('/api/financeiro/caixa/registrar-pagamento-parcela', {
                caixaId: caixa.id,
                parcelaId: Number(parcelaId),
                usuarioId: Number(usuarioId),
                valorCobrado: calculo.valorCobrado,
                desconto: calculo.desconto,
                multaJuros: calculo.multa + calculo.juros,
                movimentacoes: formasPagamento.filter((f) => Number(f.valor) > 0).map((f) => ({
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

    const [historico, setHistorico] = useState('');
    const [valorExtra, setValorExtra] = useState('');
    const [movimentoId, setMovimentoId] = useState('');
    const [tipoPagamentoExtra, setTipoPagamentoExtra] = useState<TipoPagamento>('DINHEIRO');

    async function registrarMovimentacaoExtra() {
        if (!caixa) return;
        setErro('');
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

    const [valorSangria, setValorSangria] = useState('');

    async function registrarSangria() {
        if (!caixa) return;
        setErro('');
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

    const [totais, setTotais] = useState<FechamentoCaixaTotais | null>(null);

    async function carregarTotais() {
        if (!caixa) return;
        setLoading(true);
        setErro('');
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
        setErro('');
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

    const passo1 = (
        <ScrollView>
            <View style={styles.fieldRow}>
                <RNText style={styles.fieldLabel}>Usuário</RNText>
                <TouchableOpacity
                    style={[
                        styles.input,
                        loadingUsuario && styles.inputDisabled,
                        usuarioId && styles.inputFilled
                    ]}
                    onPress={loadingUsuario ? undefined : () => { /* open combo */
                    }}
                >
                    <RNText style={styles.inputText}>
                        {usuarioOptions.find(u => String(u.id) === usuarioId)?.nome || usuarioId || '-- Selecione --'}
                    </RNText>
                    {loadingUsuario && <ActivityIndicator size="small"/>}
                </TouchableOpacity>
            </View>
            <View style={styles.fieldRow}>
                <RNText style={styles.fieldLabel}>Unidade</RNText>
                <TouchableOpacity
                    style={[
                        styles.input,
                        loadingUnidade && styles.inputDisabled,
                        unidadeId && styles.inputFilled
                    ]}
                    onPress={loadingUnidade ? undefined : () => { /* open combo */
                    }}
                >
                    <RNText style={styles.inputText}>
                        {unidadeOptions.find(u => String(u.id) === unidadeId)?.nome || unidadeId || '-- Selecione --'}
                    </RNText>
                    {loadingUnidade && <ActivityIndicator size="small"/>}
                </TouchableOpacity>
            </View>
            {caixa && caixa.dataFechamento ? (
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Caixa #{caixa.idCaixaUnidade}</Text>
                    <Text>Aberto em: {new Date(caixa.data).toLocaleString('pt-BR')}</Text>
                    <Text>Status: Fechado</Text>
                    <Text>Fundo de caixa: {money(caixa.fundoCaixa)}</Text>
                    <Text style={[styles.hint, {color: '#b00020'}]}>O caixa do dia já foi fechado e não pode ser aberto novamente hoje.</Text>
                </View>
            ) : caixa ? (
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Caixa #{caixa.idCaixaUnidade}</Text>
                    <Text>Aberto em: {new Date(caixa.data).toLocaleString('pt-BR')}</Text>
                    <Text>Status: Aberto</Text>
                    <Text>Fundo de caixa: {money(caixa.fundoCaixa)}</Text>
                </View>
            ) : (
                <View>
                    <RNText style={styles.hint}>Nenhum caixa aberto hoje. Configure a impressora e o fundo de
                        caixa.</RNText>
                    <View style={styles.fieldRow}>
                        <RNText style={styles.fieldLabel}>Impressora</RNText>
                        <TouchableOpacity
                            style={[
                                styles.input,
                                loadingImpressora && styles.inputDisabled,
                                impressoraId && styles.inputFilled
                            ]}
                            onPress={loadingImpressora ? undefined : () => { /* open combo */
                            }}
                        >
                            <RNText style={styles.inputText}>
                                {impressoraOptions.find(i => String(i.id) === impressoraId)?.nome || impressoraId || '-- Selecione --'}
                            </RNText>
                            {loadingImpressora && <ActivityIndicator size="small"/>}
                        </TouchableOpacity>
                    </View>
                    <View style={styles.fieldRow}>
                        <RNText style={styles.fieldLabel}>Fundo de Caixa</RNText>
                        <TextInput style={styles.input} value={fundoCaixa} onChangeText={setFundoCaixa}
                                   keyboardType="numeric"/>
                    </View>
                    <Pressable style={styles.primaryButton} onPress={abrirNovoCaixa}
                               disabled={loading || !usuarioId || !unidadeId}>
                        <RNText style={styles.primaryButtonText}>Abrir Caixa</RNText>
                    </Pressable>
                </View>
            )}
        </ScrollView>
    );

    const passo2 = (
        <ScrollView>
            <View style={styles.subTabsRow}>
                {(['parcela', 'extra', 'sangria'] as const).map((k) => (
                    <Pressable key={k} onPress={() => setMovSubTab(k)} style={[styles.chip, movSubTab === k && styles.chipActive]}>
                    <Text style={[styles.chipText, movSubTab === k && styles.chipTextActive]}>
                    {k === 'parcela' ? 'Pagamento de Parcela' : k === 'extra' ? 'Movimentação Extra' : 'Sangria'}
                    </Text>
                    </Pressable>
                    ))}
            </View>

            {movSubTab === 'parcela' && (
                <View>
                    <Field label="Nº da Parcela" value={parcelaId} onChangeText={setParcelaId} keyboardType="numeric"/>
                    <Field label="Valor" value={valorParcela} onChangeText={setValorParcela} keyboardType="numeric"/>
                    <Field label="Vencimento (AAAA-MM-DD)" value={dataVencimento} onChangeText={setDataVencimento}/>
                    <Field label="Nº Parcela (0 = entrada)" value={parcelaSequencia} onChangeText={setParcelaSequencia}
                           keyboardType="numeric"/>
                    <Field label="% Desconto" value={percentualDesconto} onChangeText={setPercentualDesconto}
                           keyboardType="numeric"/>
                    <Field label="% Multa" value={percentualMulta} onChangeText={setPercentualMulta}
                           keyboardType="numeric"/>
                    <Field label="% Juros a.m." value={percentualJuros} onChangeText={setPercentualJuros}
                           keyboardType="numeric"/>
                    <Field label="Dias tolerância" value={diasTolerancia} onChangeText={setDiasTolerancia}
                           keyboardType="numeric"/>
                    <Pressable style={styles.secondaryButton} onPress={calcularValores}>
                        <Text style={styles.secondaryButtonText}>Calcular valores</Text>
                    </Pressable>

                    {calculo && (
                        <View style={styles.card}>
                            <Text>Desconto: {money(calculo.desconto)}</Text>
                            <Text>Multa + Juros: {money(calculo.multa + calculo.juros)}</Text>
                            <Text style={styles.bold}>Valor Cobrado: {money(calculo.valorCobrado)}</Text>
                        </View>
                    )}

                    <Text style={styles.sectionTitle}>Formas de pagamento</Text>
                    {formasPagamento.map((f, idx) => (
                        <View key={idx} style={styles.card}>
                            <ChipSelect options={TIPOS_PAGAMENTO} value={f.tipoPagamento}
                                        onChange={(v) => setFormasPagamento((list) => list.map((x, i) => (i === idx ? {
                                            ...x,
                                            tipoPagamento: v
                                        } : x)))}/>
                            <Field label="Valor" value={f.valor}
                                   onChangeText={(v) => setFormasPagamento((list) => list.map((x, i) => (i === idx ? {
                                       ...x,
                                       valor: v
                                   } : x)))} keyboardType="numeric"/>
                            {f.tipoPagamento !== 'DINHEIRO' && (
                                <Field label="Documento / nº" value={f.documento}
                                       onChangeText={(v) => setFormasPagamento((list) => list.map((x, i) => (i === idx ? {
                                           ...x,
                                           documento: v
                                       } : x)))}/>
                            )}
                            {formasPagamento.length > 1 && (
                                <Pressable
                                    style={styles.removeButton}
                                    onPress={() => setFormasPagamento((list) => list.filter((_, i) => i !== idx))}>
                                    <Text style={styles.removeButtonText}>Remover</Text>
                                </Pressable>
                            )}
                        </View>
                    ))}
                    <Pressable style={styles.secondaryButton} onPress={() => setFormasPagamento((list) => [...list, {
                        tipoPagamento: 'DINHEIRO',
                        valor: '',
                        documento: ''
                    }])}>
                        <Text style={styles.secondaryButtonText}>+ Adicionar forma de pagamento</Text>
                    </Pressable>

                    <Text style={styles.bold}>Valor
                        recebido: {money(valorRecebido)}{calculo && troco > 0 ? ` — Troco: ${money(troco)}` : ''}</Text>

                    <Pressable
                        style={[styles.primaryButton, (!calculo || valorRecebido < (calculo?.valorCobrado ?? Infinity)) && styles.buttonDisabled]}
                        disabled={loading || !calculo || valorRecebido < (calculo?.valorCobrado ?? Infinity)}
                        onPress={registrarPagamento}
                    >
                        <Text style={styles.primaryButtonText}>Confirmar Pagamento</Text>
                    </Pressable>
                </View>
            )}

            {movSubTab === 'extra' && (
                <View>
                    <Field label="Descrição" value={historico} onChangeText={setHistorico}/>
                    <Field label="Valor" value={valorExtra} onChangeText={setValorExtra} keyboardType="numeric"/>
                    <Field label="Movimento ID" value={movimentoId} onChangeText={setMovimentoId}
                           keyboardType="numeric"/>
                    <Text style={styles.fieldLabel}>Forma de pagamento</Text>
                    <ChipSelect options={TIPOS_PAGAMENTO} value={tipoPagamentoExtra} onChange={setTipoPagamentoExtra}/>
                    <Pressable style={styles.primaryButton} onPress={registrarMovimentacaoExtra} disabled={loading}>
                        <Text style={styles.primaryButtonText}>Registrar Movimentação</Text>
                    </Pressable>
                </View>
            )}

            {movSubTab === 'sangria' && (
                <View>
                    <Field label="Valor da sangria" value={valorSangria} onChangeText={setValorSangria}
                           keyboardType="numeric"/>
                    <Pressable style={styles.primaryButton} onPress={registrarSangria} disabled={loading}>
                        <Text style={styles.primaryButtonText}>Registrar Sangria</Text>
                    </Pressable>
                </View>
            )}
        </ScrollView>
    );

    const passo3 = (
        <ScrollView>
            {caixa && <Text style={styles.sectionTitle}>Totais do Caixa #{caixa.idCaixaUnidade}</Text>}
            {!totais &&
            <Pressable style={styles.secondaryButton} onPress={carregarTotais}><Text style={styles.secondaryButtonText}>Carregar
                totais</Text></Pressable>}
            {loading && <ActivityIndicator/>}
            {totais && (
                <View style={styles.card}>
                    <Text>Fundo de Caixa: {money(totais.totalFundoCaixa)}</Text>
                    <Text>Dinheiro: {money(totais.totalDinheiro)}</Text>
                    <Text>Cheque: {money(totais.totalCheque)}</Text>
                    <Text>Cartão: {money(totais.totalCartao)}</Text>
                    <Text>Boleto: {money(totais.totalBoleto)}</Text>
                    <Text>Transferência: {money(totais.totalTransferencia)}</Text>
                    <Text>Depósito: {money(totais.totalDeposito)}</Text>
                    <Text>Sangria: {money(totais.totalSangria)}</Text>
                    <Text>Desconto concedido: {money(totais.totalDesconto)}</Text>
                    <Text>Multa/Juros recebidos: {money(totais.totalJurosMulta)}</Text>
                    <Text style={styles.bold}>Total Dinheiro em Caixa: {money(totais.totalDinheiroCaixa)}</Text>
                    <Pressable style={styles.secondaryButton} onPress={carregarTotais}><Text
                        style={styles.secondaryButtonText}>Atualizar totais</Text></Pressable>
                </View>
            )}
            {caixa && !caixa.dataFechamento && (
                <Pressable style={styles.primaryButton} onPress={fecharCaixa} disabled={loading}>
                    <Text style={styles.primaryButtonText}>Fechar Caixa</Text>
                </Pressable>
            )}
        </ScrollView>
    );

    const steps: WizardStep[] = [
        {key: 'configuracao', label: 'Configurações impressora', content: passo1, nextDisabled: !caixa || !!caixa.dataFechamento},
        {key: 'movimentacao', label: 'Movimentação Financeira', content: passo2, nextDisabled: !caixa || !!caixa.dataFechamento},
        {key: 'fechamento', label: 'Fechamento Caixa', content: passo3},
    ];

    return (
        <View style={styles.page}>
            <Text style={styles.title}>Fechamento Caixa</Text>
            {!!erro && <Text style={styles.error}>{erro}</Text>}
            {!!mensagem && <Text style={styles.success}>{mensagem}</Text>}
            <Wizard steps={steps} stepIndex={stepIndex} completeLabel="Concluir" onComplete={carregarTotais}/>
        </View>
    );
}

const styles = StyleSheet.create({
    page: {flex: 1, padding: 12, backgroundColor: '#ffffff'},
    title: {fontSize: 18, fontWeight: '700', marginBottom: 8},
    field: {marginBottom: 10},
    fieldLabel: {fontSize: 12, color: '#555', marginBottom: 4},
    input: {
        borderWidth: 1,
        borderColor: '#d3d3d3',
        borderRadius: 6,
        paddingHorizontal: 10,
        paddingVertical: 8,
        fontSize: 14
    },
    card: {
        borderWidth: 1,
        borderColor: '#e0e0e0',
        borderRadius: 8,
        padding: 12,
        marginBottom: 10,
        backgroundColor: '#fafafa'
    },
    cardTitle: {fontSize: 15, fontWeight: '700', marginBottom: 4},
    hint: {color: '#555', marginBottom: 10},
    sectionTitle: {fontSize: 14, fontWeight: '700', marginTop: 6, marginBottom: 6},
    bold: {fontWeight: '700', marginVertical: 6},
    error: {color: '#b00020', marginBottom: 6},
    success: {color: '#2e7d32', marginBottom: 6},
    removeText: {color: '#b00020', marginTop: 4},
    removeButton: {paddingHorizontal: 12, paddingVertical: 8, backgroundColor: '#dc3545', borderRadius: 4, marginTop: 4, alignItems: 'center'},
    removeButtonText: {color: '#fff', fontSize: 12, fontWeight: '700'},
    subTabsRow: {flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 10},
    chip: {
        borderWidth: 1,
        borderColor: '#d3d3d3',
        borderRadius: 16,
        paddingHorizontal: 12,
        paddingVertical: 6,
        marginRight: 6
    },
    chipActive: {backgroundColor: '#2a5a88', borderColor: '#265a88'},
    chipText: {fontSize: 12, color: '#333'},
    chipTextActive: {color: '#ffffff', fontWeight: '700'},
    primaryButton: {
        backgroundColor: '#2a5a88',
        borderRadius: 6,
        paddingVertical: 12,
        alignItems: 'center',
        marginTop: 10
    },
    primaryButtonText: {color: '#ffffff', fontWeight: '700'},
    secondaryButton: {
        borderWidth: 1,
        borderColor: '#2a5a88',
        borderRadius: 6,
        paddingVertical: 10,
        alignItems: 'center',
        marginTop: 6,
        marginBottom: 6
    },
    secondaryButtonText: {color: '#2a5a88', fontWeight: '700'},
    buttonDisabled: {opacity: 0.5},
    fieldRow: {flexDirection: 'row', alignItems: 'center', marginBottom: 10},
    inputField: {
        width: '100%',
        borderWidth: 1,
        borderColor: '#d3d3d3',
        borderRadius: 6,
        paddingHorizontal: 10,
        paddingVertical: 8,
        fontSize: 14
    },
    inputDisabled: {opacity: 0.5},
    inputFilled: {backgroundColor: '#f0f0f0'},
    inputText: {fontSize: 14, color: '#333'},
});