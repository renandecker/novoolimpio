import {useMemo, useRef, useState} from 'react';
import type {ReactNode} from 'react';
import {useQuery} from '@tanstack/react-query';
import {api} from '../services/api';
import type {ApiItem} from '../types/index';
import {AutoComplete, AutoCompleteOption} from './AutoComplete';
import {fetchUnidadeOptions, fetchUnidadeById, UNIDADE_LIST_SOURCE} from './UnidadeCombo';

export interface MasterDetailColumn {
    key: string;
    label: string;
    /** Renderizacao customizada da celula (ex.: booleanos como Sim/Nao). */
    render?: (item: ApiItem) => ReactNode;
}

interface MasterDetailProps {
    label: string;
    source: string;
    valueKey?: string;
    searchKeys?: string[];
    columns?: MasterDetailColumn[];
    items: ApiItem[];
    onChange: (items: ApiItem[]) => void;
    children?: ReactNode;
}

const toTitle = (value: string) =>
    value
        .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
        .replace(/([a-z\d])([A-Z])/g, '$1 $2')
        .replace(/_/g, ' ')
        .replace(/^./, (c) => c.toUpperCase());

const asRecord = (item: ApiItem) => item as unknown as Record<string, unknown>;

const fkBase = (key: string): string | null => (key.startsWith('id_') ? key.slice(3) : null);

const ACTIVE_COLUMN_RE = /ativo|situacao|status|fl_ativo|fl_situacao|fl_status/i;

const formatTableCellValue = (key: string, value: unknown): string => {
    if (value === null || value === undefined) return '';
    if (typeof value === 'object') {
        const record = value as Record<string, unknown>;
        for (const subKey of ['descricao', 'nome', 'rotulo', 'sucinto', 'razaoSocial']) {
            const sub = record[subKey];
            if (typeof sub === 'string' && sub) return sub;
        }
        const flat: string[] = [];
        for (const subKey of Object.keys(record)) {
            const sub = record[subKey];
            if (sub === null || sub === undefined) continue;
            if (typeof sub === 'string' && sub) flat.push(sub);
        }
        return flat.join(' - ');
    }

    // Skip boolean conversion for ID fields - display raw value
    if (key.startsWith('id_')) return String(value);

    let boolVal: boolean | null = null;
    if (typeof value === 'boolean') {
        boolVal = value;
    } else if (value === 'true' || value === 'false') {
        boolVal = value === 'true';
    } else if (value === 1 || value === 0) {
        boolVal = value === 1;
    } else if (value === '1' || value === '0') {
        boolVal = value === '1';
    } else if (typeof value === 'string') {
        const v = value.trim().toUpperCase();
        if (v === 'TRUE' || v === '1' || v === 'S' || v === 'SIM' || v === 'ATIVO' || v === 'A' || v === 'YES' || v === 'Y') {
            boolVal = true;
        } else if (v === 'FALSE' || v === '0' || v === 'N' || v === 'NAO' || v === 'NÃO' || v === 'INATIVO' || v === 'I' || v === 'NO') {
            boolVal = false;
        }
    }

    if (boolVal !== null) {
        if (ACTIVE_COLUMN_RE.test(key)) {
            return boolVal ? 'ATIVO' : 'INATIVO';
        } else {
            return boolVal ? 'SIM' : 'NÃO';
        }
    }

    return String(value);
};

const renderValue = (item: ApiItem, key: string): string => {
    const base = fkBase(key);
    if (base) {
        const description = asRecord(item)[`${base}_descricao`];
        if (description !== null && description !== undefined) return String(description);
    }
    const value = asRecord(item)[key];
    return formatTableCellValue(key, value);
};

const deriveColumns = (item: ApiItem): MasterDetailColumn[] => {
    const record = asRecord(item);
    const consumed = new Set<string>();
    for (const key of Object.keys(record)) {
        const base = fkBase(key);
        if (base && record[`${base}_descricao`] !== undefined) consumed.add(`${base}_descricao`);
    }
    return Object.keys(record)
        .filter((key) => key !== 'id' && key !== 'dadosJson' && !consumed.has(key))
        .map((key) => {
            const base = fkBase(key);
            const hasDescription = Boolean(base && record[`${base}_descricao`] !== undefined);
            return {key, label: hasDescription ? toTitle(base) : toTitle(base ?? key)};
        });
};

export function MasterDetail({
                                 label,
                                 source,
                                 valueKey = 'id',
                                 searchKeys,
                                 columns,
                                 items,
                                 onChange,
                                 children,
                             }: MasterDetailProps) {
    const [query, setQuery] = useState('');
    const [open, setOpen] = useState(false);
    const [selected, setSelected] = useState<ApiItem | null>(null);
    const [autoCompleteOpt, setAutoCompleteOpt] = useState<AutoCompleteOption | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const isUnidade = source === UNIDADE_LIST_SOURCE || source.includes('unidade');

    const {data: all = []} = useQuery({
        queryKey: [source, 'master-detail'],
        queryFn: async () => (await api.get<ApiItem[]>(source)).data,
    });

    const detailCols: MasterDetailColumn[] =
        columns && columns.length > 0
            ? columns
            : items.length > 0
            ? deriveColumns(items[0])
            : [];

    const suggestions = useMemo(() => {
        const term = query.trim().toLowerCase();
        if (!term) return [];
        const keys = searchKeys && searchKeys.length > 0 ? searchKeys : detailCols.map((c) => c.key);
        const existing = new Set(items.map((item) => String(asRecord(item)[valueKey])));
        return all.filter((item) => {
            if (existing.has(String(asRecord(item)[valueKey]))) return false;
            return keys.some((key) => String(asRecord(item)[key] ?? '').toLowerCase().includes(term));
        });
    }, [query, all, items, searchKeys, detailCols, valueKey]);

    const addSelected = () => {
        if (!selected) return;
        const existing = items.some((item) => String(asRecord(item)[valueKey]) === String(asRecord(selected)[valueKey]));
        if (!existing) onChange([...items, selected]);
        setSelected(null);
        setQuery('');
        setAutoCompleteOpt(null);
        setOpen(false);
        inputRef.current?.focus();
    };

    const addSuggestion = (item: ApiItem) => {
        setSelected(item);
        setQuery(detailCols.map((col) => renderValue(item, col.key)).filter(Boolean).join(' - '));
    };

    const removeItem = (item: ApiItem) => {
        onChange(items.filter((i) => String(asRecord(i)[valueKey]) !== String(asRecord(item)[valueKey])));
    };

    const handleAutoCompleteChange = async (opt: AutoCompleteOption | null) => {
        setAutoCompleteOpt(opt);
        if (opt && opt.id) {
            // busca o item completo no all ou via api se necessário para ter as colunas corretas
            const found = all.find(i => String(asRecord(i)[valueKey]) === String(opt.id));
            if (found) {
                setSelected(found);
                const desc = detailCols.map((col) => renderValue(found, col.key)).filter(Boolean).join(' - ');
                setQuery(desc || opt.label);
            } else {
                try {
                    const {data} = await api.get(`${source}/${opt.id}`);
                    if (data) {
                        setSelected(data);
                        setQuery(opt.label);
                    }
                } catch {
                    setSelected({[valueKey]: opt.id, nome: opt.label} as any);
                    setQuery(opt.label);
                }
            }
        } else {
            setSelected(null);
            setQuery('');
        }
    };

    const actionColumns: Array<{ key: string; label: string; render: (item: ApiItem) => ReactNode }> = [
        {
            key: 'remover',
            label: 'Remover',
            render: (item) => (
                    <button
                        type="button"
                        className="btn-action btn-danger"
                        style={{backgroundColor: '#e53935', borderColor: '#e53935', color: '#fff'}}
                        title="Remover"
                        onClick={() => removeItem(item)}
                    >
                        −
                    </button>
            ),
        },
    ];

    return (
        <div className="master-detail">
            <span className="form-label master-detail-label">{label}</span>
            <div className="master-detail-inputs">
                {isUnidade ? (
                    <div style={{flex: 1, display: 'flex', gap: '8px', alignItems: 'center'}}>
                        <div style={{flex: 1}}>
                            <AutoComplete
                                value={autoCompleteOpt}
                                onChange={handleAutoCompleteChange}
                                fetchOptions={fetchUnidadeOptions}
                                fetchById={fetchUnidadeById}
                                minChars={2}
                                placeholder="Digite para buscar unidade..."
                            />
                        </div>
                    </div>
                ) : (
                    <div className="master-detail-search" style={{flex: 1}}>
                        <input
                            ref={inputRef}
                            className="form-input"
                            value={query}
                            placeholder="Digite para buscar..."
                            onFocus={() => setOpen(true)}
                            onChange={(event) => {
                                setQuery(event.target.value);
                                setSelected(null);
                            }}
                        />
                        {open && suggestions.length > 0 && (
                            <ul className="master-detail-suggestions">
                                {suggestions.map((item) => (
                                    <li key={String(asRecord(item)[valueKey])}>
                                        <button type="button" onClick={() => addSuggestion(item)}>
                                            {detailCols.map((col) => renderValue(item, col.key)).filter(Boolean).join(' - ') || `#${String(asRecord(item)[valueKey])}`}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                )}
                <button
                    type="button"
                    className="btn-add"
                    title="Adicionar selecionado"
                    disabled={!selected}
                    onClick={addSelected}
                >
                    +
                </button>
                {children}
            </div>
            <div className="master-detail-table">
                <table>
                    <thead>
                    <tr>
                        {detailCols.map((col) => (
                            <th key={col.key}>{col.label}</th>
                        ))}
                        {actionColumns.map((col) => (
                            <th key={col.key} className="col-actions">{col.label}</th>
                        ))}
                    </tr>
                    </thead>
                    <tbody>
                    {items.length === 0 ? (
                        <tr>
                            <td colSpan={detailCols.length + actionColumns.length} className="master-detail-empty">
                                Nenhum registro selecionado.
                            </td>
                        </tr>
                    ) : (
                        items.map((item, index) => (
                            <tr key={`${String(asRecord(item)[valueKey])}-${index}`}>
                                {detailCols.map((col) => (
                                    <td key={col.key}>{col.render ? col.render(item) : renderValue(item, col.key)}</td>
                                ))}
                                {actionColumns.map((col) => (
                                    <td key={col.key} className="col-actions">{col.render(item)}</td>
                                ))}
                            </tr>
                        ))
                    )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
