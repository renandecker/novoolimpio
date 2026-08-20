import {useCallback, useEffect, useMemo, useState} from 'react';
import {
    ActivityIndicator,
    FlatList,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {useQuery, useQueryClient} from '@tanstack/react-query';
import {useAuth} from './auth';
import {countNaoLidas, subscribeNotificacoesStream} from './notificacoes';
import {moduleIcon} from './moduleIcons';
import {can} from './permissions';
import {ReportButton} from './ReportButton';
import {FavoritosButton} from './FavoritosButton';
import type {Modulo} from './types';
import type {FavoritoDisponivel} from './favoritos';

export type ParamList = { home: undefined; [route: string]: undefined | object };

type FlatItem = { key: string; label: string; parent: string | null; icon: string; keywords: string };

const normalizeOutcome = (value: string) => value.replace(/(\.xhtml)+$/i, '').replace(/^\/+|\/+$/g, '') || 'default';

export default function HomeScreen({navigation}: NativeStackScreenProps<ParamList, 'home'>) {
    const {session, ready, signOut} = useAuth();
    const queryClient = useQueryClient();
    const [favoritos, setFavoritos] = useState<FavoritoDisponivel[]>([]);
    const loading = !ready;
    const [refreshing, setRefreshing] = useState(false);
    const [search, setSearch] = useState('');
    const [openGroups, setOpenGroups] = useState<Record<number, boolean>>({});
    const [portalOpen, setPortalOpen] = useState(true);

    const bellCount = useQuery({
        queryKey: ['notificacoes', 'nao-lidas'],
        queryFn: countNaoLidas,
        refetchInterval: 30_000,
        refetchIntervalInBackground: true,
        retry: false,
    });

    useEffect(() => {
        const unsubscribe = subscribeNotificacoesStream(() => {
            queryClient.invalidateQueries({queryKey: ['notificacoes', 'nao-lidas']});
            queryClient.invalidateQueries({queryKey: ['notificacoes', 'minhas']});
        });
        return unsubscribe;
    }, [queryClient]);

    const handleRefresh = useCallback(async () => {
        setRefreshing(true);
        try {
            await listarFavoritos();
        } finally {
            setRefreshing(false);
        }
    }, [listarFavoritos]);

    useEffect(() => {
        if (ready) {
            listarFavoritos();
        }
    }, [ready, listarFavoritos]);

    const routeNames = navigation.getState().routeNames;
    const modulePermissions = session?.modulePermissions ?? {};
    const allowedKeys = Object.keys(modulePermissions).length ? new Set(Object.keys(modulePermissions)) : null;

    const navigateTo = useCallback(
        (key: string) => {
            navigation.navigate(key as never);
        },
        [navigation],
    );

    const toggleGroup = (id: number) => setOpenGroups((prev) => ({...prev, [id]: !prev[id]}));

    const flatItems = useMemo(() => {
        const items: FlatItem[] = [];
        if (favoritos.length === 0) {
            items.push(
                {
                    key: 'view/favoritoUsuario/listFavoritoUsuario',
                    label: 'Meus Favoritos',
                    parent: null,
                    icon: '⭐',
                    keywords: 'favoritos usuario'
                },
            );
        }
        favoritos.forEach((item) => {
            const key = normalizeOutcome(item.outcome);
            if (!key.startsWith('view/') || !routeNames.includes(key)) return;
            if (allowedKeys && !allowedKeys.has(key)) return;
            items.push({
                key,
                label: item.nome,
                parent: null,
                icon: item.icon,
                keywords: `${item.nome} ${item.outcome}`,
            });
        });
        return items;
    }, [favoritos, routeNames, allowedKeys]);

    const query = search.trim().toLowerCase();
    const searchResults = useMemo(() => {
        if (!query) return null;
        const tokens = query.split(/\s+/);
        return flatItems.filter((item) => {
            const haystack = `${item.label} ${item.parent ?? ''} ${item.keywords}`.toLowerCase();
            return tokens.every((t) => haystack.includes(t));
        });
    }, [query, flatItems]);

    return (
        <View style={styles.page}>
            <View style={styles.header}>
                <View>
                    <Text style={styles.title}>Olímpio</Text>
                    <Text style={styles.subtitle}>{session?.username}</Text>
                </View>
                <View style={styles.headerActions}>
                    <ReportButton navigateTo={navigateTo}/>
                    <FavoritosButton navigateTo={navigateTo}/>
                    <Pressable
                        style={styles.bellButton}
                        onPress={() => navigateTo('view/notificacao/listNotificacao')}
                    >
                        <Text style={styles.bellIcon}>🔔</Text>
                        {unread > 0 && (
                            <View style={styles.bellBadge}>
                                <Text style={styles.bellBadgeText}>{unread > 99 ? '99+' : unread}</Text>
                            </View>
                        )}
                    </Pressable>
                    <Pressable style={styles.iconButton} onPress={() => navigateTo('meus-dados')}>
                        <Text style={styles.bellIcon}>👤</Text>
                    </Pressable>
                    <Pressable style={styles.signOutButton} onPress={signOut}>
                        <Text style={styles.signOutText}>Sair</Text>
                    </Pressable>
                </View>
            </View>

            <TextInput
                style={styles.searchInput}
                placeholder="Buscar menu ou tela..."
                placeholderTextColor="#9a9a9a"
                value={search}
                onChangeText={setSearch}
            />

            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator/>
                </View>
            ) : searchResults ? (
                searchResults.length === 0 ? (
                    <Text style={styles.empty}>Nenhum item encontrado.</Text>
                ) : (
                    <FlatList
                        data={searchResults}
                        keyExtractor={(item, index) => `${item.key}-${index}`}
                        refreshing={refreshing}
                        onRefresh={handleRefresh}
                        renderItem={({item}) => (
                            <Pressable style={styles.menuItem} onPress={() => navigateTo(item.key)}>
                                <Text style={styles.menuIcon}>{item.icon}</Text>
                                <Text style={styles.menuText}>
                                    {item.parent ? `${item.parent} › ${item.label}` : item.label}
                                </Text>
                            </Pressable>
                        )}
                    />
                )
            ) : (
                <FlatList
                    data={favoritos}
                    keyExtractor={(item) => item.outcome}
                    refreshing={refreshing}
                    onRefresh={handleRefresh}
                    renderItem={({item}) => (
                        <Pressable style={styles.menuItem} onPress={() => navigateTo(normalizeOutcome(item.outcome))}>
                            <Text style={styles.menuIcon}>{moduleIcon(item.nome, item.icon)}</Text>
                            <Text style={styles.menuText}>{item.nome}</Text>
                        </Pressable>
                    )}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    page: {flex: 1, padding: 16},
    center: {flex: 1, justifyContent: 'center', alignItems: 'center'},
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
    },
    title: {fontSize: 24, fontWeight: 'bold', color: '#2b2b2b'},
    subtitle: {fontSize: 13, color: '#888', marginTop: 2},
    headerActions: {flexDirection: 'row', alignItems: 'center'},
    bellButton: {marginRight: 8, padding: 6},
    iconButton: {marginRight: 8, padding: 6},
    bellIcon: {fontSize: 18},
    bellBadge: {
        position: 'absolute',
        top: 0,
        right: 0,
        backgroundColor: '#a61b29',
        borderRadius: 8,
        minWidth: 16,
        height: 16,
        paddingHorizontal: 3,
        justifyContent: 'center',
        alignItems: 'center',
    },
    bellBadgeText: {color: '#ffffff', fontSize: 9, fontWeight: '700'},
    signOutButton: {backgroundColor: '#fdecea', borderRadius: 4, paddingHorizontal: 14, paddingVertical: 8},
    signOutText: {color: '#a61b29', fontSize: 14, fontWeight: '700'},
    searchInput: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 6,
        paddingHorizontal: 12,
        paddingVertical: 8,
        fontSize: 14,
        color: '#2b2b2b',
        marginBottom: 10,
    },
    empty: {textAlign: 'center', color: '#888', marginTop: 32},
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 12,
        borderBottomWidth: 1,
        borderColor: '#eee',
        borderRadius: 4,
    },
});