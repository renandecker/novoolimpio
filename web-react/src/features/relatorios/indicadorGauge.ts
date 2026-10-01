import type { FiltroRelatorioWrapper, PagedResponse, ReportFilterSqlValues } from '../../shared/types/types';

export type TipoExibicaoGauge = 'valor' | 'percentual' | 'ambos';

export type GaugeConfiguracao = {
  nrOfLevels: number;
  colors: string[];
  arcWidth: number;
  percent: number;
  textColor: string;
  needleColor: string;
  needleBaseColor: string;
  animate: boolean;
  tipoExibicao: TipoExibicaoGauge;
};

export type IndicadorGauge = {
  id: number;
  nome: string;
  sql: string;
  configuracao: GaugeConfiguracao;
  createdAt: string;
  updatedAt: string;
};

type IndicadorGaugeApi = Omit<IndicadorGauge, 'configuracao'> & {
  configuracao: string;
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
  tipoExibicao: 'valor',
};

function parseConfiguracao(raw: string | null | undefined): GaugeConfiguracao {
  if (!raw) return { ...DEFAULT_GAUGE_CONFIG };
  try {
    const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
    return { ...DEFAULT_GAUGE_CONFIG, ...parsed };
  } catch {
    return { ...DEFAULT_GAUGE_CONFIG };
  }
}

function toApi(indicador: Omit<IndicadorGauge, 'id' | 'createdAt' | 'updatedAt'>): Omit<IndicadorGaugeApi, 'id' | 'createdAt' | 'updatedAt'> {
  return {
    nome: indicador.nome,
    sql: indicador.sql,
    configuracao: JSON.stringify(indicador.configuracao ?? DEFAULT_GAUGE_CONFIG),
  };
}

function fromApi(item: IndicadorGaugeApi): IndicadorGauge {
  return {
    ...item,
    configuracao: parseConfiguracao(item.configuracao),
  };
}

export const listarIndicadoresGauge = async (page = 0, size = 10, busca?: string): Promise<PagedResponse<IndicadorGauge>> => {
  const { api } = await import('../../shared/services/api');
  const resp = await api.get<PagedResponse<IndicadorGaugeApi>>('/api/relatorios/indicador-gauge/disponiveis', {
    params: { page, size, ...(busca ? { busca } : {}) }
  });
  return {
    ...resp.data,
    content: (resp.data.content ?? []).map(fromApi),
  };
};

export const carregarIndicadorGauge = async (id: number): Promise<IndicadorGauge> => {
  const { api } = await import('../../shared/services/api');
  const resp = await api.get<IndicadorGaugeApi>(`/api/relatorios/indicador-gauge/${id}`);
  return fromApi(resp.data);
};

export const salvarIndicadorGauge = async (indicador: Omit<IndicadorGauge, 'id' | 'createdAt' | 'updatedAt'>): Promise<IndicadorGauge> => {
  const { api } = await import('../../shared/services/api');
  const resp = await api.post<IndicadorGaugeApi>('/api/relatorios/indicador-gauge', toApi(indicador));
  return fromApi(resp.data);
};

export const atualizarIndicadorGauge = async (id: number, indicador: Partial<IndicadorGauge>): Promise<IndicadorGauge> => {
  const { api } = await import('../../shared/services/api');
  const payload = {
    nome: indicador.nome,
    sql: indicador.sql,
    configuracao: JSON.stringify(indicador.configuracao ?? DEFAULT_GAUGE_CONFIG),
  };
  const resp = await api.put<IndicadorGaugeApi>(`/api/relatorios/indicador-gauge/${id}`, payload);
  return fromApi(resp.data);
};

export const excluirIndicadorGauge = async (id: number): Promise<void> => {
  const { api } = await import('../../shared/services/api');
  await api.delete(`/api/relatorios/indicador-gauge/${id}`);
};

export const executarSqlIndicador = async (
  sql: string,
  indicadorGaugeId?: number,
  filtros?: ReportFilterSqlValues,
): Promise<{ valorAtual: number; valorMinimo: number; valorMaximo: number }> => {
  const { api } = await import('../../shared/services/api');
  return (
    await api.post<{ valorAtual: number; valorMinimo: number; valorMaximo: number }>('/api/relatorios/indicador-gauge/executar', {
      sql,
      ...(indicadorGaugeId ? { indicadorGaugeId } : {}),
      ...(filtros && Object.keys(filtros).length > 0 ? { filtros } : {}),
    })
  ).data;
};

export const carregarFiltrosIndicadorGauge = async (indicadorGaugeId: number): Promise<FiltroRelatorioWrapper[]> => {
  const { api } = await import('../../shared/services/api');
  const resp = await api.get<FiltroRelatorioWrapper[]>('/api/relatorios/filtros/viewIndicadorGauge', {
    params: { indicadorGaugeId },
  });
  return resp.data;
};