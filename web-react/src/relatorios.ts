import { api } from './api';

export type RelatorioDisponivel = {
  id: number;
  nome: string;
  tipo: 'TABELA' | 'GRAFICO' | 'MAPA';
};

export type RelatorioAberto = RelatorioDisponivel & {
  configuracao: Record<string, unknown>;
};

export const listarRelatoriosDisponiveis = async (): Promise<RelatorioDisponivel[]> =>
  (await api.get('/api/relatorios/relatorio/disponiveis')).data;

export const abrirRelatorio = async (tipo: RelatorioDisponivel['tipo'], id: number): Promise<RelatorioAberto> =>
  (await api.get(`/api/relatorios/relatorio/disponiveis/${tipo}/${id}`)).data;
