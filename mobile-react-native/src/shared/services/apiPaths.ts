export const API_PATHS = {
  relatorios: {
    tabela: '/api/relatorios/tabela',
    grafico: '/api/relatorios/grafico',
    mapa: '/api/relatorios/mapa',
    dashboard: '/api/relatorios/dashboard',
    estrutura: '/api/relatorios/estrutura',
    dimensao: '/api/relatorios/dimensao',
    medida: '/api/relatorios/medida',
    filtro: '/api/relatorios/filtro',
    mapaRegra: '/api/relatorios/mapa-regra',
    painelPainel: '/api/relatorios/painel-painel',
    georeferencia: '/api/relatorios/georeferencia',
    relatorioDisponiveis: '/api/relatorios/relatorio/disponiveis',
    organograma: '/api/relatorios/organograma',
    indicadorGauge: '/api/relatorios/indicador-gauge',
    indicadorGaugeDisponiveis: '/api/relatorios/indicador-gauge/disponiveis',
    indicadorGaugeExecutar: '/api/relatorios/indicador-gauge/executar',
  },
} as const;

export type ApiPath = typeof API_PATHS[keyof typeof API_PATHS][keyof typeof API_PATHS[keyof typeof API_PATHS]];