import {useState, useEffect} from 'react';
import type {SearchFilterRequest, FilterCondition, QueryOperation} from '../types/types';
import {STRING_OPERATIONS} from '../types/types';
import type {DataTableColumn} from './DataTable';

export type ModuleFilterColumns = DataTableColumn[] | (() => DataTableColumn[]);

interface ModuleFilterProps {
    columns: ModuleFilterColumns;
    value: SearchFilterRequest;
    onChange: (filters: SearchFilterRequest) => void;
}

export function ModuleFilter({columns, value, onChange}: ModuleFilterProps) {
    const [values, setValues] = useState<Record<string, string>>({});
    const [ops, setOps] = useState<Record<string, QueryOperation>>({});
    const [values2, setValues2] = useState<Record<string, string>>({});
    const [expanded, setExpanded] = useState(false);

    const cols = typeof columns === 'function' ? columns() : columns;
    const effectiveCols = cols.filter((c) => c.key !== 'id' && c.key !== 'dadosJson');

    useEffect(() => {
        const filters = value?.filters ?? {};
        const newValues: Record<string, string> = {};
        const newOps: Record<string, QueryOperation> = {};
        const newValues2: Record<string, string> = {};
        for (const [key, condition] of Object.entries(filters)) {
            if (condition.value !== undefined && condition.value !== null && condition.value !== '') {
                newValues[key] = String(condition.value);
                newOps[key] = condition.operation ?? 'CONTAINS';
                if (condition.value2 !== undefined && condition.value2 !== null && condition.value2 !== '') {
                    newValues2[key] = String(condition.value2);
                }
            }
        }
        setValues(newValues);
        setOps(newOps);
        setValues2(newValues2);
    }, [value]);

    const isNumberOp = (op: QueryOperation) =>
        ['EQUALS', 'NOT_EQUALS', 'GREATER_THAN', 'GREATER_THAN_OR_EQUAL', 'LESS_THAN', 'LESS_THAN_OR_EQUAL', 'BETWEEN'].includes(op);

    const handleClear = () => {
        setValues({});
        setOps({});
        setValues2({});
        onChange({filters: {}});
    };

    const handleSubmit = () => {
        const filters: Record<string, FilterCondition> = {};
        for (const col of effectiveCols) {
            const val = values[col.key];
            if (val !== null && val !== undefined && val !== '') {
                const op = ops[col.key] ?? 'CONTAINS';
                filters[col.key] = {
                    operation: op,
                    value: val,
                    value2: isNumberOp(op) ? (values2[col.key] ?? undefined) : undefined,
                };
            }
        }
        onChange({filters: {...filters}});
    };

    const hasActiveFilters = Object.keys(values).some(k => values[k] && values[k].trim() !== '');

    return (
        <div style={{display: 'flex', flexDirection: 'column', gap: '12px', width: '100%'}}>
            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                    gap: '16px',
                    padding: expanded ? '16px' : '0',
                    border: expanded ? '1px solid #e5e7eb' : 'none',
                    borderRadius: '10px',
                    background: expanded ? '#fafafa' : 'transparent',
                    overflow: 'hidden',
                    transition: 'all 0.3s ease',
                    maxHeight: expanded ? 'none' : '0',
                    opacity: expanded ? 1 : 0,
                }}
            >
                {effectiveCols.map((column) => {
                    const op = ops[column.key] ?? 'CONTAINS';
                    const showBetween = op === 'BETWEEN';
                    return (
                        <div key={column.key} className="form-field" style={{display: 'flex', flexDirection: 'column', gap: '8px', background: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '12px'}}>
                            <span className="form-label" style={{fontSize: '13px', fontWeight: 500, color: '#374151'}}>{column.label}</span>
                            <div style={{display: 'flex', gap: '8px', alignItems: 'center'}}>
                                <select
                                    style={{width: '130px', padding: '6px 8px', fontSize: '13px', border: '1px solid #d1d5db', borderRadius: '6px', background: '#fff'}}
                                    value={op}
                                    onChange={e => setOps(prev => ({...prev, [column.key]: e.target.value as QueryOperation}))}
                                >
                                    {STRING_OPERATIONS.map(o => (
                                        <option key={o.value} value={o.value}>{o.label}</option>
                                    ))}
                                </select>
                                <input
                                    className="form-input"
                                    type="text"
                                    style={{flex: 1, padding: '6px 10px', fontSize: '13px', border: '1px solid #d1d5db', borderRadius: '6px'}}
                                    value={values[column.key] ?? ''}
                                    onChange={e => setValues(prev => ({...prev, [column.key]: e.target.value}))}
                                    placeholder={`Filtrar por ${column.label}`}
                                />
                            </div>
                            {showBetween && (
                                <div style={{display: 'flex', gap: '4px', alignItems: 'center', marginTop: '4px'}}>
                                    <span style={{fontSize: '12px', color: '#6b7280'}}>até</span>
                                    <input
                                        className="form-input"
                                        type="text"
                                        style={{flex: 1, padding: '6px 10px', fontSize: '13px', border: '1px solid #d1d5db', borderRadius: '6px'}}
                                        value={values2[column.key] ?? ''}
                                        onChange={e => setValues2(prev => ({...prev, [column.key]: e.target.value}))}
                                        placeholder={`Valor final`}
                                    />
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
            <div style={{display: 'flex', gap: '8px', justifyContent: 'flex-end', alignItems: 'center', flexWrap: 'wrap'}}>
                {hasActiveFilters && (
                    <button type="button" className="btnred" onClick={handleClear} style={{padding: '8px 16px', fontSize: '13px'}}>Limpar filtros</button>
                )}
                <button
                    type="button"
                    className="btngreen"
                    onClick={handleSubmit}
                    style={{padding: '8px 16px', fontSize: '13px', display: 'inline-flex', alignItems: 'center', gap: '6px'}}
                >
                    <i className="fa fa-search"/> Pesquisar
                </button>
                <button
                    type="button"
                    className="btn-form-back btnyellow"
                    onClick={() => setExpanded(!expanded)}
                    style={{padding: '8px 16px', fontSize: '13px', display: 'inline-flex', alignItems: 'center', gap: '6px'}}
                >
                    <i className={expanded ? 'fa fa-chevron-up' : 'fa fa-chevron-down'}/> {expanded ? 'Ocultar filtros' : 'Mostrar filtros'}
                </button>
            </div>
        </div>
    );
}
