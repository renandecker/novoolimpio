import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from './auth';
import { countNaoLidas, subscribeNotificacoesStream } from './notificacoes';
import { moduleIcon } from './moduleIcons';
import { ReportButton } from './ReportButton';
import { FavoritosButton } from './FavoritosButton';
import type { Modulo } from './types';

export type ParamList = { home: undefined; [route: string]: undefined | object };

type FlatItem = { key: string; label: string; parent: string | null; icon: string; keywords: string };

const normalizeOutcome = (value: string) => value.replace(/(\.xhtml)+$/i, '').replace(/^\/+|\/+$/g, '') || 'default';

export default function HomeScreen({ navigation }: NativeStackScreenProps<ParamList, 'home'>) {
  const { session, ready, signOut, refreshModules } = useAuth();
  const queryClient = useQueryClient();
  const modulos: Modulo[] = useMemo(() => session?.modules ?? [], [session]);
  const loading = !ready || session?.modules === undefined;
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
      queryClient.invalidateQueries({ queryKey: ['notificacoes', 'nao-lidas'] });
      queryClient.invalidateQueries({ queryKey: ['notificacoes', 'minhas'] });
    });
    return unsubscribe;
  }, [queryClient]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refreshModules();
    } finally {
      setRefreshing(false);
    }
  }, [refreshModules]);

  useEffect(() => {
    // Sessões salvas antes desta atualização não têm "modules" em cache ainda.
    if (ready && session && session.modules === undefined) {
      refreshModules();
    }
  }, [ready, session, refreshModules]);

  const routeNames = navigation.getState().routeNames;
  const modulePermissions = session?.modulePermissions ?? {};
  const allowedKeys = Object.keys(modulePermissions).length ? new Set(Object.keys(modulePermissions)) : null;

  const isLeafAllowed = useCallback(
    (modulo: Modulo) => {
      const key = normalizeOutcome(modulo.outcome || '');
      if (!key.startsWith('view/') || !routeNames.includes(key)) return false;
      if (allowedKeys && !allowedKeys.has(key)) return false;
      return true;
    },
    [routeNames, allowedKeys],
  );

  const childrenByParent = useMemo(() => {
    const map = new Map<number, Modulo[]>();
    for (const m of modulos) {
      if (m.antecessorId != null) {
        const list = map.get(m.antecessorId) ?? [];
        list.push(m);
        map.set(m.antecessorId, list);
      }
    }
    for (const list of map.values()) list.sort((a, b) => a.ordem - b.ordem);
    return map;
  }, [modulos]);

  const topModulos = useMemo(
    () => modulos.filter((m) => m.antecessorId == null).sort((a, b) => a.ordem - b.ordem),
    [modulos],
  );

  const hasVisibleDescendant = useCallback(
    (modulo: Modulo): boolean => {
      const children = childrenByParent.get(modulo.id) ?? [];
      if (children.length === 0) return isLeafAllowed(modulo);
      return children.some((child) => hasVisibleDescendant(child));
    },
    [childrenByParent, isLeafAllowed],
  );

  const flatItems = useMemo(() => {
    const items: FlatItem[] = [];
    if (modulos.length === 0) {
      items.push(
        { key: 'aluno/dashboard', label: 'Dashboard', parent: 'Portal do Aluno', icon: '📊', keywords: 'portal aluno dashboard' },
        { key: 'aluno/boletim', label: 'Boletim', parent: 'Portal do Aluno', icon: '📄', keywords: 'portal aluno boletim notas' },
        { key: 'aluno/frequencia', label: 'Frequência', parent: 'Portal do Aluno', icon: '📅', keywords: 'portal aluno frequencia' },
      );
    }
    const walk = (modulo: Modulo, parent: string | null) => {
      const children = childrenByParent.get(modulo.id) ?? [];
      if (children.length === 0) {
        if (isLeafAllowed(modulo)) {
          items.push({
            key: normalizeOutcome(modulo.outcome),
            label: modulo.rotulo,
            parent,
            icon: moduleIcon(modulo.rotulo, modulo.icone),
            keywords: `${modulo.rotulo} ${modulo.descricao ?? ''} ${modulo.outcome}`,
          });
        }
      } else {
        for (const child of children) walk(child, modulo.rotulo);
      }
    };
    for (const m of topModulos) walk(m, null);
    return items;
  }, [modulos, topModulos, childrenByParent, isLeafAllowed]);

  const query = search.trim().toLowerCase();
  const searchResults = useMemo(() => {
    if (!query) return null;
    const tokens = query.split(/\s+/);
    return flatItems.filter((item) => {
      const haystack = `${item.label} ${item.parent ?? ''} ${item.keywords}`.toLowerCase();
      return tokens.every((t) => haystack.includes(t));
    });
  }, [query, flatItems]);

  const navigateTo = useCallback(
    (key: string) => {
      navigation.navigate(key as never);
    },
    [navigation],
  );

  const toggleGroup = (id: number) => setOpenGroups((prev) => ({ ...prev, [id]: !prev[id] }));

  const renderModulo = (modulo: Modulo, depth: number) => {
    const children = childrenByParent.get(modulo.id) ?? [];
    const isGroup = children.length > 0;
    if (!hasVisibleDescendant(modulo)) return null;

    if (!isGroup) {
      return (
        <Pressable
          key={modulo.id}
          style={[styles.menuItem, depth > 0 && styles.menuSubItem]}
          onPress={() => navigateTo(normalizeOutcome(modulo.outcome))}
        >
          {depth === 0 && <Text style={styles.menuIcon}>{moduleIcon(modulo.rotulo, modulo.icone)}</Text>}
          <Text style={styles.menuText}>{modulo.rotulo}</Text>
        </Pressable>
      );
    }

    const open = openGroups[modulo.id] ?? false;
    return (
      <View key={modulo.id}>
        <Pressable style={[styles.menuItem, depth > 0 && styles.menuSubItem]} onPress={() => toggleGroup(modulo.id)}>
          {depth === 0 && <Text style={styles.menuIcon}>{moduleIcon(modulo.rotulo, modulo.icone)}</Text>}
          <Text style={styles.menuText}>{modulo.rotulo}</Text>
          <Text style={styles.menuArrow}>{open ? '▾' : '▸'}</Text>
        </Pressable>
        {open && <View style={styles.submenu}>{children.map((child) => renderModulo(child, depth + 1))}</View>}
      </View>
    );
  };

  const unread = bellCount.data ?? 0;

  return (
    <View style={styles.page}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Olímpio</Text>
          <Text style={styles.subtitle}>{session?.username}</Text>
        </View>
        <View style={styles.headerActions}>
          <ReportButton navigateTo={navigateTo} />
          <FavoritosButton navigateTo={navigateTo} />
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
          <ActivityIndicator />
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
            renderItem={({ item }) => (
              <Pressable style={styles.menuItem} onPress={() => navigateTo(item.key)}>
                <Text style={styles.menuIcon}>{item.icon}</Text>
                <Text style={styles.menuText}>
                  {item.parent ? `${item.parent} › ${item.label}` : item.label}
                </Text>
              </Pressable>
            )}
          />
        )
      ) : modulos.length === 0 ? (
        <View>
          <Pressable style={styles.menuItem} onPress={() => setPortalOpen((prev) => !prev)}>
            <Text style={styles.menuIcon}>🎓</Text>
            <Text style={styles.menuText}>Portal do Aluno</Text>
            <Text style={styles.menuArrow}>{portalOpen ? '▾' : '▸'}</Text>
          </Pressable>
          {portalOpen && (
            <View style={styles.submenu}>
              <Pressable style={[styles.menuItem, styles.menuSubItem]} onPress={() => navigateTo('aluno/dashboard')}>
                <Text style={styles.menuText}>Dashboard</Text>
              </Pressable>
              <Pressable style={[styles.menuItem, styles.menuSubItem]} onPress={() => navigateTo('aluno/boletim')}>
                <Text style={styles.menuText}>Boletim</Text>
              </Pressable>
              <Pressable style={[styles.menuItem, styles.menuSubItem]} onPress={() => navigateTo('aluno/frequencia')}>
                <Text style={styles.menuText}>Frequência</Text>
              </Pressable>
            </View>
          )}
        </View>
      ) : (
        <FlatList
          data={topModulos}
          keyExtractor={(item) => String(item.id)}
          refreshing={refreshing}
          onRefresh={handleRefresh}
          renderItem={({ item }) => renderModulo(item, 0)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, padding: 16 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  title: { fontSize: 24, fontWeight: 'bold', color: '#2b2b2b' },
  subtitle: { fontSize: 13, color: '#888', marginTop: 2 },
  headerActions: { flexDirection: 'row', alignItems: 'center' },
  bellButton: { marginRight: 8, padding: 6 },
  iconButton: { marginRight: 8, padding: 6 },
  bellIcon: { fontSize: 18 },
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
  bellBadgeText: { color: '#ffffff', fontSize: 9, fontWeight: '700' },
  signOutButton: { backgroundColor: '#fdecea', borderRadius: 4, paddingHorizontal: 14, paddingVertical: 8 },
  signOutText: { color: '#a61b29', fontSize: 14, fontWeight: '700' },
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
  empty: { textAlign: 'center', color: '#888', marginTop: 32 },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderColor: '#eee',
    borderRadius: 4,
  },
  menuSubItem: { paddingLeft: 32, paddingVertical: 11 },
  menuIcon: { fontSize: 16, marginRight: 10 },
  menuText: { fontSize: 16, color: '#2a5a88', fontWeight: '600', flex: 1 },
  menuArrow: { fontSize: 18, color: '#999' },
  submenu: {},
});
