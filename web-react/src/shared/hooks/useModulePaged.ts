import {keepPreviousData, useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {api} from '../services/api';
import type {ApiItem, ApiRequest, PagedResponse, ModulePermissions} from '../types/index';

export interface PerfilModuloPermissions {
    novo: boolean;
    editar: boolean;
    remover: boolean;
    relatorio: boolean;
}

export const useModulePaged = (path: string, page: number, size: number, params?: Record<string, unknown>, filters?: Record<string, unknown>) => {
    const queryClient = useQueryClient();
    const paramsKey = params ? JSON.stringify(params) : '';
    const filtersKey = filters ? JSON.stringify(filters) : '';
    const hasFilters = filters && Object.keys(filters).length > 0;
    // Normalize path to avoid double /paged or /search (e.g. caller passed "/api/.../paged")
    const basePath = path.replace(/\/paged\/?$/, '').replace(/\/search\/?$/, '');
    const query = useQuery({
        queryKey: [path, hasFilters ? 'search' : 'paged', page, size, paramsKey, filtersKey],
        queryFn: async () => {
            if (hasFilters) {
                return (await api.post<PagedResponse<ApiItem>>(`${basePath}/search`, filters, {
                    params: {page, size, ...params}
                })).data;
            }
            return (await api.get<PagedResponse<ApiItem>>(`${basePath}/paged`, {
                params: {page, size, ...params}
            })).data;
        },
        placeholderData: keepPreviousData,
    });
    const invalidate = () => queryClient.invalidateQueries({queryKey: [path, 'paged']});
    const invalidateSearch = () => queryClient.invalidateQueries({queryKey: [path, 'search']});
    const create = useMutation({
        mutationFn: (body: ApiRequest) => api.post(basePath, body),
        onSuccess: () => { invalidate(); invalidateSearch(); },
    });
    const update = useMutation({
        mutationFn: ({id, body}: { id: number; body: ApiRequest }) => api.put(`${basePath}/${id}`, body),
        onSuccess: () => { invalidate(); invalidateSearch(); },
    });
    const remove = useMutation({
        mutationFn: (id: number) => api.delete(`${basePath}/${id}`),
        onSuccess: () => { invalidate(); invalidateSearch(); },
    });
    return {...query, create, update, remove};
};
