import React, {useEffect, useMemo, useState} from 'react';
import {
    ActivityIndicator,
    Linking,
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
    formatarDataHora,
    type EmprestimoVirtual,
    type LivroVirtual,
    type ProvedorVirtual,
} from './bibliotecaAluno';

export default function AlunoBibliotecaVirtualScreen({}: NativeStackScreenProps<ParamList, 'aluno/biblioteca-virtual'>) {
    const {session} = useAuth();
    const usuarioId = session?.idUsuario ?? null;

    const [meus, setMeus] = useState<EmprestimoVirtual[]>([]);
    const [livros, setLivros] = useState<LivroVirtual[]>([]);
    const [provedores, setProvedores] = useState<ProvedorVirtual[]>([]);
    const [busca, setBusca] = useState('');
    const [busy, setBusy] = useState(true);
    const [busyBusca, setBusyBusca] = useState(false);
    const [error, setError] = useState('');
    const [aviso, setAviso] = useState('');

    useEffect(() => {
        let active = true;
        setBusy(true);
        setError('');
        if (usuarioId == null) {
            setBusy(false);
            return;
        }
        Promise.all([
            bibliotecaAlunoApi.meusEmprestimosVirtuaisAtivos(usuarioId),
            bibliotecaAlunoApi.provedoresAtivos(),
        ])
            .then(([emprestimos, provs]) => {
                if (!active) return;
                setMeus(emprestimos);
                setProvedores(provs);
            })
            .catch((e: any) => {
                if (active) setError(e.response?.data?.error || e.response?.data?.message || 'Não foi possível carregar a biblioteca virtual.');
            })
            .finally(() => {
                if (active) setBusy(false);
            });
        return () => {
            active = false;
        };
    }, [usuarioId]);

    const acessosPorProvedor = useMemo(() => {
        const map = new Map<string, number>();
        for (const e of meus) {
            const nome = e.livroDigital?.provedor?.nome || e.livroDigital?.editora || 'Acervo próprio';
            map.set(nome, (map.get(nome) ?? 0) + 1);
        }
        return [...map.entries()];
    }, [meus]);

    const buscarLivros = async () => {
        if (!busca.trim()) {
            setAviso('Digite título, autor ou ISBN para buscar nos livros virtuais dos fornecedores.');
            return;
        }
        setBusyBusca(true);
        setAviso('');
        setError('');
        try {
            setLivros(await bibliotecaAlunoApi.buscarLivrosVirtuais(busca.trim()));
        } catch (e: any) {
            setError(e.response?.data?.error || e.response?.data?.message || 'Não foi possível buscar nos livros virtuais.');
        } finally {
            setBusyBusca(false);
        }
    };

    const abrirRecurso = async (livro: LivroVirtual) => {
        const url = livro.urlRecurso || livro.previewUrl;
        if (!url) {
            setAviso(`"${livro.titulo}" ainda não possui link de acesso publicado pelo fornecedor.`);
            return;
        }
        try {
            const supported = await Linking.canOpenURL(url);
            if (supported) await Linking.openURL(url);
            else setAviso('Não foi possível abrir o link do livro neste dispositivo.');
        } catch {
            setAviso('Não foi possível abrir o link do livro neste dispositivo.');
        }
    };

    if (usuarioId == null) {
        return (
            <View style={styles.page}>
                <Text style={styles.title}>Biblioteca Virtual</Text>
                <Text style={styles.errorText}>Sessão sem usuário identificado. Faça login novamente para ver seus livros virtuais.</Text>
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
                <Text style={styles.title}>Biblioteca Virtual</Text>
                <Text style={styles.greeting}>
                    Olá, <Text style={styles.greetingName}>{session?.nome || session?.username}</Text>! Acesse os livros virtuais dos fornecedores disponíveis para você.
                </Text>

                {!!error && <Text style={styles.errorText}>{error}</Text>}
                {!!aviso && <Text style={styles.infoText}>{aviso}</Text>}

                <View style={styles.cardsRow}>
                    <View style={styles.card}>
                        <Text style={styles.cardValue}>{meus.length}</Text>
                        <Text style={styles.cardLabel}>Meus acessos ativos</Text>
                    </View>
                    <View style={styles.card}>
                        <Text style={styles.cardValue}>{provedores.length}</Text>
                        <Text style={styles.cardLabel}>Fornecedores</Text>
                    </View>
                    <View style={styles.card}>
                        <Text style={styles.cardValue}>{livros.length}</Text>
                        <Text style={styles.cardLabel}>Livros localizados</Text>
                    </View>
                </View>

                <Tabs
                    initial="meus"
                    tabs={[
                        {
                            key: 'meus',
                            label: 'Meus livros',
                            content: (
                                <View>
                                    {meus.length === 0 && (
                                        <Text style={styles.empty}>Você não possui acessos ativos. Consulte o catálogo ou fale com a biblioteca.</Text>
                                    )}
                                    {meus.map(e => (
                                        <View style={styles.item} key={e.id}>
                                            <Text style={styles.itemTitle}>{e.livroDigital?.titulo ?? '-'}</Text>
                                            <Text style={styles.itemMeta}>{e.livroDigital?.autores ?? ''}</Text>
                                            <Text style={styles.itemMeta}>Fornecedor: {e.livroDigital?.provedor?.nome ?? e.livroDigital?.editora ?? 'Acervo próprio'}</Text>
                                            <Text style={styles.itemMeta}>Expira em: {formatarDataHora(e.dataExpiracao)}</Text>
                                            <Text style={styles.itemMeta}>Progresso: {e.progressoLeitura != null ? `${e.progressoLeitura}%` : '-'}</Text>
                                            {e.livroDigital && (
                                                <Pressable style={[styles.button, styles.buttonMarginTop]} onPress={() => abrirRecurso(e.livroDigital!)}>
                                                    <Text style={styles.buttonText}>Abrir livro</Text>
                                                </Pressable>
                                            )}
                                        </View>
                                    ))}
                                    {acessosPorProvedor.length > 0 && (
                                        <Text style={styles.hint}>
                                            Acessos por fornecedor: {acessosPorProvedor.map(([n, q]) => `${n} (${q})`).join(' · ')}
                                        </Text>
                                    )}
                                </View>
                            ),
                        },
                        {
                            key: 'catalogo',
                            label: 'Catálogo',
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
                                    {livros.length === 0 && (
                                        <Text style={styles.empty}>Nenhum livro localizado. Use a busca para consultar o acervo dos fornecedores.</Text>
                                    )}
                                    {livros.map(l => (
                                        <View style={styles.item} key={l.id}>
                                            <Text style={styles.itemTitle}>{l.titulo}</Text>
                                            <Text style={styles.itemMeta}>{[l.autores, l.editora, l.anoPublicacao].filter(Boolean).join(' · ')}</Text>
                                            <Text style={styles.itemMeta}>Fornecedor: {l.provedor?.nome ?? l.editora ?? '-'}</Text>
                                            <Text style={styles.itemMeta}>Formatos: {(l.formatosDisponiveis ?? []).join(', ') || '-'}</Text>
                                            <Pressable style={[styles.button, styles.buttonMarginTop]} onPress={() => abrirRecurso(l)}>
                                                <Text style={styles.buttonText}>Abrir</Text>
                                            </Pressable>
                                        </View>
                                    ))}
                                    <Text style={styles.hint}>O acesso integral depende das licenças contratadas com cada fornecedor.</Text>
                                </View>
                            ),
                        },
                        {
                            key: 'fornecedores',
                            label: 'Fornecedores',
                            content: (
                                <View>
                                    {provedores.length === 0 && (
                                        <Text style={styles.empty}>Nenhum fornecedor ativo no momento.</Text>
                                    )}
                                    {provedores.map(p => (
                                        <View style={styles.item} key={p.id}>
                                            <Text style={styles.itemTitle}>{p.nome}</Text>
                                            {!!p.publicoAlvo || !!p.areaConhecimento ? (
                                                <Text style={styles.itemMeta}>{[p.publicoAlvo, p.areaConhecimento].filter(Boolean).join(' · ')}</Text>
                                            ) : null}
                                            {!!p.descricao && <Text style={styles.itemMeta}>{p.descricao}</Text>}
                                            <View style={styles.badgesRow}>
                                                {!!p.suportaSso && (
                                                    <View style={[styles.statusBadge, {backgroundColor: '#e8f0fe'}]}>
                                                        <Text style={[styles.statusText, {color: '#2a5a88'}]}>SSO</Text>
                                                    </View>
                                                )}
                                                {!!p.suportaLti && (
                                                    <View style={[styles.statusBadge, {backgroundColor: '#e8f0fe'}]}>
                                                        <Text style={[styles.statusText, {color: '#2a5a88'}]}>LTI</Text>
                                                    </View>
                                                )}
                                                <View style={[styles.statusBadge, {backgroundColor: '#ecfdf5'}]}>
                                                    <Text style={[styles.statusText, {color: '#059669'}]}>{p.statusDisplay ?? 'Ativo'}</Text>
                                                </View>
                                            </View>
                                            {!!p.urlApi && (
                                                <Pressable style={[styles.button, styles.buttonMarginTop]} onPress={() => Linking.openURL(p.urlApi!)}>
                                                    <Text style={styles.buttonText}>Acessar plataforma</Text>
                                                </Pressable>
                                            )}
                                        </View>
                                    ))}
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
    cardValue: {fontSize: 20, fontWeight: 'bold', color: '#2a5a88'},
    cardLabel: {fontSize: 10, color: '#666', marginTop: 4, textAlign: 'center'},
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
    buttonText: {color: '#fff', fontWeight: '700', fontSize: 14, textAlign: 'center'},
    item: {backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#e5e5e5', borderRadius: 8, padding: 14, marginBottom: 12},
    itemTitle: {fontSize: 16, fontWeight: '700', color: '#2b2b2b'},
    itemMeta: {fontSize: 12, color: '#666', marginTop: 2},
    badgesRow: {flexDirection: 'row', marginTop: 8},
    statusBadge: {borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4, alignSelf: 'flex-start', marginRight: 6},
    statusText: {fontSize: 11, fontWeight: '700'},
});
