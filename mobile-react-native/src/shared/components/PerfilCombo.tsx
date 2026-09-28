import React from 'react';
import {api} from '../services/api';
import {AutoComplete} from './AutoComplete';
import type {AutoCompleteOption} from './AutoComplete';
import type {ApiItem} from '../types/types';

export const PERFIL_LIST_SOURCE = '/api/view/perfil/listPerfil';

export const perfilLabel = (item: ApiItem): string => {
    const record = item as unknown as Record<string, unknown>;
    const descricao = record.descricao;
    if (typeof descricao === 'string' && descricao) return descricao;
    const nome = record.nome;
    if (typeof nome === 'string' && nome) return nome;
    return `#${String(record.id ?? '')}`;
};

export async function fetchPerfilOptions(query: string): Promise<AutoCompleteOption[]> {
    const {data} = await api.get<ApiItem[]>(PERFIL_LIST_SOURCE, {
        params: {q: query, limit: 20},
    });
    return (data ?? []).map((item) => ({
        id: Number((item as any).id),
        label: perfilLabel(item),
    }));
}

export const toPerfilOption = (item: ApiItem | null | undefined): AutoCompleteOption | null => {
    if (!item || (item as any).id === null || (item as any).id === undefined) return null;
    return {id: Number((item as any).id), label: perfilLabel(item)};
};

interface PerfilComboProps {
    label?: string;
    placeholder?: string;
    value: AutoCompleteOption | null;
    onChange: (option: AutoCompleteOption | null) => void;
    minChars?: number;
    disabled?: boolean;
    style?: any;
    onAdd?: (opt: AutoCompleteOption | null) => void;
    addButtonLabel?: string;
}

export function PerfilCombo({
                                label = 'Perfil',
                                placeholder = 'Digite para buscar...',
                                value,
                                onChange,
                                minChars = 0,
                                disabled = false,
                                style,
                                onAdd,
                                addButtonLabel = '+',
                            }: PerfilComboProps) {
    return (
        <AutoComplete
            label={label}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            fetchOptions={fetchPerfilOptions}
            minChars={minChars}
            disabled={disabled}
            style={style}
        />
    );
}