import {api} from '../../shared/services/api';
import type {PagedResponse} from './types';

export type RegraNotificacao = {
    id: number;
    nome: string;
    descricao: string | null;
    tipoRegra: string;
    canal: string;
    destinatario: string | null;
    valorLimite: number | null;
    ativo: boolean;
    createdAt: string;
};

export const listRegrasNotificacoes = async (page = 0, size = 10): Promise<PagedResponse<RegraNotificacao>> =>
    (await api.get('/api/notificacoes/regras/paged', {params: {page, size}})).data;

export const countRegrasNotificacoes = async (): Promise<number> =>
    (await api.get('/api/notificacoes/regras/count')).data;

export const createRegraNotificacao = async (regra: {
    nome: string;
    descricao: string;
    tipoRegra: string;
    canal: string;
    destinatario: string;
    valorLimite: number;
}): Promise<RegraNotificacao> =>
    (await api.post('/api/notificacoes/regras', regra)).data;

export const updateRegraNotificacao = async (id: number, regra: {
    nome: string;
    descricao: string;
    tipoRegra: string;
    canal: string;
    destinatario: string;
    valorLimite: number;
}): Promise<RegraNotificacao> =>
    (await api.put(`/api/notificacoes/regras/${id}`, regra)).data;

export const deleteRegraNotificacao = async (id: number): Promise<void> =>
    (await api.delete(`/api/notificacoes/regras/${id}`)).data;
