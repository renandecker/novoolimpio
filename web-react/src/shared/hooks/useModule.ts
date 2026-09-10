import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {api} from '../services/api';
import type {ApiItem, ApiRequest} from '../types/types';

export const useModule = (path: string) => {
    const queryClient = useQueryClient();
    const query = useQuery({queryKey: [path], queryFn: async () => (await api.get<ApiItem[]>(path)).data});
    const create = useMutation({
        mutationFn: (body: ApiRequest) => api.post(path, body),
        onSuccess: () => queryClient.invalidateQueries({queryKey: [path]})
    });
    return {...query, create};
};