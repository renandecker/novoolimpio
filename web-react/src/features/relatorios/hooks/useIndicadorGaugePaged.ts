import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../../shared/services/api';
import type { ApiItem, ApiRequest, PagedResponse, SearchFilterRequest, SortRequest } from '../../shared/types/types';

export interface PerfilModuloPermissions {
    novo: boolean;
    editar: boolean;
    remover: boolean;
    relatorio: boolean;
}

export const useIndicadorGaugePaged = (
    page: number,
    size: number,
    params?: Record<string, unknown>,
    filters?: SearchFilterRequest,
    sort?: SortRequest
) => {
    const queryClient = useQueryClient();
    const paramsKey = params ? JSON.stringify(params) : '';
    const filtersKey = filters ? JSON.stringify(filters) : '';
    const sortKey = sort ? JSON.stringify(sort) : '';
    const hasFilters = filters && filters.filters && Object.keys(filters.filters).length > 0;
    const basePath = '/api/relatorios/indicador-gauge/disponiveis';

    const query = useQuery({
        queryKey: ['indicador-gauge', hasFilters ? 'search' : 'paged', page, size, paramsKey, filtersKey, sortKey],
        queryFn: async () => {
            const queryParams = { page, size, ...params };
            if (hasFilters) {
                const busca = filters.filters?.busca?.value ?? filters.filters?.nome?.value ?? '';
                return (await api.get<PagedResponse<ApiItem>>(basePath, {
                    params: { ...queryParams, busca }
                })).data;
            }
            return (await api.get<PagedResponse<ApiItem>>(basePath, {
                params: queryParams
            })).data;
        },
        placeholderData: keepPreviousData,
    });

    const invalidate = () => queryClient.invalidateQueries({ queryKey: ['indicador-gauge', 'paged'] });
    const invalidateSearch = () => queryClient.invalidateQueries({ queryKey: ['indicador-gauge', 'search'] });

    const create = useMutation({
        mutationFn: (body: ApiRequest) => api.post('/api/relatorios/indicador-gauge', body),
        onSuccess: () => { invalidate(); invalidateSearch(); },
    });

    const update = useMutation({
        mutationFn: ({ id, body }: { id: number; body: ApiRequest }) => api.put(`/api/relatorios/indicador-gauge/${id}`, body),
        onSuccess: () => { invalidate(); invalidateSearch(); },
    });

    const remove = useMutation({
        mutationFn: (id: number) => api.delete(`/api/relatorios/indicador-gauge/${id}`),
        onSuccess: () => { invalidate(); invalidateSearch(); },
    });

    return { ...query, create, update, remove };
};