export type ApiItem = { id: number; nome: string; dadosJson?: string };
export type ApiRequest = Omit<ApiItem, 'id'>;
export type PagedResponse<T> = { content: T[]; totalElements: number; page: number; size: number; totalPages: number };
export type ModulePermissions = Record<string, string[]>;
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
