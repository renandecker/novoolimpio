import {api} from '../../shared/services/api';
import {API_PATHS} from '../../shared/services/apiPaths';

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

export type RelatorioDisponivel = {
    id: number;
    nome: string;
    tipo: 'TABELA' | 'GRAFICO' | 'MAPA' | 'INDICADOR_GAUGE';
};

export type LinhaGrafico = {
    categoria?: string;
    valor?: number;
    [key: string]: unknown;
};

export type GraficoDados = {
    id: number;
    nome: string;
    tipo: string;
    ordemGrafico?: string;
    exibirPercentual: boolean;
    exibirLegenda: boolean;
    exibirValor: boolean;
    valorAcumulado: boolean;
    limite: number;
    posicao?: string;
    linhas: LinhaGrafico[];
    linhasCombinado?: LinhaGrafico[];
};

export type RelatorioAberto = {
    id: number;
    nome: string;
    tipo: string;
    configuracao: Record<string, unknown>;
    dados: GraficoDados | MapaPontosResponse | null;
};

export const listarRelatoriosDisponiveis = async (): Promise<RelatorioDisponivel[]> =>
    (await api.get(API_PATHS.relatorios.relatorioDisponiveis)).data;

export const abrirRelatorio = async (tipo: string, id: number): Promise<RelatorioAberto> =>
    (await api.get<RelatorioAberto>(`${API_PATHS.relatorios.relatorioDisponiveis}/${tipo}/${id}`)).data;
