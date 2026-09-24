import {api} from '../../shared/services/api';
import type {PagedResponse, ReportFilterSqlValues} from '../../shared/types/types';

export type RelatorioDisponivel = {
    id: number;
    nome: string;
    tipo: 'TABELA' | 'GRAFICO' | 'MAPA' | 'ORGANOGRAMA' | 'DASHBOARD' | 'PIZZA' | 'LINHA' | 'COMBINADO' | 'CIRCULAR' | 'BARRA_VERTICAL' | 'BARRA_HORIZONTAL' | 'INDICADOR_GAUGE';
};

export type Marcador = {
    latitude: string;
    longitude: string;
    popup: string;
    valorFormatado: string;
};

export type RegraPontos = {
    regraId: number;
    descricao: string;
    cor: string;
    markerTamanho: number;
    marcadores: Marcador[];
};

export type MapaPontosResponse = {
    coordenadaCentro: string;
    zoom: string;
    altura: number;
    markerTamanho: number;
    regras: RegraPontos[];
};

export type RelatorioAberto = {
    id: number;
    nome: string;
    tipo: string;
    configuracao: Record<string, unknown>;
    dados: RelatorioDados | MapaPontosResponse | null;
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

export const abrirRelatorio = async (tipo: string, id: number, filtros?: ReportFilterSqlValues): Promise<RelatorioAberto> =>
    (await api.get<RelatorioAberto>(`/api/relatorios/relatorio/disponiveis/${tipo}/${id}`, {
        params: filtros && Object.keys(filtros).length > 0 ? {filtros: JSON.stringify(filtros)} : {}
    })).data;
