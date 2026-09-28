import {api} from '../services/api';
import {AutoComplete} from './AutoComplete';
import type {AutoCompleteOption} from './AutoComplete';

export const AGENDA_LIST_SOURCE = '/api/view/agenda/listAgenda';

const agendaLabel = (item: Record<string, unknown>): string => {
    const descricao = item.descricao;
    if (typeof descricao === 'string' && descricao) return descricao;
    const nome = item.nome;
    if (typeof nome === 'string' && nome) return nome;
    return `#${String(item.id ?? '')}`;
};

export async function fetchAgendaOptions(query: string): Promise<AutoCompleteOption[]> {
    const {data} = await api.get<Array<Record<string, unknown>>>(AGENDA_LIST_SOURCE, {
        params: {q: query, limit: 20},
    });
    return (data ?? []).map((item) => ({
        id: Number(item.id),
        label: agendaLabel(item),
    }));
}

export async function fetchAgendaById(id: number): Promise<AutoCompleteOption | null> {
    try {
        const {data} = await api.get<Record<string, unknown>>(`${AGENDA_LIST_SOURCE}/${id}`);
        return {id: Number(data.id), label: agendaLabel(data)};
    } catch {
        return null;
    }
}

export const toAgendaOption = (item: Record<string, unknown> | null | undefined): AutoCompleteOption | null => {
    if (!item || item.id === null || item.id === undefined) return null;
    return {id: Number(item.id), label: agendaLabel(item)};
};

interface AgendaComboProps {
    id?: string;
    label?: string;
    value: AutoCompleteOption | null;
    onChange: (option: AutoCompleteOption | null) => void;
    placeholder?: string;
    minChars?: number;
    disabled?: boolean;
    minDropdownResults?: number;
}

export function AgendaCombo({
                                id,
                                label = 'Agenda',
                                value,
                                onChange,
                                placeholder = 'Digite para buscar...',
                                minChars = 2,
                                disabled = false,
                                minDropdownResults = 10,
                                onAdd,
                                addButtonLabel = '+',
                            }: AgendaComboProps & { onAdd?: (opt: AutoCompleteOption | null) => void; addButtonLabel?: string }) {
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
                        fetchOptions={fetchAgendaOptions}
                        fetchById={fetchAgendaById}
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