import type { PagedResponse } from '../../shared/types/types';

export type IndicadorGauge = {
  id: number;
  nome: string;
  sql: string;
  configuracao: GaugeConfiguracao;
  createdAt: string;
  updatedAt: string;
};

export type GaugeConfiguracao = {
  nrOfLevels: number;
  colors: string[];
  arcWidth: number;
  percent: number;
  textColor: string;
  needleColor: string;
  needleBaseColor: string;
  animate: boolean;
};

export const DEFAULT_GAUGE_CONFIG: GaugeConfiguracao = {
  nrOfLevels: 3,
  colors: ['#22c55e', '#eab308', '#ef4444'],
  arcWidth: 0.3,
  percent: 0.7,
  textColor: '#1e293b',
  needleColor: '#475569',
  needleBaseColor: '#475569',
  animate: true,
};

export const listarIndicadoresGauge = async (page = 0, size = 10, busca?: string): Promise<PagedResponse<IndicadorGauge>> => {
  const { api } = await import('../../shared/services/api');
  return (await api.get<PagedResponse<IndicadorGauge>>('/api/relatorios/indicador-gauge/disponiveis', {
    params: { page, size, ...(busca ? { busca } : {}) }
  })).data;
};

export const salvarIndicadorGauge = async (indicador: Omit<IndicadorGauge, 'id' | 'createdAt' | 'updatedAt'>): Promise<IndicadorGauge> => {
  const { api } = await import('../../shared/services/api');
  return (await api.post<IndicadorGauge>('/api/relatorios/indicador-gauge', indicador)).data;
};

export const atualizarIndicadorGauge = async (id: number, indicador: Partial<IndicadorGauge>): Promise<IndicadorGauge> => {
  const { api } = await import('../../shared/services/api');
  return (await api.put<IndicadorGauge>(`/api/relatorios/indicador-gauge/${id}`, indicador)).data;
};

export const excluirIndicadorGauge = async (id: number): Promise<void> => {
  const { api } = await import('../../shared/services/api');
  await api.delete(`/api/relatorios/indicador-gauge/${id}`);
};

export const executarSqlIndicador = async (sql: string): Promise<{ valorAtual: number; valorMinimo: number; valorMaximo: number }> => {
  const { api } = await import('../../shared/services/api');
  return (await api.post<{ valorAtual: number; valorMinimo: number; valorMaximo: number }>('/api/relatorios/indicador-gauge/executar', { sql })).data;
};