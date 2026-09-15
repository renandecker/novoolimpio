import {api} from '../services/api';
import {AutoComplete} from './AutoComplete';
import type {AutoCompleteOption} from './AutoComplete';

export const UNIDADE_LIST_SOURCE = '/api/view/unidade/listUnidade';

const unidadeLabel = (item: Record<string, unknown>): string => {
    const sucinto = item.sucinto;
    const razao = item.razaoSocial;
    const fantasia = item.nomeFantasia;
    if (typeof sucinto === 'string' && sucinto) return sucinto;
    if (typeof razao === 'string' && razao) return razao;
    if (typeof fantasia === 'string' && fantasia) return fantasia;
    const nome = item.nome;
    if (typeof nome === 'string' && nome) return nome;
    return `#${String(item.id ?? '')}`;
};

/** Busca unidades no servidor (combo com busca). */
export async function fetchUnidadeOptions(query: string): Promise<AutoCompleteOption[]> {
    const {data} = await api.get<Array<Record<string, unknown>>>(UNIDADE_LIST_SOURCE, {
        params: {q: query, limit: 20},
    });
    return (data ?? []).map((item) => ({
        id: Number(item.id),
        label: unidadeLabel(item),
    }));
}

/** Resolve o rótulo de uma unidade pelo id (usado em edição). */
export async function fetchUnidadeById(id: number): Promise<AutoCompleteOption | null> {
    try {
        const {data} = await api.get<Record<string, unknown>>(`${UNIDADE_LIST_SOURCE}/${id}`);
        return {id: Number(data.id), label: unidadeLabel(data)};
    } catch {
        return null;
    }
}

/** Devolve `{id, label}` a partir de um registro de unidade já carregado. */
export const toUnidadeOption = (item: Record<string, unknown> | null | undefined): AutoCompleteOption | null => {
    if (!item || item.id === null || item.id === undefined) return null;
    return {id: Number(item.id), label: unidadeLabel(item)};
};

interface UnidadeComboProps {
    id?: string;
    label?: string;
    value: AutoCompleteOption | null;
    onChange: (option: AutoCompleteOption | null) => void;
    placeholder?: string;
    minChars?: number;
    disabled?: boolean;
    minDropdownResults?: number;
}

/**
 * Campo padrão "Unidade": combo com lista e busca, padronizado em todo o sistema.
 * Wrapper do AutoComplete com a fonte de unidades e rótulos padronizados.
 */
export function UnidadeCombo({
                                 id,
                                 label = 'Unidade',
                                 value,
                                 onChange,
                                 placeholder = 'Digite para buscar...',
                                 minChars = 2,
                                 disabled = false,
                                 minDropdownResults = 10,
                                 onAdd,
                                 addButtonLabel = '+',
                             }: UnidadeComboProps & { onAdd?: (opt: AutoCompleteOption | null) => void; addButtonLabel?: string }) {
    return (
        <div className="form-field" style={{gridColumn: '1 / -1'}}>
            <div style={{display: 'flex', gap: '8px', alignItems: 'flex-end'}}>
                <div style={{flex: 1}}>
                    <AutoComplete
                        id={id}
                        label={label}
                        placeholder={placeholder}
                        value={value}
                        onChange={onChange}
                        fetchOptions={fetchUnidadeOptions}
                        fetchById={fetchUnidadeById}
                        minChars={minChars}
                        disabled={disabled}
                        minDropdownResults={minDropdownResults}
                    />
                </div>
                {onAdd && (
                    <button
                        type="button"
                        className="btnblue"
                        style={{height: 38}}
                        onClick={() => {
                            if (value) {
                                onAdd(value);
                                onChange(null);
                            }
                        }}
                    >
                        {addButtonLabel}
                    </button>
                )}
            </div>
        </div>
    );
}