import React from 'react';
import {api} from '../services/api';
import {AutoComplete} from './AutoComplete';
import type {AutoCompleteOption} from './AutoComplete';
import type {ApiItem} from '../types/types';

export const UNIDADE_LIST_SOURCE = '/api/view/unidade/listUnidade';

export const unidadeLabel = (item: ApiItem): string => {
    const record = item as unknown as Record<string, unknown>;
    const sucinto = record.sucinto;
    const razao = record.razaoSocial;
    const fantasia = record.nomeFantasia;
    if (typeof sucinto === 'string' && sucinto) return sucinto;
    if (typeof razao === 'string' && razao) return razao;
    if (typeof fantasia === 'string' && fantasia) return fantasia;
    const nome = record.nome;
    if (typeof nome === 'string' && nome) return nome;
    return `#${String(record.id ?? '')}`;
};

/** Busca unidades no servidor (combo com busca). */
export async function fetchUnidadeOptions(query: string): Promise<AutoCompleteOption[]> {
    const {data} = await api.get<ApiItem[]>(UNIDADE_LIST_SOURCE, {
        params: {q: query, limit: 20},
    });
    return (data ?? []).map((item) => ({
        id: Number((item as any).id),
        label: unidadeLabel(item),
    }));
}

/** Devolve `{id, label}` a partir de um registro de unidade já carregado. */
export const toUnidadeOption = (item: ApiItem | null | undefined): AutoCompleteOption | null => {
    if (!item || (item as any).id === null || (item as any).id === undefined) return null;
    return {id: Number((item as any).id), label: unidadeLabel(item)};
};

interface UnidadeComboProps {
    label?: string;
    placeholder?: string;
    value: AutoCompleteOption | null;
    onChange: (option: AutoCompleteOption | null) => void;
    minChars?: number;
    disabled?: boolean;
    style?: any;
}

/**
 * Campo padrão "Unidade": combo com lista e busca, padronizado em todo o sistema.
 * Wrapper do AutoComplete com a fonte de unidades e rótulos padronizados.
 */
export function UnidadeCombo({
                                 label = 'Unidade',
                                 placeholder = 'Digite para buscar...',
                                 value,
                                 onChange,
                                 minChars = 0,
                                 disabled = false,
                                 style,
                             }: UnidadeComboProps) {
    return (
        <AutoComplete
            label={label}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            fetchOptions={fetchUnidadeOptions}
            minChars={minChars}
            disabled={disabled}
            style={style}
        />
    );
}