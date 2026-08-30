import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {api} from './api';
import type {ApiItem, ApiRequest} from './types';

export const useModule = (path: string) => {
    const queryClient = useQueryClient();
    const query = useQuery({
        queryKey: [path],
        queryFn: async () => (await api.get<ApiItem[]>(path)).data,
    });
    const invalidate = () => queryClient.invalidateQueries({queryKey: [path]});
    const create = useMutation({
        mutationFn: (body: ApiRequest) => api.post(path, body),
        onSuccess: invalidate,
    });
    const update = useMutation({
        mutationFn: ({id, body}: { id: number; body: ApiRequest }) => api.put(`${path}/${id}`, body),
        onSuccess: invalidate,
    });
    const remove = useMutation({
        mutationFn: (id: number) => api.delete(`${path}/${id}`),
        onSuccess: invalidate,
    });
    return {...query, create, update, remove};
};
