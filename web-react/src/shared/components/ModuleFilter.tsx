import {useState} from 'react';
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
    const [open, setOpen] = useState(false);
    const [values, setValues] = useState<Record<string, string>>({});
    const [ops, setOps] = useState<Record<string, QueryOperation>>({});
    const [values2, setValues2] = useState<Record<string, string>>({});

    const cols = typeof columns === 'function' ? columns() : columns;
    const effectiveCols = cols.filter((c) => c.key !== 'id' && c.key !== 'dadosJson');

    const openModal = () => {
        setValues({});
        setOps({});
        setValues2({});
        setOpen(true);
    };

    const isNumberOp = (op: QueryOperation) =>
        ['EQUALS', 'NOT_EQUALS', 'GREATER_THAN', 'GREATER_THAN_OR_EQUAL', 'LESS_THAN', 'LESS_THAN_OR_EQUAL', 'BETWEEN'].includes(op);

    const handleClear = () => {
        setValues({});
        setOps({});
        setValues2({});
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
        setOpen(false);
    };

    return (
        <>
            <button
                type="button"
                className="btngreen"
                style={{marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '6px 12px'}}
                onClick={openModal}
            >
                <i className="fa fa-search"/> Buscar
            </button>
            {open && (
                <div className="modal-overlay" onClick={() => setOpen(false)}>
                    <div className="modal form-modal" onClick={e => e.stopPropagation()} style={{maxWidth: '800px', width: '90%'}}>
                        <div className="div_form">
                            <div className="form-title">Filtros de Busca</div>
                            <form className="table_form" onSubmit={e => {e.preventDefault(); handleSubmit();}}>
                                <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '12px'}}>
                                    {effectiveCols.map((column) => {
                                        const op = ops[column.key] ?? 'CONTAINS';
                                        const showBetween = op === 'BETWEEN';
                                        return (
                                            <div key={column.key} className="form-field" style={{display: 'flex', flexDirection: 'column', gap: '4px'}}>
                                                <span className="form-label">{column.label}</span>
                                                <div style={{display: 'flex', gap: '4px', alignItems: 'center'}}>
                                                    <select
                                                        style={{width: '120px', padding: '4px', fontSize: '12px', border: '1px solid #ccc', borderRadius: '4px'}}
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
                                                        style={{flex: 1}}
                                                        value={values[column.key] ?? ''}
                                                        onChange={e => setValues(prev => ({...prev, [column.key]: e.target.value}))}
                                                        placeholder={`Filtrar por ${column.label}`}
                                                    />
                                                </div>
                                                {showBetween && (
                                                    <div style={{display: 'flex', gap: '4px', alignItems: 'center', marginTop: '4px'}}>
                                                        <span style={{fontSize: '12px', color: '#666'}}>até</span>
                                                        <input
                                                            className="form-input"
                                                            type="text"
                                                            style={{flex: 1}}
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
                                <div className="modal-actions form-footer" style={{marginTop: '16px', display: 'flex', gap: '8px', justifyContent: 'flex-end'}}>
                                    <button type="button" className="btn-form-back" onClick={() => setOpen(false)}>Cancelar</button>
                                    <button type="button" className="btnorange" onClick={handleClear}>Limpar</button>
                                    <button type="submit" className="btngreen" style={{marginLeft: 'auto'}}>Pesquisar</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
