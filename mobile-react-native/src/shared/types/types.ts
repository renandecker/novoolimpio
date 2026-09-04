export type ApiItem = { id: number; nome: string; dadosJson?: string };
export type ApiRequest = Omit<ApiItem, 'id'>;
export type PagedResponse<T> = { content: T[]; totalElements: number; page: number; size: number; totalPages: number };
export type ModulePermissions = Record<string, string[]>;

export type QueryOperation =
    | 'CONTAINS' | 'EQUALS' | 'NOT_EQUALS' | 'STARTS_WITH' | 'ENDS_WITH'
    | 'GREATER_THAN' | 'GREATER_THAN_OR_EQUAL' | 'LESS_THAN' | 'LESS_THAN_OR_EQUAL'
    | 'BETWEEN';

export interface FilterCondition {
    operation: QueryOperation;
    value: string;
    value2?: string;
}

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

export type Modulo = {
    id: number;
    antecessorId: number | null;
    rotulo: string;
    descricao?: string;
    icone?: string;
    ajuda?: string;
    outcome: string;
    ordem: number;
};
