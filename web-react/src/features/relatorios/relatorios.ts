import {api} from '../../shared/services/api';
import type {PagedResponse} from './types';

export type RelatorioDisponivel = {
    id: number;
    nome: string;
    tipo: 'TABELA' | 'GRAFICO' | 'MAPA' | 'ORGANOGRAMA' | 'DASHBOARD' | 'PIZZA' | 'LINHA' | 'COMBINADO' | 'CIRCULAR' | 'BARRA_VERTICAL' | 'BARRA_HORIZONTAL';
};

export type RelatorioAberto = {
    id: number;
    nome: string;
    tipo: string;
    configuracao: Record<string, unknown>;
    dados: RelatorioDados | null;
};

export type LinhaGrafico = {
    categoria?: string;
    valor?: number;
    [key: string]: unknown;
};

export type RelatorioDados = {
    colunas?: string[];
    linhas?: Record<string, unknown>[];
    id?: number;
    ordemGrafico?: string;
    exibirPercentual?: boolean;
    exibirLegenda?: boolean;
    exibirValor?: boolean;
    valorAcumulado?: boolean;
    limite?: number;
    posicao?: string;
    linhasCombinado?: LinhaGrafico[];
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
