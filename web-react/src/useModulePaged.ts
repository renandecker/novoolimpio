import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from './api';
import type { ApiItem, ApiRequest, PagedResponse, ModulePermissions } from './types';

export interface PerfilModuloPermissions {
  novo: boolean;
  editar: boolean;
  remover: boolean;
  relatorio: boolean;
}

export const useModulePaged = (path: string, page: number, size: number, params?: Record<string, unknown>) => {
  const queryClient = useQueryClient();
  const paramsKey = params ? JSON.stringify(params) : '';
  const query = useQuery({
    queryKey: [path, 'paged', page, size, paramsKey],
    queryFn: async () => (await api.get<PagedResponse<ApiItem>>(`${path}/paged`, { params: { page, size, ...params } })).data,
    placeholderData: keepPreviousData,
  });
  const invalidate = () => queryClient.invalidateQueries({ queryKey: [path, 'paged'] });
  const create = useMutation({
    mutationFn: (body: ApiRequest) => api.post(path, body),
    onSuccess: invalidate,
  });
  const update = useMutation({
    mutationFn: ({ id, body }: { id: number; body: ApiRequest }) => api.put(`${path}/${id}`, body),
    onSuccess: invalidate,
  });
  const remove = useMutation({
    mutationFn: (id: number) => api.delete(`${path}/${id}`),
    onSuccess: invalidate,
  });
  return { ...query, create, update, remove };
};
