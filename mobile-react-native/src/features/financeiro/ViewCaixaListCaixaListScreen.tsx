import React, {useState, useMemo} from 'react';
import {
    ActivityIndicator,
    FlatList,
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import {Alert} from '../../shared/components/SweetAlert';
import {useQuery} from '@tanstack/react-query';
import {api} from '../api';
import {PAGE_SIZES, useModulePaged} from './useModulePaged';
import {executeAction} from './actions';
import {can} from './permissions';
import {useAuth} from './auth';
import type {ApiItem, SearchFilterRequest} from './types';
import {Colors, Spacing, BorderRadius, Typography, Shadows, Layout} from './theme';
import {ModuleFilter} from '../../shared/components/ModuleFilter';

const asRecord = (item: ApiItem) => item as unknown as Record<string, unknown>;

const formatCurrency = (value: unknown): string => {
    if (value === null || value === undefined) return '';
    const num = Number(value);
    if (isNaN(num)) return String(value);
    return num.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'});
};

const toMovimentacao = (raw: Record<string, unknown>): Movimentacao => {
    const movimentoId = raw.movimentoId != null ? Number(raw.movimentoId) : 0;
    const tipoMovimento = movimentoId === 3 ? 'SANGRIA' : (movimentoId === 2 ? 'SAIDA' : 'ENTRADA');
    const valor = Number(raw.valor) || 0;
    const desconto = Number(raw.desconto) || 0;
    const multaJuros = Number(raw.multaJuros) || 0;
    const valorTroco = Number(raw.valorTroco) || 0;
    return {
        id: Number(raw.id) || 0,
        parcelaId: raw.parcelaId != null ? Number(raw.parcelaId) : 0,
        contratoId: raw.contratoId != null ? Number(raw.contratoId) : (raw.caixaId != null ? Number(raw.caixaId) : 0),
        aluno: String(raw.aluno ?? raw.historico ?? ''),
        parcelaSequencia: raw.parcelaSequencia != null ? Number(raw.parcelaSequencia) : (raw.parcelaId != null ? Number(raw.parcelaId) : 0),
        dataMovimento: String(raw.dataMovimento ?? ''),
        vencimento: raw.vencimento != null ? String(raw.vencimento) : '',
        formaPagamento: raw.tipoPagamento != null ? String(raw.tipoPagamento) : '',
        valor,
        desconto,
        multaJuros,
        troco: valorTroco,
        total: valor - valorTroco,
        tipoMovimento,
    };
};

const formatDateTime = (value: unknown): string => {
    if (value === null || value === undefined) return '';
    const str = String(value);
    const match = /^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})/.exec(str);
    if (!match) return str;
    return `${match[3]}/${match[2]}/${match[1]} ${match[4]}:${match[5]}`;
};

type Movimentacao = {
    id: number;
    parcelaId: number;
    contratoId: number;
    aluno: string;
    parcelaSequencia: number;
    dataMovimento: string;
    vencimento: string;
    formaPagamento: string;
    valor: number;
    desconto: number;
    multaJuros: number;
    troco: number;
    total: number;
    tipoMovimento: string;
};

type CaixaTotais = {
    caixaId?: number;
    totalFundoCaixa: number;
    totalDinheiro: number;
    totalCheque: number;
    totalCartao: number;
    totalBoleto: number;
    totalTransferencia: number;
    totalDeposito: number;
    totalSangria: number;
    totalValor: number;
    totalDesconto: number;
    totalJurosMulta: number;
    totalValorPagar: number;
    totalDinheiroCaixa: number;
};

const toTotais = (raw: Record<string, unknown>, fundoFallback: number): CaixaTotais => ({
    caixaId: raw.caixaId != null ? Number(raw.caixaId) : undefined,
    totalFundoCaixa: Number(raw.totalFundoCaixa ?? fundoFallback) || 0,
    totalDinheiro: Number(raw.totalDinheiro) || 0,
    totalCheque: Number(raw.totalCheque) || 0,
    totalCartao: Number(raw.totalCartao) || 0,
    totalBoleto: Number(raw.totalBoleto) || 0,
    totalTransferencia: Number(raw.totalTransferencia) || 0,
    totalDeposito: Number(raw.totalDeposito) || 0,
    totalSangria: Number(raw.totalSangria) || 0,
    totalValor: Number(raw.totalValor) || 0,
    totalDesconto: Number(raw.totalDesconto) || 0,
    totalJurosMulta: Number(raw.totalJurosMulta) || 0,
    totalValorPagar: Number(raw.totalValorPagar) || 0,
    totalDinheiroCaixa: Number(raw.totalDinheiroCaixa) || 0,
});

type CaixaRow = {
    id: number;
    idCaixaUnidade: string;
    usuario: string;
    unidade: string;
    data: string;
    dataFechamento: string | null;
    fundoCaixa: number;
    movimentacoes?: Movimentacao[];
};

const renderMovimentacaoIcon = (tipo: string) => {
    if (tipo === 'ENTRADA' || tipo === '1') return '➕';
    if (tipo === 'SAIDA' || tipo === '2') return '➖';
    if (tipo === 'SANGRIA' || tipo === '3') return '💸';
    return '📦';
};

const shouldShowExcluir = () => true;
const shouldShowSegundaViaPagamento = (tipo: string) => tipo === 'ENTRADA' || tipo === '1';
const shouldShowSegundaViaSangria = (tipo: string) => tipo === 'SANGRIA' || tipo === '3';

const handleExcluirMovimentacao = (mov: Movimentacao) => {
    Alert.alert('Confirmar', `Excluir movimentação ${mov.id}?`, [
        {text: 'Cancelar', style: 'cancel'},
        {text: 'Excluir', style: 'destructive', onPress: async () => {
            try {
                await api.delete(`/api/financeiro/movimentacao-financeira/${mov.id}`);
                Alert.alert('Sucesso', 'Movimentação excluída com sucesso');
            } catch (e) {
                Alert.alert('Erro', 'Erro ao excluir movimentação');
            }
        }},
    ]);
};

const handleSegundaViaPagamento = (mov: Movimentacao) => {
    Alert.alert('Segunda Via Pagamento', 'Gerando comprovante...', [
        {text: 'OK', onPress: async () => {
            try {
                await api.post(`/api/financeiro/caixa/imprimir-comprovante-pagamento`, {movimentacaoFinanceiraId: mov.id});
                Alert.alert('Sucesso', 'Comprovante enviado para impressão');
            } catch (e) {
                Alert.alert('Erro', 'Erro ao gerar segunda via');
            }
        }},
    ]);
};

const handleSegundaViaSangria = (mov: Movimentacao) => {
    Alert.alert('Segunda Via Sangria', 'Gerando segunda via...', [
        {text: 'OK', onPress: async () => {
            try {
                await api.post(`/api/financeiro/sangria/${mov.id}/imprimir`);
                Alert.alert('Sucesso', 'Segunda via da sangria enviada para impressão');
            } catch (e) {
                Alert.alert('Erro', 'Erro ao gerar segunda via da sangria');
            }
        }},
    ]);
};

const calculateTotals = (movs: Movimentacao[]) => {
    const totals = {
        totalDinheiro: 0,
        totalCheque: 0,
        totalCartao: 0,
        totalBoleto: 0,
        totalTransferencia: 0,
        totalDeposito: 0,
        totalSangria: 0,
        totalValor: 0,
        totalDesconto: 0,
        totalJurosMulta: 0,
        totalValorPagar: 0,
    };
    movs.forEach(mov => {
        const forma = mov.formaPagamento?.toUpperCase() || '';
        const valor = Number(mov.valor) || 0;
        const desconto = Number(mov.desconto) || 0;
        const multaJuros = Number(mov.multaJuros) || 0;
        const total = Number(mov.total) || 0;
        totals.totalValor += valor;
        totals.totalDesconto += desconto;
        totals.totalJurosMulta += multaJuros;
        totals.totalValorPagar += total;
        if (forma.includes('DINHEIRO')) totals.totalDinheiro += total;
        else if (forma.includes('CHEQUE')) totals.totalCheque += total;
        else if (forma.includes('CARTÃO') || forma.includes('CARTAO')) totals.totalCartao += total;
        else if (forma.includes('BOLETO')) totals.totalBoleto += total;
        else if (forma.includes('TRANSFER') || forma.includes('TRANFER') || forma.includes('PIX')) totals.totalTransferencia += total;
        else if (forma.includes('DEPÓSITO') || forma.includes('DEPOSITO')) totals.totalDeposito += total;
        if (mov.tipoMovimento === 'SANGRIA' || mov.tipoMovimento === '3') totals.totalSangria += total;
    });
    return totals;
};

export default function ViewCaixaListCaixaListScreen() {
    const {session} = useAuth();
    const [page, setPage] = useState(0);
    const [size, setSize] = useState(PAGE_SIZES[0]);
    const [expandedRows, setExpandedRows] = useState<Record<number, boolean>>({});
    const [movimentacoes, setMovimentacoes] = useState<Record<number, Movimentacao[]>>({});
    const [loadingMovimentacoes, setLoadingMovimentacoes] = useState<Record<number, boolean>>({});
    const [totaisCaixa, setTotaisCaixa] = useState<Record<number, CaixaTotais>>({});
    const [loadingTotais, setLoadingTotais] = useState<Record<number, boolean>>({});
    const [erroTotais, setErroTotais] = useState<Record<number, string>>({});
    const [fluxoCaixa, setFluxoCaixa] = useState<CaixaRow | null>(null);
    const [notice, setNotice] = useState('');
    const [filterParams, setFilterParams] = useState<SearchFilterRequest>({filters: {}});

    const COLUMN_FIELDS = ['id_caixa_unidade', 'usuario_login', 'unidade_sucinto', 'data', 'fundo_caixa'] as const;

    const q = useModulePaged('/api/view/caixa/listCaixa', page, size, undefined, filterParams);
    const items = q.data?.content ?? [];
    const totalElements = q.data?.totalElements ?? 0;
    const totalPages = Math.max(1, q.data?.totalPages ?? 0);

    const feature = 'caixa';
    const resource = 'listCaixa';
    const outcome = `view/${feature}/${resource}`;

    const canExecute = can(session, 'EXECUTE', outcome);

    const loadTotais = async (row: CaixaRow): Promise<CaixaTotais | null> => {
        if (totaisCaixa[row.id] || loadingTotais[row.id]) return totaisCaixa[row.id] ?? null;
        setLoadingTotais(prev => ({...prev, [row.id]: true}));
        setErroTotais(prev => {
            const next = {...prev};
            delete next[row.id];
            return next;
        });
        try {
            // Totais sempre via API (caixa aberto ou fechado) — backend calcula por forma de pagamento.
            const {data} = await api.get<Record<string, unknown>>(`/api/financeiro/caixa/${row.id}/totais-fechamento`);
            const totais = toTotais(data ?? {}, Number(row.fundoCaixa) || 0);
            setTotaisCaixa(prev => ({...prev, [row.id]: totais}));
            return totais;
        } catch (e) {
            console.error('Erro ao carregar totais:', e);
            setErroTotais(prev => ({...prev, [row.id]: 'Falha ao carregar totais da API'}));
            return null;
        } finally {
            setLoadingTotais(prev => ({...prev, [row.id]: false}));
        }
    };

    const loadMovimentacoes = async (row: CaixaRow): Promise<Movimentacao[]> => {
        const cached = movimentacoes[row.id];
        if (cached || loadingMovimentacoes[row.id]) return cached ?? [];
        setLoadingMovimentacoes(prev => ({...prev, [row.id]: true}));
        try {
            const {data} = await api.get<Record<string, unknown>[]>(`/api/financeiro/caixa/${row.id}/movimentacoes`);
            const movs = (data ?? []).map(toMovimentacao);
            setMovimentacoes(prev => ({...prev, [row.id]: movs}));
            return movs;
        } catch (e) {
            console.error('Erro ao carregar movimentações:', e);
            setMovimentacoes(prev => ({...prev, [row.id]: []}));
            return [];
        } finally {
            setLoadingMovimentacoes(prev => ({...prev, [row.id]: false}));
        }
    };

    const toggleExpand = async (row: CaixaRow) => {
        const id = row.id;
        const isOpen = expandedRows[id];
        const newExpanded = {...expandedRows, [id]: !isOpen};
        setExpandedRows(newExpanded);

        if (!isOpen) {
            // Detalhe expandido: movimentações + totais via API.
            void loadMovimentacoes(row);
            void loadTotais(row);
        }
    };

    const openFluxoCaixa = async (row: CaixaRow) => {
        setFluxoCaixa(row);
        void loadMovimentacoes(row);
        void loadTotais(row);
    };

    const runAction = (action: string, item: ApiItem) => {
        setNotice('');
        executeAction(feature, action, outcome, JSON.stringify({id: item.id}))
            .then(() => {
                setNotice(`Ação "${action}" executada no registro ${item.id}.`);
                q.refetch();
            })
            .catch((error) => setNotice(`Falha ao executar "${action}": ${error}`))
            .finally(() => {});
    };

    if (q.isLoading && items.length === 0) {
        return (
            <View style={styles.center}>
                <ActivityIndicator color={Colors.primary} size="large"/>
            </View>
        );
    }

    if (q.isError) {
        return (
            <View style={styles.center}>
                <Text style={styles.errorText}>Erro ao carregar os caixas.</Text>
            </View>
        );
    }

    return (
        <View style={styles.page}>
            <View style={styles.header}>
                <Text style={styles.title}>Gerência Fluxo Caixa</Text>
                <ModuleFilter columns={[...COLUMN_FIELDS]} value={filterParams} onChange={setFilterParams} />
            </View>
            {notice ? <Text style={styles.notice}>{notice}</Text> : null}
            {items.length === 0 ? (
                <Text style={styles.empty}>Nenhum registro encontrado.</Text>
            ) : (
                <FlatList
                    data={items}
                    keyExtractor={(item) => String(item.id)}
                    refreshing={q.isFetching}
                    onRefresh={() => q.refetch()}
                    renderItem={({item}) => {
                        const row = asRecord(item);
                        const caixaId = Number(row.id);
                        const isOpen = Boolean(expandedRows[caixaId]);
                        const movs = movimentacoes[caixaId] ?? [];
                        const loading = loadingMovimentacoes[caixaId];
                        const caixaRow: CaixaRow = {
                            id: caixaId,
                            idCaixaUnidade: String(row.id_caixa_unidade ?? ''),
                            usuario: String(row.usuario_login ?? ''),
                            unidade: String(row.unidade_sucinto ?? ''),
                            data: String(row.data ?? ''),
                            dataFechamento: row.data_fechamento ? String(row.data_fechamento) : null,
                            fundoCaixa: Number(row.fundo_caixa ?? 0),
                        };
                        const totalsApi = totaisCaixa[caixaId];
                        const isLoadingTotais = loadingTotais[caixaId];
                        // Totais via API; fallback local apenas se a API falhar.
                        const totals: CaixaTotais = totalsApi ?? (() => {
                            const t = calculateTotals(movs);
                            const fundo = Number(caixaRow.fundoCaixa) || 0;
                            return {
                                totalFundoCaixa: fundo,
                                totalDinheiro: t.totalDinheiro,
                                totalCheque: t.totalCheque,
                                totalCartao: t.totalCartao,
                                totalBoleto: t.totalBoleto,
                                totalTransferencia: t.totalTransferencia,
                                totalDeposito: t.totalDeposito,
                                totalSangria: t.totalSangria,
                                totalValor: t.totalValor,
                                totalDesconto: t.totalDesconto,
                                totalJurosMulta: t.totalJurosMulta,
                                totalValorPagar: t.totalValorPagar,
                                totalDinheiroCaixa: t.totalDinheiro + fundo,
                            };
                        })();

                        return (
                            <View style={styles.rowContainer}>
                                <View style={styles.row}>
                                    <Pressable style={styles.toggleButton} onPress={() => toggleExpand(caixaRow)} disabled={loading}>
                                        <Text style={styles.toggleText}>{isOpen ? '▾' : '▸'}</Text>
                                    </Pressable>
                                    <View style={styles.rowContent}>
                                        <View style={styles.rowField}>
                                            <Text style={styles.rowLabel}>Nº Caixa:</Text>
                                            <Text style={styles.rowValue}>{caixaRow.idCaixaUnidade}</Text>
                                        </View>
                                        <View style={styles.rowField}>
                                            <Text style={styles.rowLabel}>Usuário:</Text>
                                            <Text style={styles.rowValue}>{caixaRow.usuario}</Text>
                                        </View>
                                        <View style={styles.rowField}>
                                            <Text style={styles.rowLabel}>Unidade:</Text>
                                            <Text style={styles.rowValue}>{caixaRow.unidade}</Text>
                                        </View>
                                        <View style={styles.rowField}>
                                            <Text style={styles.rowLabel}>Data:</Text>
                                            <Text style={styles.rowValue}>{formatDateTime(caixaRow.data)}</Text>
                                        </View>
                                        <View style={styles.rowField}>
                                            <Text style={styles.rowLabel}>Fundo Caixa:</Text>
                                            <Text style={styles.rowValue}>{formatCurrency(caixaRow.fundoCaixa)}</Text>
                                        </View>
<View style={styles.rowActions}>
                                             <Pressable style={[styles.actionButton, styles.actionBlack]} onPress={() => openFluxoCaixa(caixaRow)}>
                                                 <Text style={[styles.actionButtonText, styles.actionBlackText]}>📊 Fluxo</Text>
                                             </Pressable>
                                              <Pressable style={[styles.actionButton, styles.actionBlue]} disabled={!caixaRow.dataFechamento} onPress={() => Alert.alert('Imprimir', 'Gerando relatório...', [
                                                   {text: 'OK', onPress: async () => {
                                                       try {
                                                            const response = await api.post(`/api/financeiro/caixa/${caixaRow.id}/imprimir`, undefined, {responseType: 'blob', headers: {Accept: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'}});
                                                           const blob = new Blob([response.data], {type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'});
                                                           const url = URL.createObjectURL(blob);
                                                           Alert.alert('Sucesso', 'Relatório gerado para impressão');
                                                           q.refetch();
                                                       } catch (e) {
                                                           Alert.alert('Erro', 'Erro ao imprimir');
                                                       }
                                                   }},
                                               ])}>
                                                  <Text style={styles.actionButtonText}>🖨️ Imprimir</Text>
                                              </Pressable>
{caixaRow.dataFechamento ? (
                                                  <Pressable style={[styles.actionButton, styles.actionStop]} onPress={() => Alert.alert('Reabrir Caixa', 'Deseja reabrir este caixa?', [
                                                      {text: 'Cancelar', style: 'cancel'},
                                                      {text: 'Reabrir', onPress: async () => {
                                                          try {
                                                              await api.post(`/api/financeiro/caixa/${caixaRow.id}/abrir`);
                                                              Alert.alert('Sucesso', 'Caixa reaberto com sucesso');
                                                              q.refetch();
                                                          } catch (e) {
                                                              Alert.alert('Erro', 'Erro ao reabrir caixa');
                                                          }
                                                      }},
                                                  ])}>
                                                     <Text style={styles.actionButtonText}>🔓 Reabrir</Text>
                                                 </Pressable>
                                             ) : null}
                                         </View>
                                    </View>
                                </View>
                                {isOpen && (
                                    <View style={styles.expandedContainer}>
                                        {loading ? (
                                            <View style={styles.loadingContainer}>
                                                <ActivityIndicator color={Colors.primary} size="small"/>
                                                <Text style={styles.loadingText}>Carregando movimentações...</Text>
                                            </View>
                                        ) : (
                                            <>
                                                {movs.length === 0 ? (
                                                    <Text style={styles.emptyDetail}>Nenhuma movimentação encontrada.</Text>
                                                ) : (
                                                <View style={styles.movTableContainer}>
                                                    <View style={styles.movTableHeader}>
                                                        <Text style={styles.movTh}>Tipo</Text>
                                                        <Text style={styles.movTh}>ID</Text>
                                                        <Text style={styles.movTh}>Contrato</Text>
                                                        <Text style={styles.movTh}>Aluno</Text>
                                                        <Text style={styles.movTh}>Parcela</Text>
                                                        <Text style={styles.movTh}>Data Mov.</Text>
                                                        <Text style={styles.movTh}>Vencimento</Text>
                                                        <Text style={styles.movTh}>Forma Pag.</Text>
                                                        <Text style={styles.movTh}>Valor</Text>
                                                        <Text style={styles.movTh}>Desc.</Text>
                                                        <Text style={styles.movTh}>Juros</Text>
                                                        <Text style={styles.movTh}>Troco</Text>
                                                        <Text style={styles.movTh}>Total</Text>
                                                        <Text style={styles.movTh}>Ações</Text>
                                                    </View>
                                                    <ScrollView horizontal={true} style={styles.movTableScroll}>
                                                        <View style={styles.movTableBody}>
                                                            {movs.map((mov) => (
                                                                <View key={mov.id} style={styles.movRow}>
                                                                    <Text style={styles.movTd}>{renderMovimentacaoIcon(mov.tipoMovimento)}</Text>
                                                                    <Text style={styles.movTd}>{mov.id}</Text>
                                                                    <Text style={styles.movTd}>{mov.contratoId}</Text>
                                                                    <Text style={styles.movTd} numberOfLines={1}>{mov.aluno}</Text>
                                                                    <Text style={styles.movTd}>{mov.parcelaSequencia}</Text>
                                                                    <Text style={styles.movTd}>{formatDateTime(mov.dataMovimento)}</Text>
                                                                    <Text style={styles.movTd}>{formatDateTime(mov.vencimento)}</Text>
                                                                    <Text style={styles.movTd}>{mov.formaPagamento}</Text>
                                                                    <Text style={styles.movTd}>{formatCurrency(mov.valor)}</Text>
                                                                    <Text style={styles.movTd}>{formatCurrency(mov.desconto)}</Text>
                                                                    <Text style={styles.movTd}>{formatCurrency(mov.multaJuros)}</Text>
                                                                    <Text style={styles.movTd}>{formatCurrency(mov.troco)}</Text>
                                                                    <Text style={styles.movTd}>{formatCurrency(mov.total)}</Text>
                                                                    <View style={styles.movActions}>
                                                                        {shouldShowExcluir() && (
                                                                            <Pressable style={styles.actionBtnSmall} onPress={() => handleExcluirMovimentacao(mov)}>
                                                                                <Text style={styles.actionBtnSmallText}>🗑️</Text>
                                                                            </Pressable>
                                                                        )}
                                                                        {shouldShowSegundaViaPagamento(mov.tipoMovimento) && (
                                                                            <Pressable style={styles.actionBtnSmall} onPress={() => handleSegundaViaPagamento(mov)}>
                                                                                <Text style={styles.actionBtnSmallText}>🖨️</Text>
                                                                            </Pressable>
                                                                        )}
                                                                        {shouldShowSegundaViaSangria(mov.tipoMovimento) && (
                                                                            <Pressable style={styles.actionBtnSmall} onPress={() => handleSegundaViaSangria(mov)}>
                                                                                <Text style={styles.actionBtnSmallText}>📄</Text>
                                                                            </Pressable>
                                                                        )}
                                                                    </View>
                                                                </View>
                                                            ))}
                                                        </View>
                                                    </ScrollView>
                                                </View>
                                                )}
                                                <View style={styles.totalsContainer}>
                                                    <Text style={styles.totalsTitle}>Totais {isLoadingTotais && !totalsApi ? '(carregando...)' : totalsApi ? '(API)' : '(local)'}</Text>
                                                    {isLoadingTotais && !totalsApi ? (
                                                        <View style={styles.loadingContainer}>
                                                            <ActivityIndicator color={Colors.primary} size="small"/>
                                                            <Text style={styles.loadingText}>Carregando totais da API...</Text>
                                                        </View>
                                                    ) : null}
                                                    {erroTotais[caixaId] && !totalsApi ? (
                                                        <Text style={styles.totalsError}>Totais da API indisponíveis — exibindo cálculo local.</Text>
                                                    ) : null}
                                                    <ScrollView horizontal={true} style={styles.totalsScroll}>
                                                        <View style={styles.totalsRow}>
                                                            <View style={styles.totalsCell}>
                                                                <Text style={styles.totalsLabel}>Fundo Caixa</Text>
                                                                <Text style={styles.totalsValue}>{formatCurrency(totals.totalFundoCaixa)}</Text>
                                                            </View>
                                                            <View style={styles.totalsCell}>
                                                                <Text style={styles.totalsLabel}>Total Dinheiro</Text>
                                                                <Text style={styles.totalsValue}>{formatCurrency(totals.totalDinheiro)}</Text>
                                                            </View>
                                                            <View style={styles.totalsCell}>
                                                                <Text style={styles.totalsLabel}>Total Cheque</Text>
                                                                <Text style={styles.totalsValue}>{formatCurrency(totals.totalCheque)}</Text>
                                                            </View>
                                                            <View style={styles.totalsCell}>
                                                                <Text style={styles.totalsLabel}>Total Cartão</Text>
                                                                <Text style={styles.totalsValue}>{formatCurrency(totals.totalCartao)}</Text>
                                                            </View>
                                                            <View style={styles.totalsCell}>
                                                                <Text style={styles.totalsLabel}>Total Boleto</Text>
                                                                <Text style={styles.totalsValue}>{formatCurrency(totals.totalBoleto)}</Text>
                                                            </View>
                                                            <View style={styles.totalsCell}>
                                                                <Text style={styles.totalsLabel}>Total Transf.</Text>
                                                                <Text style={styles.totalsValue}>{formatCurrency(totals.totalTransferencia)}</Text>
                                                            </View>
                                                            <View style={styles.totalsCell}>
                                                                <Text style={styles.totalsLabel}>Total Depósito</Text>
                                                                <Text style={styles.totalsValue}>{formatCurrency(totals.totalDeposito)}</Text>
                                                            </View>
                                                            <View style={styles.totalsCell}>
                                                                <Text style={styles.totalsLabel}>Total Sangria</Text>
                                                                <Text style={styles.totalsValue}>{formatCurrency(totals.totalSangria)}</Text>
                                                            </View>
                                                            <View style={styles.totalsCell}>
                                                                <Text style={styles.totalsLabel}>Valor</Text>
                                                                <Text style={styles.totalsValue}>{formatCurrency(totals.totalValor)}</Text>
                                                            </View>
                                                            <View style={styles.totalsCell}>
                                                                <Text style={styles.totalsLabel}>Desconto</Text>
                                                                <Text style={styles.totalsValue}>{formatCurrency(totals.totalDesconto)}</Text>
                                                            </View>
                                                            <View style={styles.totalsCell}>
                                                                <Text style={styles.totalsLabel}>Juros/Multa</Text>
                                                                <Text style={styles.totalsValue}>{formatCurrency(totals.totalJurosMulta)}</Text>
                                                            </View>
                                                            <View style={styles.totalsCell}>
                                                                <Text style={styles.totalsLabel}>Valor Total</Text>
                                                                <Text style={styles.totalsValue}>{formatCurrency(totals.totalValorPagar)}</Text>
                                                            </View>
                                                            <View style={styles.totalsCell}>
                                                                <Text style={styles.totalsLabel}>Total Caixa</Text>
                                                                <Text style={styles.totalsValue}>{formatCurrency(totals.totalDinheiroCaixa)}</Text>
                                                            </View>
                                                        </View>
</ScrollView>
                                                    {!totalsApi && !isLoadingTotais ? (
                                                        <Pressable style={styles.retryButton} onPress={() => loadTotais(caixaRow)}>
                                                            <Text style={styles.retryButtonText}>Recarregar totais da API</Text>
                                                        </Pressable>
                                                    ) : null}
                                                </View>
                                            </>
                                        )}
                                    </View>
                                )}
                            </View>
                        );
                    }}
                />
            )}
            <View style={styles.paginator}>
                <Pressable
                    style={[styles.pageButton, (page === 0 || q.isFetching) && styles.pageButtonDisabled]}
                    disabled={page === 0 || q.isFetching}
                    onPress={() => setPage((current) => Math.max(0, current - 1))}
                >
                    <Text style={styles.pageButtonText}>Anterior</Text>
                </Pressable>
                <Text style={styles.pageInfo}>
                    Página {page + 1} de {totalPages} · Total: {totalElements}
                </Text>
                <Pressable
                    style={[styles.pageButton, (page >= totalPages - 1 || q.isFetching) && styles.pageButtonDisabled]}
                    disabled={page >= totalPages - 1 || q.isFetching}
                    onPress={() => setPage((current) => Math.min(totalPages - 1, current + 1))}
                >
                    <Text style={styles.pageButtonText}>Próxima</Text>
                </Pressable>
            </View>
            <Pressable style={styles.sizeSelector} onPress={() => Alert.alert('Tamanho da página', 'Selecione', PAGE_SIZES.map(s => ({text: `${s}`, onPress: () => { setSize(s); setPage(0); }})))}>
                <Text style={styles.sizeSelectorText}>{size} por página ▾</Text>
            </Pressable>
            <Modal visible={fluxoCaixa !== null} animationType="slide" transparent={true} onRequestClose={() => setFluxoCaixa(null)}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Fluxo de Caixa {fluxoCaixa ? `- ${fluxoCaixa.idCaixaUnidade}` : ''}</Text>
                        {fluxoCaixa ? (
                            <>
                                <Text style={styles.modalSubtitle}>Unidade: {fluxoCaixa.unidade}</Text>
                                {loadingTotais[fluxoCaixa.id] ? (
                                    <View style={styles.loadingContainer}>
                                        <ActivityIndicator color={Colors.primary} size="small"/>
                                        <Text style={styles.loadingText}>Carregando totais da API...</Text>
                                    </View>
                                ) : (() => {
                                    const apiT = totaisCaixa[fluxoCaixa.id];
                                    const movsModal = movimentacoes[fluxoCaixa.id] ?? [];
                                    const t: CaixaTotais = apiT ?? (() => {
                                        const c = calculateTotals(movsModal);
                                        const fundo = Number(fluxoCaixa.fundoCaixa) || 0;
                                        return {
                                            totalFundoCaixa: fundo,
                                            totalDinheiro: c.totalDinheiro,
                                            totalCheque: c.totalCheque,
                                            totalCartao: c.totalCartao,
                                            totalBoleto: c.totalBoleto,
                                            totalTransferencia: c.totalTransferencia,
                                            totalDeposito: c.totalDeposito,
                                            totalSangria: c.totalSangria,
                                            totalValor: c.totalValor,
                                            totalDesconto: c.totalDesconto,
                                            totalJurosMulta: c.totalJurosMulta,
                                            totalValorPagar: c.totalValorPagar,
                                            totalDinheiroCaixa: c.totalDinheiro + fundo,
                                        };
                                    })();
                                    const pairs: [string, number][] = [
                                        ['Fundo Caixa', t.totalFundoCaixa],
                                        ['Total Dinheiro', t.totalDinheiro],
                                        ['Total Cheque', t.totalCheque],
                                        ['Total Cartão', t.totalCartao],
                                        ['Total Boleto', t.totalBoleto],
                                        ['Total Transf.', t.totalTransferencia],
                                        ['Total Depósito', t.totalDeposito],
                                        ['Total Sangria', t.totalSangria],
                                        ['Valor', t.totalValor],
                                        ['Desconto', t.totalDesconto],
                                        ['Juros/Multa', t.totalJurosMulta],
                                        ['Valor Total', t.totalValorPagar],
                                        ['Total Caixa', t.totalDinheiroCaixa],
                                    ];
                                    return (
                                        <ScrollView horizontal={true} style={styles.totalsScroll}>
                                            <View style={styles.totalsRow}>
                                                {pairs.map(([label, value]) => (
                                                    <View key={label} style={styles.totalsCell}>
                                                        <Text style={styles.totalsLabel}>{label}{apiT ? '' : ' (local)'}</Text>
                                                        <Text style={styles.totalsValue}>{formatCurrency(value)}</Text>
                                                    </View>
                                                ))}
                                            </View>
                                        </ScrollView>
                                    );
                                })()}
                                <Text style={styles.totalsTitle}>Movimentações ({(fluxoCaixa && movimentacoes[fluxoCaixa.id]?.length) ?? 0})</Text>
                                <ScrollView style={styles.modalMovList}>
                                    {(fluxoCaixa && movimentacoes[fluxoCaixa.id] ? movimentacoes[fluxoCaixa.id]! : []).map((mov) => (
                                        <View key={mov.id} style={styles.modalMovRow}>
                                            <Text style={styles.modalMovText}>{renderMovimentacaoIcon(mov.tipoMovimento)} #{mov.id} · {mov.aluno} · {mov.formaPagamento}</Text>
                                            <Text style={styles.modalMovText}>{formatCurrency(mov.total)} (V:{formatCurrency(mov.valor)} D:{formatCurrency(mov.desconto)} J:{formatCurrency(mov.multaJuros)})</Text>
                                        </View>
                                    ))}
                                </ScrollView>
                            </>
                        ) : null}
                        <Pressable style={styles.modalCloseButton} onPress={() => setFluxoCaixa(null)}>
                            <Text style={styles.modalCloseText}>Fechar</Text>
                        </Pressable>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    page: {
        flex: 1,
        backgroundColor: Colors.bgPrimary,
        padding: Spacing.lg,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: Spacing.xl,
        backgroundColor: Colors.bgPrimary,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.md,
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
        backgroundColor: Colors.bgSecondary,
        borderRadius: BorderRadius.lg,
        borderWidth: 1,
        borderColor: Colors.borderLight,
    },
    title: {
        fontSize: Typography.sizes.xxxl,
        fontWeight: Typography.weights.bold,
        color: Colors.textPrimary,
    },
    exportButton: {
        backgroundColor: Colors.gold,
        borderRadius: BorderRadius.md,
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.sm,
    },
    exportButtonText: {
        color: Colors.textWhite,
        fontSize: Typography.sizes.base,
        fontWeight: Typography.weights.semibold,
    },
    notice: {
        backgroundColor: Colors.warningBg,
        borderWidth: 1,
        borderColor: Colors.goldBg,
        borderRadius: BorderRadius.lg,
        padding: Spacing.md,
        marginBottom: Spacing.md,
        color: Colors.goldText,
    },
    empty: {
        textAlign: 'center',
        color: Colors.textLight,
        marginTop: Spacing.xl,
        fontSize: Typography.sizes.lg,
    },
    rowContainer: {
        marginBottom: Spacing.sm,
    },
    row: {
        backgroundColor: Colors.bgSecondary,
        borderRadius: BorderRadius.lg,
        padding: Spacing.md,
        borderWidth: 1,
        borderColor: Colors.borderLight,
    },
    toggleButton: {
        width: 30,
        height: 30,
        borderRadius: BorderRadius.sm,
        borderWidth: 1,
        borderColor: Colors.borderMedium,
        backgroundColor: Colors.bgPrimary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    toggleText: {
        fontSize: Typography.sizes.lg,
        color: Colors.textPrimary,
    },
    rowContent: {
        marginLeft: Spacing.md,
        flex: 1,
    },
    rowField: {
        marginBottom: Spacing.xs,
    },
    rowLabel: {
        fontSize: Typography.sizes.sm,
        fontWeight: Typography.weights.semibold,
        color: Colors.textSecondary,
    },
    rowValue: {
        fontSize: Typography.sizes.base,
        color: Colors.textPrimary,
    },
    rowActions: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: Spacing.xs,
        marginTop: Spacing.sm,
    },
    actionButton: {
        borderRadius: BorderRadius.md,
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.xs,
    },
    actionBlue: {
        backgroundColor: Colors.primary + '20',
    },
    actionBlack: {
        backgroundColor: Colors.btnBlack,
    },
    actionRed: {
        backgroundColor: Colors.errorBg,
    },
    actionStop: {
        backgroundColor: Colors.infoBg,
    },
    actionYellow: {
        backgroundColor: Colors.warningBg,
    },
    actionButtonText: {
        color: Colors.textPrimary,
        fontSize: Typography.sizes.sm,
        fontWeight: Typography.weights.semibold,
    },
    actionBlackText: {
        color: Colors.textWhite,
    },
    expandedContainer: {
        marginTop: Spacing.md,
        padding: Spacing.md,
        backgroundColor: Colors.bgPrimary,
        borderRadius: BorderRadius.lg,
        borderWidth: 1,
        borderColor: Colors.borderLight,
    },
    loadingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
        padding: Spacing.lg,
    },
    loadingText: {
        color: Colors.textSecondary,
        fontSize: Typography.sizes.base,
    },
    emptyDetail: {
        textAlign: 'center',
        color: Colors.textLight,
        padding: Spacing.lg,
        fontSize: Typography.sizes.base,
    },
    movTableContainer: {
        marginBottom: Spacing.md,
    },
    movTableHeader: {
        flexDirection: 'row',
        backgroundColor: Colors.headerStart,
        paddingHorizontal: Spacing.sm,
        paddingVertical: Spacing.xs,
        borderTopLeftRadius: BorderRadius.md,
        borderTopRightRadius: BorderRadius.md,
    },
    movTh: {
        color: Colors.textWhite,
        fontSize: Typography.sizes.xs,
        fontWeight: Typography.weights.bold,
        textAlign: 'center',
    },
    movTableScroll: {
        maxHeight: 300,
    },
    movTableBody: {
        flexDirection: 'row',
    },
    movRow: {
        flexDirection: 'row',
        backgroundColor: Colors.bgSecondary,
        borderBottomWidth: 1,
        borderColor: Colors.borderLight,
        paddingHorizontal: Spacing.sm,
        paddingVertical: Spacing.xs,
        minWidth: 800,
    },
    movTd: {
        fontSize: Typography.sizes.xs,
        color: Colors.textPrimary,
        textAlign: 'center',
        width: 70,
    },
    movActions: {
        flexDirection: 'row',
        gap: Spacing.xs,
        justifyContent: 'center',
        alignItems: 'center',
        width: 80,
    },
    actionBtnSmall: {
        paddingHorizontal: Spacing.xs,
        paddingVertical: 2,
        borderRadius: BorderRadius.sm,
    },
    actionBtnSmallText: {
        fontSize: Typography.sizes.xs,
    },
    totalsContainer: {
        marginTop: Spacing.md,
        paddingTop: Spacing.md,
        borderTopWidth: 1,
        borderTopColor: Colors.borderLight,
    },
    totalsTitle: {
        fontSize: Typography.sizes.lg,
        fontWeight: Typography.weights.bold,
        color: Colors.textPrimary,
        marginBottom: Spacing.sm,
    },
    totalsScroll: {
        marginBottom: Spacing.md,
    },
    totalsRow: {
        flexDirection: 'row',
        minWidth: 1200,
    },
    totalsCell: {
        paddingHorizontal: Spacing.sm,
        paddingVertical: Spacing.xs,
        minWidth: 90,
        alignItems: 'center',
        borderRightWidth: 1,
        borderRightColor: Colors.borderLight,
    },
    totalsLabel: {
        fontSize: Typography.sizes.xs,
        fontWeight: Typography.weights.bold,
        color: Colors.textSecondary,
        textAlign: 'center',
        marginBottom: 2,
    },
    totalsValue: {
        fontSize: Typography.sizes.sm,
        color: Colors.textPrimary,
        textAlign: 'center',
        fontWeight: Typography.weights.semibold,
    },
    actionsBar: {
        flexDirection: 'row',
        gap: Spacing.sm,
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        paddingTop: Spacing.md,
        borderTopWidth: 1,
        borderTopColor: Colors.borderLight,
    },
    actionBtn: {
        borderRadius: BorderRadius.md,
        paddingVertical: Spacing.md,
        alignItems: 'center',
        justifyContent: 'center',
    },
    actionBtnText: {
        color: Colors.textWhite,
        fontSize: Typography.sizes.base,
        fontWeight: Typography.weights.bold,
    },
    errorText: {
        color: Colors.error,
        fontSize: Typography.sizes.lg,
        fontWeight: Typography.weights.semibold,
        textAlign: 'center',
    },
    paginator: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: Spacing.md,
        paddingTop: Spacing.md,
        borderTopWidth: 1,
        borderColor: Colors.borderLight,
    },
    pageButton: {
        backgroundColor: Colors.primary + '15',
        borderRadius: BorderRadius.md,
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.xs,
    },
    pageButtonDisabled: {
        opacity: 0.4,
    },
    pageButtonText: {
        color: Colors.primary,
        fontSize: Typography.sizes.base,
        fontWeight: Typography.weights.semibold,
    },
    pageInfo: {
        fontSize: Typography.sizes.sm,
        color: Colors.textMuted,
        flexShrink: 1,
        textAlign: 'center',
        marginHorizontal: Spacing.sm,
    },
    sizeSelector: {
        alignSelf: 'flex-end',
        marginTop: Spacing.md,
    },
    sizeSelectorText: {
        color: Colors.primary,
        fontSize: Typography.sizes.base,
        fontWeight: Typography.weights.semibold,
    },
    totalsError: {
        color: Colors.error,
        fontSize: Typography.sizes.sm,
        marginBottom: Spacing.sm,
    },
    retryButton: {
        marginTop: Spacing.sm,
        alignSelf: 'flex-start',
        backgroundColor: Colors.primary + '15',
        borderRadius: BorderRadius.md,
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.xs,
    },
    retryButtonText: {
        color: Colors.primary,
        fontSize: Typography.sizes.sm,
        fontWeight: Typography.weights.semibold,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: Spacing.lg,
    },
    modalContent: {
        width: '100%',
        maxHeight: '85%',
        backgroundColor: Colors.bgSecondary,
        borderRadius: BorderRadius.lg,
        padding: Spacing.lg,
    },
    modalTitle: {
        fontSize: Typography.sizes.xl,
        fontWeight: Typography.weights.bold,
        color: Colors.textPrimary,
        marginBottom: Spacing.xs,
    },
    modalSubtitle: {
        fontSize: Typography.sizes.base,
        color: Colors.textSecondary,
        marginBottom: Spacing.md,
    },
    modalMovList: {
        maxHeight: 250,
        marginTop: Spacing.md,
    },
    modalMovRow: {
        paddingVertical: Spacing.xs,
        borderBottomWidth: 1,
        borderBottomColor: Colors.borderLight,
    },
    modalMovText: {
        fontSize: Typography.sizes.sm,
        color: Colors.textPrimary,
    },
    modalCloseButton: {
        marginTop: Spacing.md,
        backgroundColor: Colors.primary,
        borderRadius: BorderRadius.md,
        paddingVertical: Spacing.sm,
        alignItems: 'center',
    },
    modalCloseText: {
        color: Colors.textWhite,
        fontSize: Typography.sizes.base,
        fontWeight: Typography.weights.bold,
    },
});