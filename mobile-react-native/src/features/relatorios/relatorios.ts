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

export const listarRelatoriosDisponiveis = async (): Promise<RelatorioDisponivel[]> =>
    (await api.get(API_PATHS.relatorios.relatorioDisponiveis)).data;
