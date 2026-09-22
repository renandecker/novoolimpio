import AsyncStorage from '@react-native-async-storage/async-storage';

export type DashboardTileTipo =
    | 'TABELA'
    | 'GRAFICO'
    | 'MAPA'
    | 'ORGANOGRAMA'
    | 'INDICADOR_GAUGE';

export const TILE_TIPOS: Array<{ value: DashboardTileTipo; label: string; icone: string }> = [
    {value: 'TABELA', label: 'Tabela', icone: '📋'},
    {value: 'GRAFICO', label: 'Gráfico', icone: '📈'},
    {value: 'MAPA', label: 'Mapa', icone: '🗺️'},
    {value: 'ORGANOGRAMA', label: 'Organograma', icone: '🌳'},
    {value: 'INDICADOR_GAUGE', label: 'Indicador Gauge', icone: '🧭'},
];

export const tileTipoLabel = (tipo: DashboardTileTipo | null | undefined): string =>
    TILE_TIPOS.find((t) => t.value === tipo)?.label ?? 'Não definido';

export interface DashboardTile {
    id: string;
    tipo: DashboardTileTipo | null;
    relatorioId: number | null;
    relatorioNome: string | null;
    titulo: string;
}

export type DashboardLayoutId =
    | 'grade-2x2'
    | 'destaque-topo'
    | 'tres-colunas'
    | 'lateral'
    | 'empilhado'
    | 'grade-3x2';

export interface DashboardLayout {
    id: DashboardLayoutId;
    nome: string;
    descricao: string;
    slots: number;
}

export const DASHBOARD_LAYOUTS: DashboardLayout[] = [
    {id: 'grade-2x2', nome: 'Grade 2x2', descricao: '4 quadrinhos iguais', slots: 4},
    {id: 'destaque-topo', nome: 'Destaque no topo', descricao: '1 largo em cima + 3 embaixo', slots: 4},
    {id: 'tres-colunas', nome: '3 colunas', descricao: '3 quadrinhos lado a lado', slots: 3},
    {id: 'lateral', nome: 'Lateral + principal', descricao: '1 alto à esquerda + 2 à direita', slots: 3},
    {id: 'empilhado', nome: 'Empilhado', descricao: '3 quadrinhos em pilha', slots: 3},
    {id: 'grade-3x2', nome: 'Grade 3x2', descricao: '6 quadrinhos compactos', slots: 6},
];

export interface DashboardMontagem {
    id: string;
    nome: string;
    layoutId: DashboardLayoutId;
    tiles: DashboardTile[];
    updatedAt: string;
}

const STORAGE_KEY = 'olimpio.dashboards.v1';

export const emptyTile = (slot: number): DashboardTile => ({
    id: `slot-${slot}-${Date.now().toString(36)}`,
    tipo: null,
    relatorioId: null,
    relatorioNome: null,
    titulo: '',
});

export const tilesForLayout = (layoutId: DashboardLayoutId, prev: DashboardTile[] = []): DashboardTile[] => {
    const layout = DASHBOARD_LAYOUTS.find((l) => l.id === layoutId) ?? DASHBOARD_LAYOUTS[0];
    return Array.from({length: layout.slots}, (_, i) => prev[i] ?? emptyTile(i + 1));
};

async function readAll(): Promise<DashboardMontagem[]> {
    try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (!raw) return [];
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
}

async function writeAll(items: DashboardMontagem[]): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export const listarMontagens = async (): Promise<DashboardMontagem[]> => {
    const items = await readAll();
    return items.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
};

export const carregarMontagem = async (id: string): Promise<DashboardMontagem | null> => {
    const items = await readAll();
    return items.find((m) => m.id === id) ?? null;
};

export const salvarMontagem = async (montagem: DashboardMontagem): Promise<DashboardMontagem> => {
    const items = await readAll();
    const idx = items.findIndex((m) => m.id === montagem.id);
    const next = {...montagem, updatedAt: new Date().toISOString()};
    if (idx >= 0) items[idx] = next;
    else items.push(next);
    await writeAll(items);
    return next;
};

export const excluirMontagem = async (id: string): Promise<void> => {
    const items = await readAll();
    await writeAll(items.filter((m) => m.id !== id));
};

export const novaMontagemId = (): string =>
    `dash-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;

/** Nome da rota de visualização do relatório escolhido em cada quadrinho. */
export const tileViewRoute = (tile: DashboardTile): { name: string; params?: object } | null => {
    if (!tile.tipo || !tile.relatorioId) return null;
    switch (tile.tipo) {
        case 'TABELA':
            return {name: 'view/relatorios/viewTabela', params: {id: String(tile.relatorioId)}};
        case 'MAPA':
            return {name: 'view/relatorios/viewMapa', params: {id: String(tile.relatorioId)}};
        case 'ORGANOGRAMA':
            return {name: 'view/relatorios/viewOrganograma', params: {id: String(tile.relatorioId)}};
        case 'INDICADOR_GAUGE':
            return {name: 'view/relatorios/viewIndicadorGauge/:id', params: {id: String(tile.relatorioId)}};
        case 'GRAFICO':
        default:
            return {name: 'view/relatorios/viewGraficoPizza', params: {id: String(tile.relatorioId)}};
    }
};
