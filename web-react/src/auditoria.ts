import {api} from './api';

export type AuditoriaCampo = { nome: string; valor: unknown };

export type AuditoriaItem = {
    entidade: string;
    id: number;
    rev: number;
    revType: number;
    data: number | string | null;
    usuario: string | null;
    acao: string | null;
    campos: AuditoriaCampo[];
};

export type AuditoriaPaged = {
    content: AuditoriaItem[];
    totalElements: number;
    page: number;
    size: number;
    totalPages: number;
};

export const auditoriaApi = {
    listar: (entidade: string, page: number, size: number) =>
        api
            .get<AuditoriaPaged>('/api/educacao/auditoria', {params: {entidade, page, size}})
            .then((response) => response.data),
};
