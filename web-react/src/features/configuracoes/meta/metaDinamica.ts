import {api} from '../../../shared/services/api';
import type {AutoCompleteOption} from '../../../shared/components/AutoComplete';

export const META_DINAMICA_LIST_SOURCE = '/api/view/meta/listMetaDinamica';
export const META_DINAMICA_ITEM_SOURCE = '/api/view/meta/formMetaDinamica';
export const INDICADOR_META_SOURCE = '/api/view/meta/indicadorMetaDinamica';
export const META_VALOR_SOURCE = '/api/view/meta/indicadorMetaDinamica/valores';
export const META_DIAS_NAO_UTEIS_SOURCE = '/api/view/meta/indicadorMetaDinamica/diasNaoUteis';
export const META_DIARIZACAO_SOURCE = '/api/view/meta/indicadorMetaDinamica/diarizacao';
export const META_SEMANA_SOURCE = '/api/view/meta/indicadorMetaDinamica/diarizacao';
export const META_DIAS_DINAMICA_SOURCE = '/api/view/meta/indicadorMetaDinamica/dias';
export const INDICADOR_LIST_SOURCE = '/api/view/indicador/listIndicador';
export const INDICADOR_API = '/api/comercial/indicador';
export const META_DINAMICA_API = '/api/comercial/meta-dinamica';

export const FORMATO_LABELS: Record<string, string> = {
    R: 'Real',
    N: 'Numérico',
    P: 'Percentual',
};

export const MESES = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

export const PERC_KEYS = [
    'percSegunda', 'percTerca', 'percQuarta', 'percQuinta',
    'percSexta', 'percSabado', 'percDomingo',
] as const;

export type PercKey = (typeof PERC_KEYS)[number];

/** Colunas snake_case devolvidas por /api/view/meta/* (o DTO tipado usa camelCase). */
export const PERC_COLUMNS: Record<PercKey, string> = {
    percSegunda: 'perc_segunda',
    percTerca: 'perc_terca',
    percQuarta: 'perc_quarta',
    percQuinta: 'perc_quinta',
    percSexta: 'perc_sexta',
    percSabado: 'perc_sabado',
    percDomingo: 'perc_domingo',
};

export const percFromRow = (row: Record<string, unknown>): Record<string, number | null> =>
    Object.fromEntries(PERC_KEYS.map((key) => [key, num(row[PERC_COLUMNS[key]])]));

/**
 * O SELECT de com_meta_dinamica expõe a unidade como `id_loja` (alias legado),
 * mas a coluna real é `id_unidade`. Aceitamos as duas chaves.
 */
export const metaUnidadeId = (row: Record<string, unknown>): number | null =>
    num(row.id_loja) ?? num(row.id_unidade);

export const PERC_LABELS: Record<string, string> = {
    percSegunda: 'Segunda',
    percTerca: 'Terça',
    percQuarta: 'Quarta',
    percQuinta: 'Quinta',
    percSexta: 'Sexta',
    percSabado: 'Sábado',
    percDomingo: 'Domingo',
};

export const DIAS_SEMANA: Record<number, string> = {
    1: 'Domingo',
    2: 'Segunda-feira',
    3: 'Terça-feira',
    4: 'Quarta-feira',
    5: 'Quinta-feira',
    6: 'Sexta-feira',
    7: 'Sábado',
};

export const rec = (value: unknown): Record<string, unknown> =>
    (value && typeof value === 'object' ? value as Record<string, unknown> : {});

export const str = (value: unknown): string =>
    (value === null || value === undefined ? '' : String(value));

export const num = (value: unknown): number | null => {
    if (value === null || value === undefined || value === '') return null;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
};

export const bool = (value: unknown): boolean => value === true || value === 'true' || value === 1 || value === '1';

export const formatDate = (value: unknown): string => {
    const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(str(value));
    return match ? `${match[3]}/${match[2]}/${match[1]}` : str(value);
};

export const formatValor = (value: unknown, formato?: string): string => {
    const parsed = num(value);
    if (parsed === null) return '';
    if (formato === 'P') {
        return `${new Intl.NumberFormat('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2}).format(parsed)}%`;
    }
    if (formato === 'R') {
        return new Intl.NumberFormat('pt-BR', {style: 'currency', currency: 'BRL'}).format(parsed);
    }
    return new Intl.NumberFormat('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2}).format(parsed);
};

export const mesLabel = (value: unknown): string => {
    const parsed = num(value);
    if (parsed === null || parsed < 1 || parsed > 12) return '';
    return MESES[parsed - 1];
};

/** Metas (com_indicador_meta) de um indicador. */
export const fetchIndicadorMetas = async (indicadorId: number): Promise<Record<string, unknown>[]> => {
    const {data} = await api.get<Record<string, unknown>[]>(INDICADOR_META_SOURCE);
    return (data ?? []).filter((row) => num(rec(row).id_indicador) === indicadorId);
};

export const fetchAllIndicadorMetas = async (): Promise<Record<string, unknown>[]> => {
    const {data} = await api.get<Record<string, unknown>[]>(INDICADOR_META_SOURCE);
    return data ?? [];
};

/** Valores (com_meta_valor) vinculados a uma meta dinâmica. */
export const fetchMetaValores = async (metaDinamicaId: number): Promise<Record<string, unknown>[]> => {
    const {data} = await api.get<Record<string, unknown>[]>(META_VALOR_SOURCE);
    return (data ?? []).filter((row) => num(rec(row).id_meta_dinamica) === metaDinamicaId);
};

/** Dias não diarizados (com_meta_dia_naoutil) de uma meta dinâmica. */
export const fetchMetaDiasNaoUteis = async (metaDinamicaId: number): Promise<Record<string, unknown>[]> => {
    const {data} = await api.get<Record<string, unknown>[]>(META_DIAS_NAO_UTEIS_SOURCE);
    return (data ?? []).filter((row) => num(rec(row).id_meta_dinamica) === metaDinamicaId);
};

export const metaValorBody = (
    valor: unknown,
    idIndicadorMeta: number,
    metaDinamicaId: number,
): Record<string, unknown> => ({
    valor: num(valor),
    id_indicador_meta: idIndicadorMeta,
    id_meta_dinamica: metaDinamicaId,
});

/** DTO aceito por POST/PUT /api/comercial/meta-dinamica. */
export const metaDinamicaBody = (meta: {
    mes: number | null;
    ano: number | null;
    perc: Record<string, number | null>;
    indicadorId: number | null;
    unidadeId: number | null;
    dataAtualizacao: string | null;
}): Record<string, unknown> => ({
    mes: meta.mes,
    ano: meta.ano,
    ...Object.fromEntries(PERC_KEYS.map((key) => [key, meta.perc[key] ?? null])),
    indicadorId: meta.indicadorId,
    unidadeId: meta.unidadeId,
    dataAtualizacao: meta.dataAtualizacao,
});

export const saveMetaDinamica = async (
    id: number | null,
    body: Record<string, unknown>,
): Promise<number> => {
    if (id) {
        await api.put(`${META_DINAMICA_API}/${id}`, body);
        return id;
    }
    const {data} = await api.post<Record<string, unknown>>(META_DINAMICA_API, body);
    return Number(rec(data).id);
};

/**
 * Lê o indicador pela fonte genérica (retorna fl_dia/fl_mes/fl_ano/fl_semana),
 * mantendo o mesmo formato usado nas listagens.
 */
export const fetchIndicadorById = async (id: number): Promise<Record<string, unknown> | null> => {
    const {data} = await api.get<Record<string, unknown>[]>(INDICADOR_LIST_SOURCE);
    return (data ?? []).find((row) => num(rec(row).id) === id) ?? null;
};

export const toIndicadorOption = (row: Record<string, unknown> | null | undefined): AutoCompleteOption | null => {
    if (!row || row.id === null || row.id === undefined) return null;
    return {id: Number(row.id), label: str(row.nome) || `#${str(row.id)}`};
};

export const toUnidadeOption = (id: number | null, label: string): AutoCompleteOption | null =>
    (id === null || id === undefined ? null : {id, label: label || `#${id}`});

/** Total dos percentuais semanais (segunda..domingo). */
export const somarPercentualSemana = (perc: Record<string, number | null>): number =>
    PERC_KEYS.reduce((total, key) => total + (perc[key] ?? 0), 0);
