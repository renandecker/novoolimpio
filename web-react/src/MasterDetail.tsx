import { useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from './api';
import type { ApiItem } from './types';

export interface MasterDetailColumn {
  key: string;
  label: string;
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
    .replace(/^./, (c) => c.toUpperCase());

const asRecord = (item: ApiItem) => item as unknown as Record<string, unknown>;

const fkBase = (key: string): string | null => (key.startsWith('id_') ? key.slice(3) : null);

const renderValue = (item: ApiItem, key: string): string => {
  const base = fkBase(key);
  if (base) {
    const description = asRecord(item)[`${base}_descricao`];
    if (description !== null && description !== undefined) return String(description);
  }
  const value = asRecord(item)[key];
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
  return String(value);
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
      return { key, label: hasDescription ? toTitle(base) : toTitle(key) };
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
  const inputRef = useRef<HTMLInputElement>(null);

  const { data: all = [] } = useQuery({
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

  const actionColumns: Array<{ key: string; label: string; render: (item: ApiItem) => ReactNode }> = [
    {
      key: 'remover',
      label: 'Remover',
      render: (item) => (
        <button
          type="button"
          className="btn-action btn-danger"
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
        <div className="master-detail-search">
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
                    <td key={col.key}>{renderValue(item, col.key)}</td>
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
