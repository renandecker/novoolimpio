import { api } from './api';
import type { PagedResponse } from './types';

export type Notificacao = {
  id: number;
  username: string;
  titulo: string;
  mensagem: string | null;
  tipo: string | null;
  link: string | null;
  lida: boolean;
  createdAt: string;
};

export const listMinhasNotificacoes = async (page = 0, size = 20): Promise<PagedResponse<Notificacao>> =>
  (await api.get('/api/notificacoes/notificacao/minhas', { params: { page, size } })).data;

export const countNaoLidas = async (): Promise<number> =>
  (await api.get('/api/notificacoes/notificacao/nao-lidas')).data;

export const marcarNotificacaoLida = async (id: number): Promise<Notificacao> =>
  (await api.post(`/api/notificacoes/notificacao/${id}/ler`)).data;
