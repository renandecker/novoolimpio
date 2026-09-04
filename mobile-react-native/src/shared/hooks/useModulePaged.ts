import {keepPreviousData, useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {api} from './api';
import type {ApiItem, ApiRequest, PagedResponse, SearchFilterRequest} from './types';

export const PAGE_SIZES = [10, 20, 50, 100];

export const useModulePaged = (
    path: string,
    page: number,
    size: number,
    extraParams?: Record<string, string | number | boolean | undefined>,
    filters?: SearchFilterRequest,
) => {
    const queryClient = useQueryClient();
    const hasFilters = filters && filters.filters && Object.keys(filters.filters).length > 0;
    const basePath = path.replace(/\/paged\/?$/, '').replace(/\/search\/?$/, '');
    const query = useQuery({
        queryKey: [path, hasFilters ? 'search' : 'paged', page, size, extraParams, filters],
        queryFn: async () => {
            if (hasFilters) {
                return (await api.post<PagedResponse<ApiItem>>(`${basePath}/search`, filters, {params: {page, size, ...extraParams}})).data;
            }
            return (await api.get<PagedResponse<ApiItem>>(`${basePath}/paged`, {params: {page, size, ...extraParams}})).data;
        },
        placeholderData: keepPreviousData,
    });
    const invalidate = () => queryClient.invalidateQueries({queryKey: [path]});
    const create = useMutation({
        mutationFn: (body: ApiRequest) => api.post(basePath, body),
        onSuccess: invalidate,
    });
    const update = useMutation({
        mutationFn: ({id, body}: { id: number; body: ApiRequest }) => api.put(`${basePath}/${id}`, body),
        onSuccess: invalidate,
    });
    const remove = useMutation({
        mutationFn: (id: number) => api.delete(`${basePath}/${id}`),
        onSuccess: invalidate,
    });
    return {...query, create, update, remove};
};
