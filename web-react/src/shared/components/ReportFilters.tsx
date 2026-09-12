import React, {useState, useEffect} from 'react';
import type {FiltroRelatorioWrapper, FilterDimensionType, TempoFilterState, DescritivoFilterState, FixoFilterState, FilterState, QueryOperation, FiltroRelatorio} from '../types/types';
import {STRING_OPERATIONS} from '../types/types';
import {Modal} from './Modal';

interface ReportFiltersProps {
    filtros: FiltroRelatorioWrapper[];
    onFiltersChange: (filtros: FiltroRelatorioWrapper[]) => void;
    onApplyFilters: () => void;
}

const TEMPO_TYPES = [
    {value: 0, label: 'Nenhum'},
    {value: 1, label: 'Normal'},
    {value: 2, label: 'Dinâmico'},
    {value: 3, label: 'Faixa'},
];

export function ReportFilters({filtros, onFiltersChange, onApplyFilters}: ReportFiltersProps) {
    const [open, setOpen] = useState(false);
    const [activeFiltro, setActiveFiltro] = useState<FiltroRelatorioWrapper | null>(null);
    const [filterStates, setFilterStates] = useState<Record<number, FilterState>>({});

    useEffect(() => {
        const initialStates: Record<number, FilterState> = {};
        filtros.forEach((filtro) => {
            const fr = filtro.filtroRelatorio;
            if (fr.dimensao.tipoInfo === 'TEMPO') {
                initialStates[fr.id] = {
                    tipo: 0,
                    dataInicio: '',
                    dataFim: '',
                    campoDinamico: '',
                    queryOperation: 'EQUALS',
                };
            } else if (fr.dimensao.tipoInfo === 'DESCRITIVO') {
                initialStates[fr.id] = {
                    listaTodosSelected: [],
                };
            } else if (fr.tipo === 'FIXO') {
                initialStates[fr.id] = {
                    selected: filtro.selected,
                };
            }
        });
        setFilterStates(initialStates);
    }, [filtros]);

    const handleFiltroClick = (filtro: FiltroRelatorioWrapper) => {
        if (!filtro.filtroRelatorio.exibirFiltro) return;
        setActiveFiltro(filtro);
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        setActiveFiltro(null);
    };

    const handleApply = () => {
        if (activeFiltro) {
            const fr = activeFiltro.filtroRelatorio;
            const state = filterStates[fr.id];
            const updatedFiltros = filtros.map((f) => {
                if (f.filtroRelatorio.id === fr.id) {
                    return {...f, informacao: getFilterInfo(fr, state), selected: isFilterActive(fr, state)};
                }
                return f;
            });
            onFiltersChange(updatedFiltros);
        }
        onApplyFilters();
        handleClose();
    };

    const isFilterActive = (fr: FiltroRelatorio, state: FilterState | undefined): boolean => {
        if (!state) return false;
        if (fr.dimensao.tipoInfo === 'TEMPO') {
            const tempoState = state as TempoFilterState;
            return tempoState.tipo !== 0;
        }
        if (fr.dimensao.tipoInfo === 'DESCRITIVO') {
            const descState = state as DescritivoFilterState;
            return descState.listaTodosSelected.length > 0;
        }
        if (fr.tipo === 'FIXO') {
            const fixoState = state as FixoFilterState;
            return fixoState.selected;
        }
        return false;
    };

    const getFilterInfo = (fr: FiltroRelatorio, state: FilterState | undefined): string => {
        if (!state) return '';
        if (fr.dimensao.tipoInfo === 'TEMPO') {
            const tempoState = state as TempoFilterState;
            const typeLabel = TEMPO_TYPES.find(t => t.value === tempoState.tipo)?.label || '';
            if (tempoState.tipo === 1) {
                return `${typeLabel}: ${tempoState.queryOperation} ${tempoState.dataInicio}`;
            }
            if (tempoState.tipo === 2) {
                return `${typeLabel}: ${tempoState.campoDinamico}`;
            }
            if (tempoState.tipo === 3) {
                return `${typeLabel}: ${tempoState.dataInicio} até ${tempoState.dataFim}`;
            }
            return '';
        }
        if (fr.dimensao.tipoInfo === 'DESCRITIVO') {
            const descState = state as DescritivoFilterState;
            return descState.listaTodosSelected.map(s => s.informacao).join(', ');
        }
        if (fr.tipo === 'FIXO') {
            const fixoState = state as FixoFilterState;
            return fixoState.selected ? 'Aplicado' : '';
        }
        return '';
    };

    const getFilterPanelClass = (filtro: FiltroRelatorioWrapper): string => {
        const fr = filtro.filtroRelatorio;
        const active = isFilterActive(fr, filterStates[fr.id]);
        if (fr.fixo && fr.exibirFiltro) return 'ellipsis btnred';
        if (active && filtro.informacao) return 'ellipsis btngreen';
        if (active) return 'ellipsis btnblue';
        return 'ellipsis';
    };

    const renderFilterContent = () => {
        if (!activeFiltro) return null;

        const fr = activeFiltro.filtroRelatorio;
        const state = filterStates[fr.id];

        if (fr.dimensao.tipoInfo === 'TEMPO') {
            return renderTempoFilter(fr, state as TempoFilterState);
        }
        if (fr.dimensao.tipoInfo === 'DESCRITIVO') {
            return renderDescritivoFilter(fr, state as DescritivoFilterState);
        }
        if (fr.tipo === 'FIXO') {
            return renderFixoFilter(fr, state as FixoFilterState);
        }
        return <div>Tipo de filtro não suportado</div>;
    };

    const renderTempoFilter = (fr: FiltroRelatorio, state: TempoFilterState) => {
        const updateState = (updates: Partial<TempoFilterState>) => {
            setFilterStates(prev => ({...prev, [fr.id]: {...state, ...updates}}));
        };

        return (
            <div>
                <div className="form-field">
                    <label className="form-label">Tipo:</label>
                    <div style={{display: 'flex', gap: '8px', flexWrap: 'wrap'}}>
                        {TEMPO_TYPES.map(t => (
                            <label key={t.value} style={{display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer'}}>
                                <input
                                    type="radio"
                                    name={`tempo-type-${fr.id}`}
                                    value={t.value}
                                    checked={state.tipo === t.value}
                                    onChange={() => updateState({tipo: t.value as 0 | 1 | 2 | 3})}
                                />
                                <span>{t.label}</span>
                            </label>
                        ))}
                    </div>
                </div>

                {state.tipo === 1 && (
                    <div>
                        <div className="form-field">
                            <label className="form-label">Operação:</label>
                            <select
                                className="form-input form-select"
                                value={state.queryOperation || 'EQUALS'}
                                onChange={e => updateState({queryOperation: e.target.value as QueryOperation})}
                            >
                                {STRING_OPERATIONS.map(o => (
                                    <option key={o.value} value={o.value}>{o.label}</option>
                                ))}
                            </select>
                        </div>
                        <div className="form-field">
                            <label className="form-label">Data Início:</label>
                            <input
                                type="date"
                                className="form-input"
                                value={state.dataInicio || ''}
                                onChange={e => updateState({dataInicio: e.target.value})}
                            />
                        </div>
                    </div>
                )}

                {state.tipo === 2 && (
                    <div className="form-field">
                        <label className="form-label">Período Dinâmico:</label>
                        <select
                            className="form-input form-select"
                            value={state.campoDinamico || ''}
                            onChange={e => updateState({campoDinamico: e.target.value})}
                        >
                            <option value="">Selecione</option>
                            <option value="HOJE">Hoje</option>
                            <option value="ONTEM">Ontem</option>
                            <option value="ULTIMA_SEMANA">Última Semana</option>
                            <option value="ULTIMO_MES">Último Mês</option>
                            <option value="ULTIMO_ANO">Último Ano</option>
                            <option value="MES_ATUAL">Mês Atual</option>
                            <option value="ANO_ATUAL">Ano Atual</option>
                        </select>
                    </div>
                )}

                {state.tipo === 3 && (
                    <div style={{display: 'flex', gap: '12px', flexWrap: 'wrap'}}>
                        <div className="form-field" style={{flex: 1, minWidth: '200px'}}>
                            <label className="form-label">Data Início:</label>
                            <input
                                type="date"
                                className="form-input"
                                value={state.dataInicio || ''}
                                onChange={e => updateState({dataInicio: e.target.value})}
                            />
                        </div>
                        <div className="form-field" style={{flex: 1, minWidth: '200px'}}>
                            <label className="form-label">Data Fim:</label>
                            <input
                                type="date"
                                className="form-input"
                                value={state.dataFim || ''}
                                onChange={e => updateState({dataFim: e.target.value})}
                            />
                        </div>
                    </div>
                )}
            </div>
        );
    };

    const renderDescritivoFilter = (fr: FiltroRelatorio, state: DescritivoFilterState) => {
        const availableItems = [
            {informacao: 'Item 1'},
            {informacao: 'Item 2'},
            {informacao: 'Item 3'},
            {informacao: 'Item 4'},
            {informacao: 'Item 5'},
        ];

        const addItem = (item: {informacao: string}) => {
            if (!state.listaTodosSelected.find(s => s.informacao === item.informacao)) {
                setFilterStates(prev => ({
                    ...prev,
                    [fr.id]: {
                        ...state,
                        listaTodosSelected: [...state.listaTodosSelected, item],
                    },
                }));
            }
        };

        const removeItem = (item: {informacao: string}) => {
            setFilterStates(prev => ({
                ...prev,
                [fr.id]: {
                    ...state,
                    listaTodosSelected: state.listaTodosSelected.filter(s => s.informacao !== item.informacao),
                },
            }));
        };

        return (
            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px'}}>
                <div>
                    <h4 style={{marginBottom: '8px'}}>Filtros Disponíveis</h4>
                    <div style={{maxHeight: '300px', overflowY: 'auto', border: '1px solid #ddd', borderRadius: '4px'}}>
                        {availableItems.map((item, idx) => (
                            <div key={idx} style={{display: 'flex', justifyContent: 'space-between', padding: '8px', borderBottom: '1px solid #eee'}}>
                                <span>{item.informacao}</span>
                                <button
                                    type="button"
                                    className="btnblue"
                                    style={{padding: '2px 8px', fontSize: '12px'}}
                                    onClick={() => addItem(item)}
                                >
                                    +
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
                <div>
                    <h4 style={{marginBottom: '8px'}}>Filtros Aplicados</h4>
                    <div style={{maxHeight: '300px', overflowY: 'auto', border: '1px solid #ddd', borderRadius: '4px'}}>
                        {state.listaTodosSelected.length === 0 ? (
                            <div style={{padding: '16px', textAlign: 'center', color: '#666'}}>Nenhum filtro aplicado</div>
                        ) : (
                            state.listaTodosSelected.map((item, idx) => (
                                <div key={idx} style={{display: 'flex', justifyContent: 'space-between', padding: '8px', borderBottom: '1px solid #eee'}}>
                                    <span>{item.informacao}</span>
                                    <button
                                        type="button"
                                        className="btnred"
                                        style={{padding: '2px 8px', fontSize: '12px'}}
                                        onClick={() => removeItem(item)}
                                    >
                                        -
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        );
    };

    const renderFixoFilter = (fr: FiltroRelatorio, state: FixoFilterState) => {
        return (
            <div className="form-field">
                <label style={{display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer'}}>
                    <input
                        type="checkbox"
                        checked={state.selected}
                        onChange={e => setFilterStates(prev => ({
                            ...prev,
                            [fr.id]: {...state, selected: e.target.checked},
                        }))}
                    />
                    <span>Aplicar filtro fixo: {fr.nome}</span>
                </label>
            </div>
        );
    };

return (
        <React.Fragment>
            <div style={{display: 'flex', gap: '4px', flexWrap: 'wrap', marginBottom: '8px'}}>
                {filtros
                    .filter(f => f.filtroRelatorio.exibirFiltro)
                    .map((filtro) => (
                        <button
                            key={filtro.filtroRelatorio.id}
                            type="button"
                            className={`ellipsis ${getFilterPanelClass(filtro)}`}
                            style={{height: '28px', minWidth: '200px', display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '0 8px', fontSize: '12px'}}
                            onClick={() => handleFiltroClick(filtro)}
                            title={filtro.informacao || ''}
                        >
                            <i className="fa fa-filter" style={{fontSize: '12px'}}/>
                            <span style={{whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{filtro.filtroRelatorio.nome}</span>
                        </button>
                    ))}
            </div>

            <Modal
                title={`Filtro: ${activeFiltro?.filtroRelatorio.nome || ''}`}
                open={open}
                onClose={handleClose}
                size="lg"
            >
                <div className="div_form">
                    <form className="table_form" onSubmit={e => {e.preventDefault(); handleApply();}}>
                        <div style={{padding: '16px'}}>
                            {renderFilterContent()}
                        </div>
                        <div className="modal-actions form-footer" style={{marginTop: '16px', display: 'flex', gap: '8px', justifyContent: 'flex-end'}}>
                            <button type="button" className="btn-form-back btnyellow" onClick={handleClose}>Cancelar</button>
                            <button type="button" className="btnorange" onClick={() => {
                                if (activeFiltro) {
                                    setFilterStates(prev => {
                                        const fr = activeFiltro.filtroRelatorio;
                                        const state = prev[fr.id];
                                        let clearedState: FilterState;
                                        if (fr.dimensao.tipoInfo === 'TEMPO') {
                                            clearedState = {tipo: 0, dataInicio: '', dataFim: '', campoDinamico: '', queryOperation: 'EQUALS'};
                                        } else if (fr.dimensao.tipoInfo === 'DESCRITIVO') {
                                            clearedState = {listaTodosSelected: []};
                                        } else {
                                            clearedState = {selected: false};
                                        }
                                        return {...prev, [fr.id]: clearedState};
                                    });
                                }
                            }}>Limpar</button>
                            <button type="submit" className="btngreen" style={{marginLeft: 'auto'}}>Aplicar</button>
                        </div>
                    </form>
                </div>
            </Modal>
        </React.Fragment>
    );
}

export function ReportFilterButton({filtros, onFiltersChange, onApplyFilters}: ReportFiltersProps) {
    return <ReportFilters filtros={filtros} onFiltersChange={onFiltersChange} onApplyFilters={onApplyFilters} />;
}