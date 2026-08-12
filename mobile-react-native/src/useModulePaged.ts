import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from './api';
import type { ApiItem, ApiRequest, PagedResponse } from './types';

export const PAGE_SIZES = [10, 20, 50, 100];

export const useModulePaged = (
  path: string,
  page: number,
  size: number,
  extraParams?: Record<string, string | number | boolean | undefined>,
) => {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: [path, 'paged', page, size, extraParams],
    queryFn: async () =>
      (await api.get<PagedResponse<ApiItem>>(`${path}/paged`, { params: { page, size, ...extraParams } })).data,
    placeholderData: keepPreviousData,
  });
  const invalidate = () => queryClient.invalidateQueries({ queryKey: [path] });
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
