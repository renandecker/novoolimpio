import {useState, useEffect} from 'react';

import {PermissionGate} from '../../../shared/services/permissions';

import {ModuleTabs} from '../../../shared/components/ModuleTabs';

import type {DataTableColumn} from '../../../shared/components/DataTable';

import type {ApiItem} from '../../../shared/types/types.ts';

import {api} from '../../../shared/services/api';

import {AutoComplete} from '../../../shared/components/AutoComplete';

import type {AutoCompleteOption} from '../../../shared/components/AutoComplete';

import {DataTable} from '../../../shared/components/DataTable';

import {formatDate} from '../../../shared/utils/dateUtils';

const asRecord = (item: ApiItem) => item as unknown as Record<string, unknown>;

const apiErrorMessage = (error: unknown): string =>
    (error as { response?: { data?: { error?: string } } })?.response?.data?.error
        ?? (error as Error)?.message
        ?? 'erro desconhecido';

const FERIADO_COLUMNS: DataTableColumn[] = [
    {key: 'nome', label: 'Nome'},
    {key: 'descricao', label: 'Descrição'},
    {
        key: 'dt_feriado',
        label: 'Data',
        render: (item) => formatDate(asRecord(item).dt_feriado),
    },
    {
        key: 'fl_feriado_fixo',
        label: 'Fixo',
        render: (item) => (asRecord(item).fl_feriado_fixo ? 'Sim' : 'Não'),
    },
    {
        key: 'fl_tipo_curso',
        label: 'Todos Cursos',
        render: (item) => (asRecord(item).fl_tipo_curso ? 'Sim' : 'Não'),
    },
    {
        key: 'fl_nacional',
        label: 'Nacional',
        render: (item) => (asRecord(item).fl_nacional ? 'Sim' : 'Não'),
    },
];

const AJUSTE_COLUMNS: DataTableColumn[] = [
    {key: 'id', label: 'ID'},
    {key: 'feriadoNome', label: 'Feriado'},
    {key: 'feriadoData', label: 'Data Feriado', render: (item) => formatDate(asRecord(item).feriadoData)},
    {key: 'usuarioLogin', label: 'Usuário'},
    {key: 'ativo', label: 'Ativo', render: (item) => asRecord(item).ativo ? 'Sim' : 'Não'},
    {key: 'ocorrencia', label: 'Com Ocorrência', render: (item) => asRecord(item).ocorrencia ? 'Sim' : 'Não'},
];

const OCORRENCIA_COLUMNS: DataTableColumn[] = [
    {key: 'id', label: 'ID'},
    {key: 'data', label: 'Data', render: (item) => formatDate(asRecord(item).data)},
    {key: 'oferecimentoDescricao', label: 'Oferecimento'},
    {key: 'grupoNome', label: 'Grupo'},
    {key: 'unidadeSucinto', label: 'Unidade'},
    {key: 'cursoNome', label: 'Curso'},
    {key: 'componenteCurricularDescricao', label: 'Componente Curricular'},
    {key: 'cargaHoraria', label: 'C.H.'},
    {key: 'status', label: 'Status'},
    {key: 'inscritos', label: 'Inscritos'},
    {key: 'vagas', label: 'Vagas'},
    {key: 'diaSemanaNome', label: 'Dia da Semana'},
    {key: 'turnoDescricao', label: 'Turno'},
    {key: 'tempoAulaDescricao', label: 'Tempo Aula'},
];

export default function ViewFeriadoListFeriadoListScreen() {
    const [trocaEntity, setTrocaEntity] = useState<ApiItem | null>(null);
    const [aviso, setAviso] = useState('');
    const [activeTab, setActiveTab] = useState('tabela');
    
    const [ajustes, setAjustes] = useState<ApiItem[]>([]);
    const [ajustesLoading, setAjustesLoading] = useState(false);
    const [ajustesTotal, setAjustesTotal] = useState(0);
    const [ajustesPage, setAjustesPage] = useState(0);
    const [ajustesSize, setAjustesSize] = useState(10);
    
    const [calendarioEventos, setCalendarioEventos] = useState<any[]>([]);
    const [calendarioLoading, setCalendarioLoading] = useState(false);
    
    const [selectedAjusteId, setSelectedAjusteId] = useState<Long | null>(null);
    const [ocorrenciasAjustar, setOcorrenciasAjustar] = useState<ApiItem[]>([]);
    const [ocorrenciasAjustarLoading, setOcorrenciasAjustarLoading] = useState(false);
    const [ocorrenciasNaoAjustar, setOcorrenciasNaoAjustar] = useState<ApiItem[]>([]);
    const [ocorrenciasNaoAjustarLoading, setOcorrenciasNaoAjustarLoading] = useState(false);

    const atualizarFeriado = async (item: ApiItem) => {
        setAviso('');
        try {
            await api.post('/api/basico/feriado/atualizar-oferecimento', null);
            setAviso('Trigger de ajuste geral enviado para o schedule.');
        } catch (error) {
            setAviso(`Falha ao atualizar feriados: ${apiErrorMessage(error)}`);
        }
    };

    const abrirTroca = (item: ApiItem) => {
        setAviso('');
        setTrocaEntity(item);
    };

    const loadAjustes = async (page: number = 0, size: number = 10) => {
        setAjustesLoading(true);
        try {
            const {data} = await api.get<{items: ApiItem[], total: number}>(`/api/basico/feriado/ajustes/paged`, {
                params: {page, size}
            });
            setAjustes(data.items ?? []);
            setAjustesTotal(data.total ?? 0);
            setAjustesPage(page);
        } catch (error) {
            setAviso(`Falha ao carregar ajustes: ${apiErrorMessage(error)}`);
        } finally {
            setAjustesLoading(false);
        }
    };

    const loadCalendarioEventos = async () => {
        setCalendarioLoading(true);
        try {
            const {data} = await api.get<ApiItem[]>('/api/basico/feriado/calendario/eventos');
            setCalendarioEventos(data ?? []);
        } catch (error) {
            setAviso(`Falha ao carregar calendário: ${apiErrorMessage(error)}`);
        } finally {
            setCalendarioLoading(false);
        }
    };

    const loadOcorrenciasAjustar = async (ajusteId: Long) => {
        setOcorrenciasAjustarLoading(true);
        try {
            const {data} = await api.get<ApiItem[]>(`/api/basico/feriado/ajustes/${ajusteId}/ocorrencias-ajustar`);
            setOcorrenciasAjustar(data ?? []);
        } catch (error) {
            setAviso(`Falha ao carregar ocorrências para ajustar: ${apiErrorMessage(error)}`);
        } finally {
            setOcorrenciasAjustarLoading(false);
        }
    };

    const loadOcorrenciasNaoAjustar = async (ajusteId: Long) => {
        setOcorrenciasNaoAjustarLoading(true);
        try {
            const {data} = await api.get<ApiItem[]>(`/api/basico/feriado/ajustes/${ajusteId}/ocorrencias-nao-ajustar`);
            setOcorrenciasNaoAjustar(data ?? []);
        } catch (error) {
            setAviso(`Falha ao carregar ocorrências não ajustar: ${apiErrorMessage(error)}`);
        } finally {
            setOcorrenciasNaoAjustarLoading(false);
        }
    };

    const handleTabChange = (tabKey: string) => {
        setActiveTab(tabKey);
        if (tabKey === 'ajusteFeriadoOferecimento' && ajustes.length === 0) {
            loadAjustes();
        } else if (tabKey === 'calendario' && calendarioEventos.length === 0) {
            loadCalendarioEventos();
        } else if (tabKey === 'feriadoAjuste' && selectedAjusteId) {
            loadOcorrenciasAjustar(selectedAjusteId);
        } else if (tabKey === 'feriadoNaoAjustar' && selectedAjusteId) {
            loadOcorrenciasNaoAjustar(selectedAjusteId);
        }
    };

    const handleAjusteRowClick = (item: ApiItem) => {
        const id = asRecord(item).id;
        setSelectedAjusteId(id);
        if (activeTab === 'feriadoAjuste') {
            loadOcorrenciasAjustar(id);
        } else if (activeTab === 'feriadoNaoAjustar') {
            loadOcorrenciasNaoAjustar(id);
        }
    };

    const renderTabContent = (tabKey: string) => {
        switch (tabKey) {
            case 'calendario':
                return (
                    <div className="tab-content">
                        <CalendarioView 
                            eventos={calendarioEventos} 
                            loading={calendarioLoading}
                            onRefresh={loadCalendarioEventos}
                        />
                    </div>
                );
            case 'ajusteFeriadoOferecimento':
                return (
                    <div className="tab-content">
                        <DataTable
                            items={ajustes}
                            columns={AJUSTE_COLUMNS}
                            loading={ajustesLoading}
                            total={ajustesTotal}
                            page={ajustesPage}
                            pageSize={ajustesSize}
                            onPageChange={setAjustesPage}
                            onPageSizeChange={setAjustesSize}
                            onRowClick={handleAjusteRowClick}
                            rowKey="id"
                        />
                    </div>
                );
            case 'feriadoAjuste':
                return (
                    <div className="tab-content">
                        {selectedAjusteId ? (
                            <DataTable
                                items={ocorrenciasAjustar}
                                columns={OCORRENCIA_COLUMNS}
                                loading={ocorrenciasAjustarLoading}
                                rowKey="id"
                            />
                        ) : (
                            <p className="data-table-notice">Selecione um ajuste na aba "Ajuste Feriado Oferecimento" para visualizar as ocorrências a ajustar.</p>
                        )}
                    </div>
                );
            case 'feriadoNaoAjustar':
                return (
                    <div className="tab-content">
                        {selectedAjusteId ? (
                            <DataTable
                                items={ocorrenciasNaoAjustar}
                                columns={OCORRENCIA_COLUMNS}
                                loading={ocorrenciasNaoAjustarLoading}
                                rowKey="id"
                            />
                        ) : (
                            <p className="data-table-notice">Selecione um ajuste na aba "Ajuste Feriado Oferecimento" para visualizar as ocorrências não ajustar.</p>
                        )}
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <PermissionGate permission="READ">
            <main>
                <h1>Feriado</h1>
                {aviso && <p className="data-table-notice">{aviso}</p>}
                <ModuleTabs
                    tabs={[
                        {
                            key: 'tabela',
                            label: 'Tabela',
                            path: '/api/view/feriado/listFeriado',
                            columns: FERIADO_COLUMNS,
                            maxMainColumns: FERIADO_COLUMNS.length,
                            editNavigateTo: '/view/feriado/formFeriado',
                            createNavigateTo: '/view/feriado/formFeriado',
                            extraRowActions: [
                                {
                                    key: 'atualizar',
                                    title: 'Atualizar feriado',
                                    className: 'btnblack',
                                    icon: <i className="fa fa-refresh"/>,
                                    permission: 'UPDATE',
                                    onClick: atualizarFeriado,
                                },
                                {
                                    key: 'troca',
                                    title: 'Troca e remove feriado',
                                    className: 'btnorange',
                                    icon: <i className="fa fa-random"/>,
                                    permission: 'DELETE',
                                    onClick: abrirTroca,
                                },
                            ],
                        },
                        {
                            key: 'calendario',
                            label: 'Calendário',
                            onActivate: () => handleTabChange('calendario'),
                            render: () => renderTabContent('calendario'),
                        },
                        {
                            key: 'ajusteFeriadoOferecimento',
                            label: 'Ajuste Feriado Oferecimento',
                            onActivate: () => handleTabChange('ajusteFeriadoOferecimento'),
                            render: () => renderTabContent('ajusteFeriadoOferecimento'),
                        },
                        {
                            key: 'feriadoAjuste',
                            label: 'Feriado Ajuste',
                            onActivate: () => handleTabChange('feriadoAjuste'),
                            render: () => renderTabContent('feriadoAjuste'),
                        },
                        {
                            key: 'feriadoNaoAjustar',
                            label: 'Feriado Não Ajustar',
                            onActivate: () => handleTabChange('feriadoNaoAjustar'),
                            render: () => renderTabContent('feriadoNaoAjustar'),
                        },
                    ]}
                />
                {trocaEntity && (
                    <TrocaFeriadoDialog
                        entity={trocaEntity}
                        onClose={() => setTrocaEntity(null)}
                    />
                )}
            </main>
        </PermissionGate>
    );
}

function CalendarioView({eventos, loading, onRefresh}: { eventos: any[]; loading: boolean; onRefresh: () => void }) {
    if (loading) {
        return <p className="master-detail-empty">Carregando calendário...</p>;
    }
    if (eventos.length === 0) {
        return (
            <div className="tab-content">
                <p className="master-detail-empty">Nenhum feriado cadastrado para exibir no calendário.</p>
                <button className="btnblue" onClick={onRefresh}>Carregar Calendário</button>
            </div>
        );
    }
    return (
        <div className="calendario-view">
            <div className="calendario-legend">
                <span className="legend-item"><span className="legend-color" style={{background: '#27ae60'}}></span> Feriado Fixo</span>
                <span className="legend-item"><span className="legend-color" style={{background: '#3498db'}}></span> Feriado Variável</span>
            </div>
            <div className="calendario-events">
                {eventos.map((evento: any) => (
                    <div key={evento.id} className="calendario-event" style={{borderLeftColor: evento.color}}>
                        <strong>{evento.title}</strong>
                        <span>{formatDate(evento.start)}</span>
                        {evento.descricao && <span className="descricao">{evento.descricao}</span>}
                        <div className="badges">
                            {evento.feriadoFixo && <span className="badge badge-green">Fixo</span>}
                            {evento.nacional && <span className="badge badge-blue">Nacional</span>}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function TrocaFeriadoDialog({entity, onClose}: { entity: ApiItem; onClose: () => void }) {
    const record = asRecord(entity);
    const destinoId = Number(record.id);
    const [selecao, setSelecao] = useState<AutoCompleteOption | null>(null);
    const [lista, setLista] = useState<AutoCompleteOption[]>([]);
    const [salvando, setSalvando] = useState(false);
    const [erro, setErro] = useState('');

    const buscarOpcoes = async (query: string): Promise<AutoCompleteOption[]> => {
        if (!query.trim()) return [];
        const {data} = await api.get<Array<{ id: number; nome: string }>>(
            '/api/basico/feriado',
            {params: {query, excluirId: destinoId}},
        );
        return (data ?? []).map((item) => ({id: item.id, label: item.nome || `#${item.id}`}));
    };

    const adicionar = () => {
        setErro('');
        if (!selecao) return;
        if (lista.some((item) => item.id === selecao.id)) return;
        setLista((prev) => [...prev, selecao]);
        setSelecao(null);
    };

    const remover = (id: number) => {
        setErro('');
        setLista((prev) => prev.filter((item) => item.id !== id));
    };

    const trocar = async () => {
        if (lista.length === 0) {
            setErro('Adicione ao menos um feriado para trocar.');
            return;
        }
        setSalvando(true);
        setErro('');
        try {
            await api.post('/api/basico/feriado/trocar-feriados', {
                destinoId,
                origemIds: lista.map((item) => item.id),
            });
            alert('Feriados trocados com sucesso');
            onClose();
        } catch (error) {
            setErro(`Ocorreu um erro ao trocar feriados: ${apiErrorMessage(error)}`);
        } finally {
            setSalvando(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal form-modal" onClick={(event) => event.stopPropagation()}>
                <div className="div_form">
                    <div className="form-title">Troca e remoção feriado</div>
                    <div className="table_form">
                        <div className="form-grid">
                            <div className="form-field">
                                <span className="form-label">Id</span>
                                <span>{String(record.id ?? '')}</span>
                            </div>
                            <div className="form-field">
                                <span className="form-label">Nome</span>
                                <span>{String(record.nome ?? '')}</span>
                            </div>
                            <div className="form-field">
                                <span className="form-label">Data</span>
                                <span>{formatDate(record.dt_feriado)}</span>
                            </div>
                            <div className="form-field">
                                <span className="form-label">Nacional</span>
                                <span>{record.fl_nacional === true ? 'Sim' : 'Não'}</span>
                            </div>
                        </div>
                        <fieldset className="form-fieldset">
                            <legend>Feriados removidos e alterados</legend>
                            <label className="form-field">
                                <span className="form-label">Feriado</span>
                                <div style={{display: 'flex', gap: '8px', width: '100%'}}>
                                    <div style={{flex: 1}}>
                                        <AutoComplete
                                            placeholder="Digite para buscar (mínimo 3 caracteres)"
                                            value={selecao}
                                            onChange={setSelecao}
                                            fetchOptions={buscarOpcoes}
                                        />
                                    </div>
                                    <button type="button" className="btnblue" title="Adicionar" onClick={adicionar}>
                                        +
                                    </button>
                                </div>
                            </label>
                            {lista.length > 0 ? (
                                <table className="data-table" style={{width: '100%', marginTop: 8}}>
                                    <thead>
                                    <tr>
                                        <th>Id</th>
                                        <th>Nome</th>
                                        <th style={{width: 50}}></th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {lista.map((item) => (
                                        <tr key={item.id}>
                                            <td>{item.id}</td>
                                            <td>{item.label}</td>
                                            <td>
                                                <button type="button" className="btn-action btnred" title="Remover"
                                                        onClick={() => remover(item.id)}>
                                                    ×
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            ) : (
                                <p className="master-detail-empty">Nenhum registro selecionado.</p>
                            )}
                        </fieldset>
                        {erro && <small style={{color: '#c0392b'}}>{erro}</small>}
                        <div className="form-buttons">
                            <button type="button" className="btnblue" title="Trocar e remover feriados"
                                    disabled={salvando} onClick={() => void trocar()}>
                                {salvando ? 'Trocando...' : 'Trocar e Salvar'}
                            </button>
                            <button type="button" className="btnyellow" onClick={onClose} disabled={salvando}>
                                Fechar
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
