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
import {useModuleIcon} from './moduleIcons';
import {can} from './permissions';
import {ReportButton} from './ReportButton';
import {FavoritosButton} from './FavoritosButton';
import {listarFavoritos} from './favoritos';
import type {Modulo} from './types';
import type {FavoritoDisponivel} from './favoritos';
import {Colors, Spacing, BorderRadius, Typography, Shadows, Layout} from './theme';

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

    const {getIcon} = useModuleIcon();

    const bellCount = useQuery({
        queryKey: ['notificacoes', 'nao-lidas'],
        queryFn: countNaoLidas,
        refetchInterval: 30_000,
        refetchIntervalInBackground: true,
        retry: false,
    });

    const unread = bellCount.data ?? 0;

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
            const data = await listarFavoritos();
            setFavoritos(data);
        } finally {
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        if (ready) {
            listarFavoritos().then(setFavoritos);
        }
    }, [ready]);

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

    const renderMenuItem = ({item}: {item: FlatItem | FavoritoDisponivel}) => {
        const isFav = 'outcome' in item;
        const key = isFav ? normalizeOutcome(item.outcome) : item.key;
        const label = isFav ? item.nome : item.label;
        const icon = isFav ? getIcon(item.nome, item.icon) : item.icon;
        const parent = isFav ? null : item.parent;

        return (
            <Pressable style={styles.menuItem} onPress={() => navigateTo(key)}>
                <View style={styles.menuIconContainer}>
                    <Text style={styles.menuIcon}>{icon}</Text>
                </View>
                <Text style={styles.menuText}>
                    {parent ? `${parent} › ${label}` : label}
                </Text>
            </Pressable>
        );
    };

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
                placeholder="Buscar favoritos..."
                placeholderTextColor={Colors.textPlaceholder}
                value={search}
                onChangeText={setSearch}
            />

            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator color={Colors.primary} size="large"/>
                </View>
            ) : searchResults ? (
                searchResults.length === 0 ? (
                    <Text style={styles.empty}>Nenhum favorito encontrado.</Text>
                ) : (
                    <FlatList
                        data={searchResults}
                        keyExtractor={(item, index) => `${item.key}-${index}`}
                        refreshing={refreshing}
                        onRefresh={handleRefresh}
                        renderItem={renderMenuItem}
                        contentContainerStyle={styles.listContent}
                        ItemSeparatorComponent={styles.separator}
                    />
                )
            ) : (
                <FlatList
                    data={favoritos}
                    keyExtractor={(item) => item.outcome}
                    refreshing={refreshing}
                    onRefresh={handleRefresh}
                    renderItem={renderMenuItem}
                    contentContainerStyle={styles.listContent}
                    ItemSeparatorComponent={styles.separator}
                />
            )}
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
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.md,
        paddingBottom: Spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: Colors.borderMedium,
    },
    title: {
        fontSize: Typography.sizes.heading,
        fontWeight: Typography.weights.bold,
        color: Colors.textPrimary,
    },
    subtitle: {
        fontSize: Typography.sizes.sm,
        color: Colors.textLight,
        marginTop: Spacing.xs,
    },
    headerActions: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    bellButton: {
        marginRight: Spacing.sm,
        padding: Spacing.xs,
    },
    iconButton: {
        marginRight: Spacing.sm,
        padding: Spacing.xs,
    },
    bellIcon: {
        fontSize: Typography.sizes.xxxl,
    },
    bellBadge: {
        position: 'absolute',
        top: 0,
        right: 0,
        backgroundColor: Colors.badgeBg,
        borderRadius: BorderRadius.round,
        minWidth: 16,
        height: 16,
        paddingHorizontal: 3,
        justifyContent: 'center',
        alignItems: 'center',
    },
    bellBadgeText: {
        color: Colors.badgeText,
        fontSize: Typography.sizes.xs,
        fontWeight: Typography.weights.bold,
    },
    signOutButton: {
        backgroundColor: Colors.errorBg,
        borderRadius: BorderRadius.md,
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.sm,
        borderWidth: 1,
        borderColor: Colors.errorBorder,
    },
    signOutText: {
        color: Colors.error,
        fontSize: Typography.sizes.base,
        fontWeight: Typography.weights.bold,
    },
    searchInput: {
        borderWidth: 1,
        borderColor: Colors.searchBorder,
        borderRadius: BorderRadius.lg,
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.md,
        fontSize: Typography.sizes.lg,
        color: Colors.textPrimary,
        marginBottom: Spacing.md,
        backgroundColor: Colors.bgSecondary,
    },
    empty: {
        textAlign: 'center',
        color: Colors.textLight,
        marginTop: Spacing.xxxl,
        fontSize: Typography.sizes.base,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: Spacing.lg,
        paddingHorizontal: Spacing.md,
        backgroundColor: Colors.bgSecondary,
        borderRadius: BorderRadius.lg,
        ...Shadows.small,
    },
    menuIconContainer: {
        width: 36,
        height: 36,
        borderRadius: BorderRadius.md,
        backgroundColor: Colors.goldBg,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: Spacing.md,
    },
    menuIcon: {
        fontSize: Typography.sizes.xxxl,
    },
    menuText: {
        fontSize: Typography.sizes.lg,
        color: Colors.textPrimary,
        flex: 1,
    },
    listContent: {
        paddingBottom: Spacing.xxxl,
    },
    separator: {
        height: Spacing.sm,
    },
});