import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {
    ActivityIndicator,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {useAuth} from '../auth/auth';
import {Tabs} from '../../Tabs';
import type {ParamList} from '../../HomeScreen';
import {
    bibliotecaAlunoApi,
    formatarDataCurta,
    formatarDataHora,
    formatarMoeda,
    type EmprestimoFisico,
    type MultaFisica,
    type ObraResumo,
    type ReservaFisica,
} from './bibliotecaAluno';

const RESERVA_ATIVA = new Set(['AGUARDANDO_FILA', 'DISPONIVEL_PARA_RETIRADA']);

export default function AlunoBibliotecaFisicaScreen({}: NativeStackScreenProps<ParamList, 'aluno/biblioteca-fisica'>) {
    const {session} = useAuth();
    const usuarioId = session?.idUsuario ?? null;

    const [reservas, setReservas] = useState<ReservaFisica[]>([]);
    const [emprestimos, setEmprestimos] = useState<EmprestimoFisico[]>([]);
    const [multas, setMultas] = useState<MultaFisica[]>([]);
    const [obras, setObras] = useState<ObraResumo[]>([]);
    const [busca, setBusca] = useState('');
    const [busy, setBusy] = useState(true);
    const [busyBusca, setBusyBusca] = useState(false);
    const [acaoId, setAcaoId] = useState<number | null>(null);
    const [error, setError] = useState('');
    const [aviso, setAviso] = useState('');

    const carregarPessoais = useCallback(async () => {
        if (usuarioId == null) return;
        const [r, e, m] = await Promise.all([
            bibliotecaAlunoApi.minhasReservas(usuarioId),
            bibliotecaAlunoApi.meusEmprestimosAtivos(usuarioId),
            bibliotecaAlunoApi.minhasMultas(usuarioId),
        ]);
        setReservas(r);
        setEmprestimos(e);
        setMultas(m);
    }, [usuarioId]);

    useEffect(() => {
        let active = true;
        setBusy(true);
        setError('');
        if (usuarioId == null) {
            setBusy(false);
            return;
        }
        carregarPessoais()
            .catch((e: any) => {
                if (active) setError(e.response?.data?.error || e.response?.data?.message || 'Não foi possível carregar a biblioteca física.');
            })
            .finally(() => {
                if (active) setBusy(false);
            });
        return () => {
            active = false;
        };
    }, [carregarPessoais, usuarioId]);

    const reservasAtivas = useMemo(() => reservas.filter(r => RESERVA_ATIVA.has(String(r.status ?? ''))), [reservas]);
    const multasPendentes = useMemo(() => multas.filter(m => String(m.statusPagamento ?? '') === 'PENDENTE'), [multas]);
    const totalMultasPendentes = useMemo(
        () => multasPendentes.reduce((acc, m) => acc + Number(m.valorTotal ?? 0), 0),
        [multasPendentes],
    );

    const buscarLivros = async () => {
        if (!busca.trim()) {
            setAviso('Digite título, autor ou ISBN para buscar no acervo físico.');
            return;
        }
        setBusyBusca(true);
        setAviso('');
        setError('');
        try {
            setObras(await bibliotecaAlunoApi.buscarObras(busca.trim()));
        } catch (e: any) {
            setError(e.response?.data?.error || e.response?.data?.message || 'Não foi possível buscar no acervo físico.');
        } finally {
            setBusyBusca(false);
        }
    };

    const reservar = async (obraId: number) => {
        setAcaoId(obraId);
        setAviso('');
        setError('');
        try {
            await bibliotecaAlunoApi.reservarObra(usuarioId, obraId);
            await carregarPessoais();
            setAviso('Reserva solicitada com sucesso. Acompanhe na aba "Reservas".');
        } catch (e: any) {
            setError(e.response?.data?.error || e.response?.data?.message || 'Não foi possível reservar a obra.');
        } finally {
            setAcaoId(null);
        }
    };

    const cancelar = async (reservaId: number) => {
        setAcaoId(reservaId);
        setAviso('');
        setError('');
        try {
            await bibliotecaAlunoApi.cancelarReserva(reservaId);
            await carregarPessoais();
            setAviso('Reserva cancelada.');
        } catch (e: any) {
            setError(e.response?.data?.error || e.response?.data?.message || 'Não foi possível cancelar a reserva.');
        } finally {
            setAcaoId(null);
        }
    };

    if (usuarioId == null) {
        return (
            <View style={styles.page}>
                <Text style={styles.title}>Biblioteca Física</Text>
                <Text style={styles.errorText}>Sessão sem usuário identificado. Faça login novamente para ver seus dados da biblioteca.</Text>
            </View>
        );
    }

    if (busy) {
        return (
            <View style={styles.center}>
                <ActivityIndicator/>
            </View>
        );
    }

    return (
        <View style={styles.page}>
            <ScrollView contentContainerStyle={styles.content}>
                <Text style={styles.title}>Biblioteca Física</Text>
                <Text style={styles.greeting}>
                    Olá, <Text style={styles.greetingName}>{session?.nome || session?.username}</Text>! Seus empréstimos, reservas, multas e o acervo disponível.
                </Text>

                {!!error && <Text style={styles.errorText}>{error}</Text>}
                {!!aviso && <Text style={styles.infoText}>{aviso}</Text>}

                <View style={styles.cardsRow}>
                    <View style={styles.card}>
                        <Text style={styles.cardValue}>{reservasAtivas.length}</Text>
                        <Text style={styles.cardLabel}>Reservas ativas</Text>
                    </View>
                    <View style={styles.card}>
                        <Text style={styles.cardValue}>{emprestimos.length}</Text>
                        <Text style={styles.cardLabel}>Empréstimos ativos</Text>
                    </View>
                </View>
                <View style={styles.cardsRow}>
                    <View style={styles.card}>
                        <Text style={styles.cardValue}>{multasPendentes.length}</Text>
                        <Text style={styles.cardLabel}>Multas pendentes</Text>
                    </View>
                    <View style={styles.card}>
                        <Text style={styles.cardValue}>{formatarMoeda(totalMultasPendentes)}</Text>
                        <Text style={styles.cardLabel}>Total em multas</Text>
                    </View>
                </View>

                <Tabs
                    initial="livros"
                    tabs={[
                        {
                            key: 'livros',
                            label: 'Livros disponíveis',
                            content: (
                                <View>
                                    <View style={styles.searchRow}>
                                        <TextInput
                                            style={styles.searchInput}
                                            placeholder="Buscar por título, autor ou ISBN..."
                                            placeholderTextColor="#9ca3af"
                                            value={busca}
                                            onChangeText={setBusca}
                                            onSubmitEditing={buscarLivros}
                                            returnKeyType="search"
                                        />
                                        <Pressable style={styles.button} onPress={buscarLivros} disabled={busyBusca}>
                                            <Text style={styles.buttonText}>{busyBusca ? '...' : 'Buscar'}</Text>
                                        </Pressable>
                                    </View>
                                    {obras.length === 0 && (
                                        <Text style={styles.empty}>Nenhum livro localizado. Use a busca para consultar o acervo físico.</Text>
                                    )}
                                    {obras.map(o => (
                                        <View style={styles.item} key={o.id}>
                                            <Text style={styles.itemTitle}>{o.titulo}</Text>
                                            {!!o.subtitulo && <Text style={styles.itemMeta}>{o.subtitulo}</Text>}
                                            <Text style={styles.itemMeta}>{[o.autores, o.editora, o.anoPublicacao].filter(Boolean).join(' · ')}</Text>
                                            <Pressable
                                                style={[styles.button, styles.buttonMarginTop]}
                                                onPress={() => reservar(o.id)}
                                                disabled={acaoId === o.id}
                                            >
                                                <Text style={styles.buttonText}>{acaoId === o.id ? 'Reservando...' : 'Reservar'}</Text>
                                            </Pressable>
                                        </View>
                                    ))}
                                </View>
                            ),
                        },
                        {
                            key: 'reservas',
                            label: 'Minhas reservas',
                            content: (
                                <View>
                                    {reservas.length === 0 && <Text style={styles.empty}>Você não possui reservas.</Text>}
                                    {reservas.map(r => (
                                        <View style={styles.item} key={r.id}>
                                            <Text style={styles.itemTitle}>{r.obra?.titulo ?? '-'}</Text>
                                            <Text style={styles.itemMeta}>Solicitação: {formatarDataHora(r.dataSolicitacao)}</Text>
                                            <Text style={styles.itemMeta}>Posição na fila: {r.posicaoFila ?? '-'}</Text>
                                            <Text style={styles.itemMeta}>Limite retirada: {formatarDataHora(r.dataLimiteRetirada)}</Text>
                                            <View style={[styles.statusBadge, {backgroundColor: '#e8f0fe'}]}>
                                                <Text style={[styles.statusText, {color: '#2a5a88'}]}>{r.status ?? '-'}</Text>
                                            </View>
                                            {RESERVA_ATIVA.has(String(r.status ?? '')) && (
                                                <Pressable
                                                    style={[styles.buttonDanger, styles.buttonMarginTop]}
                                                    onPress={() => cancelar(r.id)}
                                                    disabled={acaoId === r.id}
                                                >
                                                    <Text style={styles.buttonText}>{acaoId === r.id ? 'Cancelando...' : 'Cancelar reserva'}</Text>
                                                </Pressable>
                                            )}
                                        </View>
                                    ))}
                                </View>
                            ),
                        },
                        {
                            key: 'emprestimos',
                            label: 'Meus empréstimos',
                            content: (
                                <View>
                                    {emprestimos.length === 0 && <Text style={styles.empty}>Você não possui empréstimos ativos.</Text>}
                                    {emprestimos.map(e => (
                                        <View style={styles.item} key={e.id}>
                                            <Text style={styles.itemTitle}>{e.exemplar?.obra?.titulo ?? '-'}</Text>
                                            <Text style={styles.itemMeta}>Tombo: {e.exemplar?.tombo ?? '-'} · {e.exemplar?.localizacao ?? ''}</Text>
                                            <Text style={styles.itemMeta}>Retirada: {formatarDataHora(e.dataRetirada)}</Text>
                                            <Text style={styles.itemMeta}>Devolução prevista: {formatarDataCurta(e.dataPrevistaDevolucao)}</Text>
                                            <Text style={styles.itemMeta}>Renovações: {e.quantidadeRenovacoes ?? 0}</Text>
                                            <View style={[styles.statusBadge, {backgroundColor: '#e8f0fe'}]}>
                                                <Text style={[styles.statusText, {color: '#2a5a88'}]}>{e.status ?? '-'}</Text>
                                            </View>
                                        </View>
                                    ))}
                                    <Text style={styles.hint}>Renovações e devoluções são feitas no balcão da biblioteca.</Text>
                                </View>
                            ),
                        },
                        {
                            key: 'multas',
                            label: 'Minhas multas',
                            content: (
                                <View>
                                    {multas.length === 0 && <Text style={styles.empty}>Você não possui multas. 🎉</Text>}
                                    {multas.map(m => (
                                        <View style={styles.item} key={m.id}>
                                            <Text style={styles.itemTitle}>{m.emprestimo?.exemplar?.obra?.titulo ?? '-'}</Text>
                                            <Text style={styles.itemMeta}>Dias em atraso: {m.diasAtraso ?? '-'}</Text>
                                            <Text style={styles.itemMeta}>Valor total: {formatarMoeda(m.valorTotal)}</Text>
                                            <Text style={styles.itemMeta}>Motivo: {m.motivo ?? '-'}</Text>
                                            <View style={[styles.statusBadge, {backgroundColor: '#fdecea'}]}>
                                                <Text style={[styles.statusText, {color: '#a61b29'}]}>{m.statusPagamento ?? '-'}</Text>
                                            </View>
                                        </View>
                                    ))}
                                    <Text style={styles.hint}>Regularize suas multas pendentes no balcão da biblioteca ou na tesouraria.</Text>
                                </View>
                            ),
                        },
                    ]}
                />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    page: {flex: 1, backgroundColor: '#fff'},
    content: {padding: 16, paddingBottom: 32},
    center: {flex: 1, justifyContent: 'center', alignItems: 'center'},
    title: {fontSize: 22, fontWeight: 'bold', color: '#2b2b2b', marginBottom: 8},
    greeting: {fontSize: 15, color: '#555', marginBottom: 16},
    greetingName: {fontWeight: '700', color: '#2b2b2b'},
    errorText: {color: '#a61b29', fontSize: 14, marginBottom: 12},
    infoText: {color: '#2a5a88', fontSize: 14, marginBottom: 12},
    empty: {textAlign: 'center', color: '#888', marginTop: 16, fontSize: 14},
    hint: {color: '#888', fontSize: 12, marginTop: 12},
    cardsRow: {flexDirection: 'row', marginBottom: 10},
    card: {flex: 1, backgroundColor: '#f4f7fa', borderRadius: 8, padding: 14, marginRight: 10, alignItems: 'center'},
    cardValue: {fontSize: 22, fontWeight: 'bold', color: '#2a5a88'},
    cardLabel: {fontSize: 11, color: '#666', marginTop: 4, textAlign: 'center'},
    searchRow: {flexDirection: 'row', marginBottom: 12},
    searchInput: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#d1d5db',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: 14,
        color: '#1f2937',
        marginRight: 8,
    },
    button: {backgroundColor: '#1e7e45', borderRadius: 8, paddingHorizontal: 16, paddingVertical: 10, justifyContent: 'center'},
    buttonMarginTop: {marginTop: 10, alignSelf: 'flex-start'},
    buttonDanger: {backgroundColor: '#a61b29', borderRadius: 8, paddingHorizontal: 16, paddingVertical: 10, justifyContent: 'center'},
    buttonText: {color: '#fff', fontWeight: '700', fontSize: 14, textAlign: 'center'},
    item: {backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#e5e5e5', borderRadius: 8, padding: 14, marginBottom: 12},
    itemTitle: {fontSize: 16, fontWeight: '700', color: '#2b2b2b'},
    itemMeta: {fontSize: 12, color: '#666', marginTop: 2},
    statusBadge: {borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4, alignSelf: 'flex-start', marginTop: 8},
    statusText: {fontSize: 11, fontWeight: '700'},
});
