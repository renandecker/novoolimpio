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

export const tileTipoIcone = (tipo: DashboardTileTipo | null | undefined): string =>
    TILE_TIPOS.find((t) => t.value === tipo)?.icone ?? '▫️';

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
    /** classe CSS usada na grade de montagem */
    gradeClass: string;
    /** spans por slot (colunas x linhas) na grade de 12 colunas da prévia */
    spans: Array<{ col: string; row: string }>;
}

export const DASHBOARD_LAYOUTS: DashboardLayout[] = [
    {
        id: 'grade-2x2',
        nome: 'Grade 2x2',
        descricao: '4 quadrinhos iguais',
        slots: 4,
        gradeClass: 'montagem-grade-2x2',
        spans: [
            {col: 'span 1', row: 'span 1'},
            {col: 'span 1', row: 'span 1'},
            {col: 'span 1', row: 'span 1'},
            {col: 'span 1', row: 'span 1'},
        ],
    },
    {
        id: 'destaque-topo',
        nome: 'Destaque no topo',
        descricao: '1 largo em cima + 3 embaixo',
        slots: 4,
        gradeClass: 'montagem-grade-destaque',
        spans: [
            {col: 'span 2', row: 'span 1'},
            {col: 'span 1', row: 'span 1'},
            {col: 'span 1', row: 'span 1'},
            {col: 'span 2', row: 'span 1'},
        ],
    },
    {
        id: 'tres-colunas',
        nome: '3 colunas',
        descricao: '3 quadrinhos lado a lado',
        slots: 3,
        gradeClass: 'montagem-grade-3col',
        spans: [
            {col: 'span 1', row: 'span 1'},
            {col: 'span 1', row: 'span 1'},
            {col: 'span 1', row: 'span 1'},
        ],
    },
    {
        id: 'lateral',
        nome: 'Lateral + principal',
        descricao: '1 alto à esquerda + 2 à direita',
        slots: 3,
        gradeClass: 'montagem-grade-lateral',
        spans: [
            {col: 'span 1', row: 'span 2'},
            {col: 'span 1', row: 'span 1'},
            {col: 'span 1', row: 'span 1'},
        ],
    },
    {
        id: 'empilhado',
        nome: 'Empilhado',
        descricao: '3 quadrinhos em pilha',
        slots: 3,
        gradeClass: 'montagem-grade-empilhado',
        spans: [
            {col: 'span 1', row: 'span 1'},
            {col: 'span 1', row: 'span 1'},
            {col: 'span 1', row: 'span 1'},
        ],
    },
    {
        id: 'grade-3x2',
        nome: 'Grade 3x2',
        descricao: '6 quadrinhos compactos',
        slots: 6,
        gradeClass: 'montagem-grade-3x2',
        spans: [
            {col: 'span 1', row: 'span 1'},
            {col: 'span 1', row: 'span 1'},
            {col: 'span 1', row: 'span 1'},
            {col: 'span 1', row: 'span 1'},
            {col: 'span 1', row: 'span 1'},
            {col: 'span 1', row: 'span 1'},
        ],
    },
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

function readAll(): DashboardMontagem[] {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return [];
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
}

function writeAll(items: DashboardMontagem[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export const listarMontagens = (): DashboardMontagem[] =>
    readAll().sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));

export const carregarMontagem = (id: string): DashboardMontagem | null =>
    readAll().find((m) => m.id === id) ?? null;

export const salvarMontagem = (montagem: DashboardMontagem): DashboardMontagem => {
    const items = readAll();
    const idx = items.findIndex((m) => m.id === montagem.id);
    const next = {...montagem, updatedAt: new Date().toISOString()};
    if (idx >= 0) items[idx] = next;
    else items.push(next);
    writeAll(items);
    return next;
};

export const excluirMontagem = (id: string): void =>
    writeAll(readAll().filter((m) => m.id !== id));

export const novaMontagemId = (): string =>
    `dash-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;

/** Rota de visualização do relatório escolhido em cada quadrinho. */
export const tileViewHref = (tile: DashboardTile): string | null => {
    if (!tile.tipo || !tile.relatorioId) return null;
    switch (tile.tipo) {
        case 'TABELA':
            return `/view/relatorios/viewTabela/${tile.relatorioId}`;
        case 'MAPA':
            return `/view/relatorios/viewMapa?id=${tile.relatorioId}`;
        case 'ORGANOGRAMA':
            return `/view/relatorios/viewOrganograma?id=${tile.relatorioId}`;
        case 'INDICADOR_GAUGE':
            return `/view/relatorios/viewIndicadorGauge/${tile.relatorioId}`;
        case 'GRAFICO':
        default:
            return `/view/relatorios/viewGraficoPizza?id=${tile.relatorioId}`;
    }
};
