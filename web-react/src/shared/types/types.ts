/**
 * Linha generica de CRUD. As colunas vem do backend e variam por recurso, entao
 * o registro aceita propriedades adicionais alem de id/nome/dadosJson.
 */
export type ApiItem = {
    id: number;
    nome: string;
    dadosJson?: string;
    [key: string]: any;
};
export type ApiRequest = Omit<ApiItem, 'id'>;
export type PagedResponse<T> = { content: T[]; totalElements: number; page: number; size: number; totalPages: number };
export type SortRequest = { field?: string; direction?: 'asc' | 'desc' };
export type ModulePermissions = Record<string, string[]>;

export interface PreferenciaNotificacaoCanal {
  canal: string;
  canalLabel: string;
  ativo: boolean;
}

export interface PreferenciaNotificacaoTipo {
  tipo: string;
  tipoLabel: string;
  descricao: string;
  canais: PreferenciaNotificacaoCanal[];
}

export interface PreferenciaNotificacaoCategoria {
  categoria: string;
  categoriaLabel: string;
  descricao: string;
  tipos: PreferenciaNotificacaoTipo[];
}

export interface PreferenciaNotificacaoUsuarioResponse {
  id: number;
  username: string;
  categoria: string;
  tipo: string;
  canal: string;
  ativo: boolean;
  createdAt: string;
  updatedAt: string;
}

export type QueryOperation =
    | 'CONTAINS' | 'EQUALS' | 'NOT_EQUALS' | 'STARTS_WITH' | 'ENDS_WITH'
    | 'GREATER_THAN' | 'GREATER_THAN_OR_EQUAL' | 'LESS_THAN' | 'LESS_THAN_OR_EQUAL'
    | 'BETWEEN';

export interface FilterCondition {
    operation: QueryOperation;
    value: string;
    value2?: string;
}

export interface ReportFilterSqlValue {
    operation?: string;
    value?: string;
    value2?: string;
    selected?: boolean;
}

export type ReportFilterSqlValues = Record<string, ReportFilterSqlValue>;

export interface SearchFilterRequest {
    filters: Record<string, FilterCondition>;
}

export const STRING_OPERATIONS: { value: QueryOperation; label: string }[] = [
    {value: 'CONTAINS', label: 'Contém'},
    {value: 'EQUALS', label: 'Igual'},
    {value: 'NOT_EQUALS', label: 'Diferente'},
    {value: 'STARTS_WITH', label: 'Inicia com'},
    {value: 'ENDS_WITH', label: 'Termina com'},
];

export const NUMBER_OPERATIONS: { value: QueryOperation; label: string }[] = [
    {value: 'EQUALS', label: 'Igual'},
    {value: 'NOT_EQUALS', label: 'Diferente'},
    {value: 'GREATER_THAN', label: 'Maior que'},
    {value: 'GREATER_THAN_OR_EQUAL', label: 'Maior ou igual'},
    {value: 'LESS_THAN', label: 'Menor que'},
    {value: 'LESS_THAN_OR_EQUAL', label: 'Menor ou igual'},
    {value: 'BETWEEN', label: 'Entre'},
];

export type FilterDimensionType = 'TEMPO' | 'DESCRITIVO' | 'NUMERICO';

export interface FiltroRelatorio {
    id: number;
    nome: string;
    fixo: boolean;
    exibirFiltro: boolean;
    tipo: 'FIXO' | 'DINAMICO';
    informacao?: string;
    dimensao: {
        tipoInfo: FilterDimensionType;
    };
}

export interface FiltroRelatorioWrapper {
    filtroRelatorio: FiltroRelatorio;
    selected: boolean;
    informacao?: string;
}

export type TempoFilterType = 0 | 1 | 2 | 3;

export interface TempoFilterState {
    tipo: TempoFilterType;
    dataInicio?: string;
    dataFim?: string;
    campoDinamico?: string;
    queryOperation?: QueryOperation;
}

export interface DescritivoFilterState {
    listaTodosSelected: Array<{ informacao: string }>;
}

export interface FixoFilterState {
    selected: boolean;
}

export type FilterState = TempoFilterState | DescritivoFilterState | FixoFilterState;

export interface ReportFiltersState {
    [filtroId: number]: FilterState;
}
