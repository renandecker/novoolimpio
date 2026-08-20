import {api} from './api';

export type RelatorioDisponivel = {
    id: number;
    nome: string;
    tipo: 'TABELA' | 'GRAFICO' | 'MAPA';
};

export const listarRelatoriosDisponiveis = async (): Promise<RelatorioDisponivel[]> =>
    (await api.get('/api/relatorios/relatorio/disponiveis')).data;
