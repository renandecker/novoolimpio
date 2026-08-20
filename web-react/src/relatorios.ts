import {api} from './api';
import type {PagedResponse} from './types';

export type RelatorioDisponivel = {
    id: number;
    nome: string;
    tipo: 'TABELA' | 'GRAFICO' | 'MAPA';
};

export type RelatorioAberto = {
    id: number;
    nome: string;
    tipo: string;
    configuracao: Record<string, unknown>;
    dados: { colunas: string[]; linhas: Record<string, unknown>[] } | null;
};

export const listarRelatoriosDisponiveis = async (page = 0, size = 10, busca?: string): Promise<PagedResponse<RelatorioDisponivel>> =>
    (await api.get<PagedResponse<RelatorioDisponivel>>('/api/relatorios/relatorio/disponiveis', {
        params: {
            page,
            size, ...(busca ? {busca} : {})
        }
    })).data;

export const abrirRelatorio = async (tipo: string, id: number): Promise<RelatorioAberto> =>
    (await api.get<RelatorioAberto>(`/api/relatorios/relatorio/disponiveis/${tipo}/${id}`)).data;
