import {useState, useCallback, useMemo} from 'react';
import {useQuery, useMutation, useQueryClient} from '@tanstack/react-query';
import {api} from '../../shared/services/api';
import {PermissionGate} from '../../shared/services/permissions';
import {ScheduleWeekView, mondayOf, toIsoDate, parseDate, addDays, type ScheduleEventData} from '../../shared/components/WeeklyGrid';
import {DataTable, type DataTableColumn} from '../../shared/components/DataTable';
import {Tabs} from '../../shared/components/Tabs';
import {Modal} from '../../shared/components/Modal';
import {AutoComplete} from '../../shared/components/AutoComplete';
import {format} from 'date-fns';
import '../../features/professor/Disponibilidade.css';
import './ViewAgendaCompromissosScreen.css';

interface Compromisso {
    id: number;
    descricao: string;
    data: string;
    horario?: { id: number; hora: string };
    agenda?: { id: number; descricao: string; tipoAgenda?: { cor: string }; diasmmaximo: boolean; qtdediasmaximo: number };
    pessoa?: { id: number; nome: string; pessoaFisica?: { nome: string; cpf: string }; pessoaJuridica?: { nomeFantasia: string; cnpj: string } };
    tipoCompromisso?: { id: number; descricao: string };
    statusCompromisso?: StatusCompromisso;
    usuario?: { id: number; login: string; nome: string };
    atendente?: { id: number; login: string; nome: string };
    usuarioFinalizou?: { id: number; login: string; nome: string };
    observacao?: string;
    ativo: boolean;
    prospecto?: { id: number };
    compromissoStatusUsuarios?: CompromissoStatusUsuario[];
    resultados?: Resultado[];
}

interface StatusCompromisso {
    id: number;
    descricao: string;
    cor: string;
    alguem: boolean;
    trocaautomatomatica: boolean;
    dias: number;
    descricaoPessoa: string;
    qtdeUsuario: number;
    proxStatusCompromisso?: StatusCompromisso;
    statusModulos?: StatusModulo[];
}

interface StatusModulo {
    modulo: { id: number; rotulo: string; icone: string; outcome: string };
    cor: string;
}

interface CompromissoStatusUsuario {
    id: number;
    usuario: { id: number; pessoaFisica: { nome: string } };
    pessoa: { id: number; pessoaFisica: { nome: string } };
    data: string;
    statusCompromissoAnterior: StatusCompromisso;
    statusCompromissoProximo: StatusCompromisso;
}

interface Resultado {
    id: number;
    descricao: string;
}

interface Agenda {
    id: number;
    descricao: string;
    tipoAgenda?: { id: number; descricao: string; cor: string };
    diasmmaximo: boolean;
    qtdediasmaximo: number;
    unidade?: { id: number; sucinto: string };
    resultados?: Resultado[];
    status?: StatusCompromisso[];
    usuarioAgendas?: UsuarioAgenda[];
}

interface UsuarioAgenda {
    id: number;
    usuario: { id: number; login: string; nome: string };
    atender: boolean;
    agendar: boolean;
}

interface Horario {
    id: number;
    hora: string;
}

interface TipoCompromisso {
    id: number;
    descricao: string;
}

type ViewMode = 'calendar' | 'list';

const STATUS_COLORS: Record<string, string> = {
    'AGENDADO': 'evento-blue',
    'CONFIRMADO': 'evento-green',
    'EM_ATENDIMENTO': 'evento-orange',
    'FINALIZADO': 'evento-black',
    'CANCELADO': 'evento-red',
    'REAGENDADO': 'evento-yellow',
    'NAO_COMPARECEU': 'evento-purple',
};

function getStatusClass(status?: StatusCompromisso): string {
    if (!status) return 'evento-blue';
    const desc = status.descricao.toUpperCase();
    return STATUS_COLORS[desc] || 'evento-blue';
}

function getPessoaNome(pessoa?: Compromisso['pessoa']): string {
    if (!pessoa) return '';
    return pessoa.pessoaFisica?.nome || pessoa.pessoaJuridica?.nomeFantasia || pessoa.nome || '';
}

function formatDateBR(dateStr?: string): string {
    if (!dateStr) return '';
    const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(dateStr);
    if (!match) return dateStr;
    return `${match[3]}/${match[2]}/${match[1]}`;
}

function formatDateTimeBR(dateStr?: string): string {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return format(d, 'dd/MM/yyyy HH:mm');
}

export default function ViewAgendaCompromissosScreen() {
    const queryClient = useQueryClient();
    const [viewMode, setViewMode] = useState<ViewMode>('calendar');
    const [weekStart, setWeekStart] = useState(() => toIsoDate(mondayOf(new Date())));
    const [selectedAgendaId, setSelectedAgendaId] = useState<number | ''>('');
    const [selectedUnidadeId, setSelectedUnidadeId] = useState<number | ''>('');
    const [searchTerm, setSearchTerm] = useState('');

    const agendasQuery = useQuery({
        queryKey: ['agendas', selectedUnidadeId],
        queryFn: async () => {
            const params = selectedUnidadeId ? {unidadeId: selectedUnidadeId} : {};
            const response = await api.get<Agenda[]>('/api/basico/agenda', {params});
            return response.data;
        },
    });

    const unidadesQuery = useQuery({
        queryKey: ['unidades'],
        queryFn: async () => (await api.get<Array<{id: number; sucinto: string; nomeFantasia: string}>>('/api/view/unidade/listUnidade')).data,
    });

    const tiposCompromissoQuery = useQuery({
        queryKey: ['tipos-compromisso'],
        queryFn: async () => (await api.get<TipoCompromisso[]>('/api/view/compromisso/listTipoCompromisso')).data,
    });

    const pessoasOptionsQuery = useQuery({
        queryKey: ['pessoas-options'],
        queryFn: async () => (await api.get<Array<{id: number; nome: string; pessoaFisica?: {nome: string; cpf: string}; pessoaJuridica?: {nomeFantasia: string; cnpj: string}}>>('/api/view/pessoa/listPessoa')).data,
    });

    const tiposCompromisso = tiposCompromissoQuery.data || [];
    const pessoasOptions = pessoasOptionsQuery.data || [];

    const compromissosQuery = useQuery({
        queryKey: ['compromissos', selectedAgendaId, weekStart, viewMode],
        queryFn: async () => {
            const params: Record<string, any> = {inicio: weekStart, fim: toIsoDate(addDays(parseDate(weekStart), 6))};
            if (selectedAgendaId) params.agendaId = selectedAgendaId;
            const response = await api.get<Compromisso[]>('/api/view/compromisso/listCompromisso', {params});
            return response.data;
        },
        enabled: viewMode === 'list' || !!selectedAgendaId,
    });

    const eventosQuery = useQuery({
        queryKey: ['compromissos-eventos', selectedAgendaId, weekStart],
        queryFn: async () => {
            const params: Record<string, any> = {inicio: weekStart, fim: toIsoDate(addDays(parseDate(weekStart), 6))};
            if (selectedAgendaId) params.agendaId = selectedAgendaId;
            const response = await api.get<Compromisso[]>('/api/view/compromisso/listCompromisso', {params});
            return response.data.map(c => ({
                id: c.id,
                title: `${c.horario?.hora || ''} - ${c.descricao} (${getPessoaNome(c.pessoa)})`,
                start: `${c.data}T${c.horario?.hora || '00:00'}`,
                end: `${c.data}T${c.horario?.hora || '00:00'}`,
                allDay: false,
                styleClass: getStatusClass(c.statusCompromisso),
                ocorrenciaId: c.id,
            })) as ScheduleEventData[];
        },
        enabled: viewMode === 'calendar',
    });

    const [selectedCompromisso, setSelectedCompromisso] = useState<Compromisso | null>(null);
    const [showDetails, setShowDetails] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [showChangeStatus, setShowChangeStatus] = useState(false);
    const [showCloseCompromisso, setShowCloseCompromisso] = useState(false);
    const [showNextStatus, setShowNextStatus] = useState(false);
    const [formData, setFormData] = useState<Partial<Compromisso> & {resultadoSelecionado?: {id: number; label: string} | null; testemunhaSelecionada?: {id: number; label: string} | null}>({resultadoSelecionado: null, testemunhaSelecionada: null});
    const [isEditing, setIsEditing] = useState(false);
    const [formHorarios, setFormHorarios] = useState<Horario[]>([]);
    const [formTipoHorario, setFormTipoHorario] = useState<'unidade' | 'pessoa'>('unidade');
    const [nextStatusResultados, setNextStatusResultados] = useState<Resultado[]>([]);
    const [nextStatusAtendente, setNextStatusAtendente] = useState<{id: number; login: string; nome: string} | null>(null);
    const [nextStatusTestemunhas, setNextStatusTestemunhas] = useState<Array<{id: number; login: string; nome: string}>>([]);
    const [nextStatusObservacao, setNextStatusObservacao] = useState('');

    const usuariosQuery = useQuery({
        queryKey: ['usuarios-options'],
        queryFn: async () => (await api.get<Array<{id: number; login: string; nome: string}>>('/api/view/usuario/listUsuario')).data,
    });
    const usuariosOptions = usuariosQuery.data || [];

    const loadHorarios = useCallback(async (agendaId: number, data: string, tipo: 'unidade' | 'pessoa') => {
        try {
            const response = await api.get<Horario[]>(`/api/basico/horario/disponiveis`, {
                params: {agendaId, data, tipo},
            });
            setFormHorarios(response.data);
        } catch (error) {
            console.error('Erro ao carregar horários:', error);
            setFormHorarios([]);
        }
    }, []);

    const handleAgendaChange = useCallback((agenda: Agenda | null) => {
        if (agenda && formData.data) {
            loadHorarios(agenda.id, formData.data, formTipoHorario);
        } else {
            setFormHorarios([]);
        }
        setFormData(prev => ({...prev, agenda}));
    }, [formData.data, formTipoHorario, loadHorarios]);

    const handleTipoHorarioChange = useCallback((tipo: 'unidade' | 'pessoa') => {
        setFormTipoHorario(tipo);
        if (formData.agenda?.id && formData.data) {
            loadHorarios(formData.agenda.id, formData.data, tipo);
        }
    }, [formData.agenda?.id, formData.data, loadHorarios]);

    const createCompromissoMutation = useMutation({
        mutationFn: async (data: Partial<Compromisso>) => {
            const response = await api.post<Compromisso>('/api/basico/compromisso', data);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['compromissos']});
            queryClient.invalidateQueries({queryKey: ['compromissos-eventos']});
            setShowForm(false);
            setFormData({});
        },
    });

    const updateCompromissoMutation = useMutation({
        mutationFn: async (data: Partial<Compromisso> & {id: number}) => {
            const {id, ...rest} = data;
            const response = await api.put<Compromisso>(`/api/basico/compromisso/${id}`, rest);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['compromissos']});
            queryClient.invalidateQueries({queryKey: ['compromissos-eventos']});
            setShowForm(false);
            setFormData({});
            setIsEditing(false);
        },
    });

    const changeStatusMutation = useMutation({
        mutationFn: async ({compromissoId, statusId}: {compromissoId: number; statusId: number}) => {
            const response = await api.put(`/api/basico/compromisso/${compromissoId}/troca-status`, {statusId});
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['compromissos']});
            queryClient.invalidateQueries({queryKey: ['compromissos-eventos']});
            setShowChangeStatus(false);
        },
    });

    const closeCompromissoMutation = useMutation({
        mutationFn: async (compromissoId: number) => {
            await api.put(`/api/basico/compromisso/${compromissoId}/fechar`, {});
        },
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['compromissos']});
            queryClient.invalidateQueries({queryKey: ['compromissos-eventos']});
            setShowCloseCompromisso(false);
        },
    });

    const nextStatusMutation = useMutation({
        mutationFn: async (data: {compromissoId: number; observacao: string; resultadoIds: number[]; atendenteId?: number; testemunhaIds?: number[]}) => {
            const response = await api.put(`/api/basico/compromisso/${data.compromissoId}/proximo-status`, data);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['compromissos']});
            queryClient.invalidateQueries({queryKey: ['compromissos-eventos']});
            setShowNextStatus(false);
            setNextStatusResultados([]);
            setNextStatusAtendente(null);
            setNextStatusTestemunhas([]);
            setNextStatusObservacao('');
        },
    });

    const fetchCompromissoDetails = useCallback(async (compromissoId: number) => {
        try {
            const response = await api.get<Compromisso>(`/api/basico/compromisso/${compromissoId}`);
            setSelectedCompromisso(response.data);
            setShowDetails(true);
        } catch (error) {
            console.error('Erro ao carregar detalhes:', error);
        }
    }, []);

    const openCreateForm = useCallback(() => {
        setFormData({ativo: true, tipoHorario: 'unidade'});
        setFormHorarios([]);
        setFormTipoHorario('unidade');
        setIsEditing(false);
        setShowForm(true);
    }, []);

    const openEditForm = useCallback((compromisso: Compromisso) => {
        setFormData({
            id: compromisso.id,
            descricao: compromisso.descricao,
            data: compromisso.data,
            horario: compromisso.horario,
            agenda: compromisso.agenda,
            pessoa: compromisso.pessoa,
            tipoCompromisso: compromisso.tipoCompromisso,
            observacao: compromisso.observacao,
            ativo: compromisso.ativo,
        });
        setIsEditing(true);
        if (compromisso.agenda?.id && compromisso.data) {
            loadHorarios(compromisso.agenda.id, compromisso.data, formTipoHorario);
        }
        setShowForm(true);
    }, [loadHorarios, formTipoHorario]);

    const handleEventClick = useCallback((event: ScheduleEventData) => {
        if (event.ocorrenciaId) {
            fetchCompromissoDetails(event.ocorrenciaId);
        }
    }, [fetchCompromissoDetails]);

    const handleDateSelect = useCallback((date: string, startTime: string, endTime: string) => {
        if (!selectedAgendaId) return;
        setFormData({
            ativo: true,
            data: date,
            agenda: agendasQuery.data?.find(a => a.id === selectedAgendaId),
        });
        setFormTipoHorario('unidade');
        setIsEditing(false);
        loadHorarios(selectedAgendaId, date, 'unidade');
        setShowForm(true);
    }, [selectedAgendaId, agendasQuery.data, loadHorarios]);

    const handleRowClick = useCallback((compromisso: Compromisso) => {
        fetchCompromissoDetails(compromisso.id);
    }, [fetchCompromissoDetails]);

    const handleOpenChangeStatus = useCallback((compromisso: Compromisso) => {
        if (!compromisso.ativo) return;
        setSelectedCompromisso(compromisso);
        setShowChangeStatus(true);
    }, []);

    const handleOpenCloseCompromisso = useCallback((compromisso: Compromisso) => {
        if (!compromisso.ativo) return;
        setSelectedCompromisso(compromisso);
        setShowCloseCompromisso(true);
    }, []);

    const handleOpenNextStatus = useCallback((compromisso: Compromisso) => {
        if (!compromisso.ativo || !compromisso.statusCompromisso?.proxStatusCompromisso) return;
        setSelectedCompromisso(compromisso);
        setNextStatusResultados(compromisso.resultados || []);
        setShowNextStatus(true);
    }, []);

    const LEGENDA = useMemo(() => {
        const statuses = agendasQuery.data?.flatMap(a => a.status || []) || [];
        const unique = new Map(statuses.map(s => [s.descricao, s]));
        return Array.from(unique.values()).map(s => ({
            className: getStatusClass(s),
            label: s.descricao,
        }));
    }, [agendasQuery.data]);

    const COLUMNS: DataTableColumn[] = useMemo(() => [
        {key: 'id', label: 'ID'},
        {key: 'descricao', label: 'Descrição/Visitante'},
        {key: 'agenda_descricao', label: 'Agenda', render: (item) => item.agenda?.descricao || ''},
        {key: 'data', label: 'Data', render: (item) => formatDateBR(item.data)},
        {key: 'horario_hora', label: 'Horário', render: (item) => item.horario?.hora || ''},
        {key: 'pessoa_nome', label: 'Pessoa', render: (item) => getPessoaNome(item.pessoa)},
        {key: 'tipoCompromisso_descricao', label: 'Tipo', render: (item) => item.tipoCompromisso?.descricao || ''},
        {key: 'status_compromisso_descricao', label: 'Status', render: (item) => item.statusCompromisso?.descricao || ''},
        {key: 'usuario_login', label: 'Agendou', render: (item) => item.usuario?.login || ''},
        {key: 'atendente_login', label: 'Atendente', render: (item) => item.atendente?.login || ''},
    ], []);

    const filteredCompromissos = useMemo(() => {
        if (!searchTerm) return compromissosQuery.data || [];
        const term = searchTerm.toLowerCase();
        return (compromissosQuery.data || []).filter(c =>
            c.descricao?.toLowerCase().includes(term) ||
            getPessoaNome(c.pessoa).toLowerCase().includes(term) ||
            c.agenda?.descricao?.toLowerCase().includes(term) ||
            c.statusCompromisso?.descricao?.toLowerCase().includes(term) ||
            c.usuario?.login?.toLowerCase().includes(term)
        );
    }, [compromissosQuery.data, searchTerm]);

    return (
        <PermissionGate permission="READ">
            <main className="agenda-compromissos-screen">
                <div className="screen-header">
                    <h1>Agenda de Compromissos</h1>
                    <div className="agenda-selector">
                        <label htmlFor="agenda">Agenda *</label>
                        <AutoComplete
                            id="agenda"
                            value={selectedAgendaId ? agendasQuery.data?.find(a => a.id === selectedAgendaId) : null}
                            onChange={(e: any) => {
                                const agenda = e.target?.option?.id ? agendasQuery.data?.find((a: any) => a.id === Number(e.target.value)) : null;
                                setSelectedAgendaId(agenda?.id || '');
                                if (agenda && formData.data) {
                                    loadHorarios(agenda.id, formData.data, formTipoHorario);
                                } else {
                                    setFormHorarios([]);
                                }
                                setFormData(prev => ({...prev, agenda}));
                            }}
                            options={agendasQuery.data || []}
                            getOptionLabel={(a) => a.descricao}
                            getOptionValue={(a) => a.id}
                            required
                            placeholder="Selecione a agenda"
                        />
                        <div className="legenda-blue" style={{marginLeft: '10px', fontSize: '12px'}}>
                            Feriado
                        </div>
                        <div style={{marginLeft: '10px'}}>
                            {selectedAgendaId && agendasQuery.data?.find(a => a.id === selectedAgendaId)?.status && agendasQuery.data.find(a => a.id === selectedAgendaId).status.length > 0 && (
                                <div>
                                    {agendasQuery.data.find(a => a.id === selectedAgendaId).status.map((s, i) => (
                                        <span key={i} style={{display: 'inline-block', width: 'auto', marginRight: '5px', fontSize: '11px', borderRadius: '3px', padding: '2px 6px', color: '#fff', backgroundColor: s.cor}}>
                                            {s.descricao}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="header-actions">
                        <select
                            className="view-mode-select"
                            value={viewMode}
                            onChange={(e) => setViewMode(e.target.value as ViewMode)}
                        >
                            <option value="calendar">📅 Calendário</option>
                            <option value="list">📋 Lista</option>
                        </select>
                        <button className="btn btn-primary" onClick={openCreateForm}>
                            + Novo Compromisso
                        </button>
                    </div>
                </div>

                <div className="filters-bar">
                    <div className="filter-group">
                        <label>Unidade</label>
                        <select
                            value={selectedUnidadeId}
                            onChange={(e) => setSelectedUnidadeId(Number(e.target.value) || '')}
                            disabled={unidadesQuery.isLoading}
                        >
                            <option value="">Todas</option>
                            {unidadesQuery.data?.map(u => (
                                <option key={u.id} value={u.id}>
                                    {u.sucinto} - {u.nomeFantasia}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="filter-group search-group">
                        <label>Buscar</label>
                        <input
                            type="text"
                            placeholder="Buscar por descrição, pessoa, agenda, status..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="search-input"
                        />
                    </div>

{viewMode === 'calendar' && (
                        <div className="filter-group">
                            <label>Semana</label>
                            <div className="week-nav">
                                <button onClick={() => setWeekStart(toIsoDate(addDays(parseDate(weekStart), -7)))}>‹ Anterior</button>
                                <span>{formatDateBR(weekStart)} - {formatDateBR(toIsoDate(addDays(parseDate(weekStart), 6)))}</span>
                                <button onClick={() => setWeekStart(toIsoDate(addDays(parseDate(weekStart), 7)))}>Próximo ›</button>
                                <button onClick={() => setWeekStart(toIsoDate(mondayOf(new Date())))} className="btn-today">Hoje</button>
                            </div>
                        </div>
                    )}
                </div>

                {viewMode === 'calendar' ? (
                    <div className="calendar-view">
                        {selectedAgendaId ? (
                            <ScheduleWeekView
                                startDate={weekStart}
                                onWeekChange={setWeekStart}
                                events={eventosQuery.data ?? []}
                                loading={eventosQuery.isLoading}
                                error={eventosQuery.isError ? 'Erro ao carregar a agenda.' : null}
                                legend={LEGENDA}
                                onEventClick={handleEventClick}
                                onDateSelect={handleDateSelect}
                            />
                        ) : (
                            <div className="empty-state">
                                <p>Selecione uma agenda para visualizar o calendário.</p>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="list-view">
                        <DataTable
                            columns={COLUMNS}
                            data={filteredCompromissos}
                            loading={compromissosQuery.isLoading}
                            error={compromissosQuery.isError ? 'Erro ao carregar compromissos.' : null}
                            onRowClick={handleRowClick}
                            rowActions={[
                                {label: 'Ver detalhes', icon: '👁', onClick: handleRowClick, variant: 'primary'},
                                {label: 'Editar', icon: '✏️', onClick: openEditForm, variant: 'secondary', disabled: (c) => !c.ativo},
                                {label: 'Próximo Status', icon: '➡️', onClick: handleOpenNextStatus, variant: 'success', disabled: (c) => !c.ativo || !c.statusCompromisso?.proxStatusCompromisso},
                                {label: 'Trocar Status', icon: '🔄', onClick: handleOpenChangeStatus, variant: 'warning', disabled: (c) => !c.ativo},
                                {label: 'Fechar', icon: '❌', onClick: handleOpenCloseCompromisso, variant: 'danger', disabled: (c) => !c.ativo},
                            ]}
                            expandableRows
                            renderExpandedRow={(compromisso) => (
                                <div className="expanded-row">
                                    <h4>Histórico de Status</h4>
                                    {compromisso.compromissoStatusUsuarios && compromisso.compromissoStatusUsuarios.length > 0 ? (
                                        <table className="history-table">
                                            <thead>
                                                <tr>
                                                    <th>Usuário</th>
                                                    <th>Pessoa</th>
                                                    <th>Data</th>
                                                    <th>Status Anterior</th>
                                                    <th>Status Próximo</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {compromisso.compromissoStatusUsuarios.map((h, i) => (
                                                    <tr key={i}>
                                                        <td>{h.usuario?.pessoaFisica?.nome}</td>
                                                        <td>{h.pessoa?.pessoaFisica?.nome}</td>
                                                        <td>{formatDateBR(h.data)}</td>
                                                        <td><span className={`status-badge ${h.statusCompromissoAnterior.cor}`}>{h.statusCompromissoAnterior.descricao}</span></td>
                                                        <td><span className={`status-badge ${h.statusCompromissoProximo.cor}`}>{h.statusCompromissoProximo.descricao}</span></td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    ) : (
                                        <p className="no-history">Sem histórico de alterações.</p>
                                    )}
                                    {compromisso.observacao && (
                                        <div className="observacao">
                                            <strong>Observação:</strong> {compromisso.observacao}
                                        </div>
                                    )}
                                    {compromisso.resultados && compromisso.resultados.length > 0 && (
                                        <div className="resultados">
                                            <strong>Resultados:</strong>
                                            <ul>
                                                {compromisso.resultados.map((r, i) => (
                                                    <li key={i}>{r.descricao}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            )}
                        />
                    </div>
                )}

                {showDetails && selectedCompromisso && (
                    <Modal
                        title={`Compromisso #${selectedCompromisso.id} - Detalhes`}
                        open={showDetails}
                        onClose={() => setShowDetails(false)}
                        size="lg"
                    >
                        <h:form id="formCompromissoAgenda">
                            <p:growl autoUpdate="true" showDetail="true" sticky="true" life="50000" edisplay="true" globalOnly="true"
                                     escape="false"/>

                            <pe:blockUI target="mainForm" widgetVar="blockUIdetalheCompromisso">
                                <h:panelGrid styleClass="semBorda" style="vertical-align: top" columns="2">
                                    Carregando detalhes compromisso, aguarde...
                                    <h:graphicImage value="/resources/images/ajaxloading.gif"/>
                                </h:panelGrid>
                            </pe:blockUI>

                            <p:dataTable var="comp" rendered="#{calendarioAgendaController.tipoEvento eq false}"
                                         rowsPerPageTemplate="10,15" rows="10"
                                         value="#{calendarioAgendaController.compromissos}" emptyMessage="" paginator="true"
                                         paginatorPosition="bottom"
                                         paginatorTemplate="{FirstPageLink} {PreviousPageLink} {PageLinks} {NextPageLink} {LastPageLink} {RowsPerPageDropdown}">

                                <p:ajax event="rowToggle" listener="#{calendarioAgendaController.buscarDetalhes}"
                                        update="detalhesCompromiso"
                                        onstart="test();PF('blockUIdetalheCompromisso').block();"
                                        oncomplete="PF('blockUIdetalheCompromisso').unblock();"/>

                                <p:column exportable="false" style="width:5%">
                                    <p:rowToggler/>
                                </p:column>

                                <p:column style="width:10%" headerText="#{msg['entity.id']}">
                                    <h:outputText value="#{comp.id}"/>
                                </p:column>

                                <p:column style="width: 15%" headerText="#{msg['entity.visitante']}">
                                    <h:outputText value="#{comp.descricao}"/>
                                </p:column>

                                <p:column style="width: 10%" headerText="#{msg['entity.horario']}">
                                    <h:outputText value="#{comp.horario.hora}"/>
                                </p:column>

                                <p:column style="width: 15%" headerText="#{msg['entity.usuario']}">
                                    <h:outputText value="#{comp.usuario.login}"/>
                                </p:column>

                                <p:column style="width: 15%" headerText="#{msg['entity.atendente']}">
                                    <h:outputText value="#{comp.atendente.login}"/>
                                </p:column>

                                <p:column style="width: 15%" headerText="Finalizou">
                                    <h:outputText value="#{comp.usuarioFinalizou.login}"/>
                                </p:column>

                                <p:column style="width:200px; text-align: right;" exportable="false">
                                    <p:commandButton id="chartBtnobservacao" type="button" style="float: right; z-index:100"
                                                     title="#{msg['entity.observacao']}"
                                                     styleClass="btnyellow" icon="ui-icon-help"
                                     rendered="#{comp.observacao ne null and comp.observacao ne ''}"/>
                                    <p:overlayPanel id="chartPanelobservacao" for="chartBtnobservacao" hideEffect="fade">
                                        <p:scrollPanel mode="native" style="width:200px;height:200px">
                                            <h:outputText style="white-space:normal !important" escape="false"
                                                          value="#{comp.observacao}"/>
                                        </p:scrollPanel>
                                    </p:overlayPanel>

                                    <p:commandButton icon="ui-icon-search" title="#{msg['button.compromisso.view']}"
                                     rendered="#{compromissoController.verificaResultados(comp)}"
                                     actionListener="#{compromissoController.setEntity(comp)}"
                                     styleClass="btnyellow"
                                     oncomplete="PF('detailView2').show();" update=":poolForm:detailView2">
                                        <f:setPropertyActionListener value="#{calendarioAgendaController.agenda}"
                                                     target="#{compromissoController.agenda}"/>
                                    </p:commandButton>

                                    <p:commandButton icon="ui-icon-newwin" title="#{msg['button.compromisso.prospecto']}"
                                     actionListener="#{compromissoController.carregarProspectoParaVisualizacao(comp)}"
                                     rendered="#{comp.ativo eq true and comp.prospecto ne null}"
                                     styleClass="btnstop"
                                     oncomplete="PF('detailProspecto').show();" update=":poolForm:detailProspecto">
                                        <f:setPropertyActionListener value="#{calendarioAgendaController.agenda}"
                                                     target="#{compromissoController.agenda}"/>
                                    </p:commandButton>

                                    <p:commandButton icon="ui-icon-transferthick-e-w" styleClass="btnorange"
                                     rendered="#{comp.ativo eq true and calendarioAgendaController.usuarioAgenda.alterar}"
                                     title="Troca de Stratus Compromisso" onsuccess="PF('trocaStatus').show();"
                                     update=":formtrocaStatus" style="margin-left: 5px;">
                                        <f:setPropertyActionListener value="#{comp}" target="#{compromissoController.entity}"/>
                                        <f:setPropertyActionListener value="#{comp.statusCompromisso}"
                                                     target="#{compromissoController.statusCompromisso}"/>
                                        <f:setPropertyActionListener value="#{calendarioAgendaController.agenda}"
                                                     target="#{compromissoController.agenda}"/>
                                    </p:commandButton>

                                    <p:commandButton
                                        title="Mudar #{comp.statusCompromisso.descricao} para #{comp.statusCompromisso.proxStatusCompromisso.descricao}"
                                        update=":formproximoStatus" oncomplete="PF('proximoStatus').show();"
                                        icon="ui-icon-transfer-2-e"
                                        action="#{compromissoController.obterCompromissoSchedule(comp)}"
                                        rendered="#{comp.ativo eq true and calendarioAgendaController.usuarioAgenda.atender and
                                              comp.statusCompromisso.proxStatusCompromisso ne null}" styleClass="btngreen">
                                        <f:setPropertyActionListener value="#{calendarioAgendaController.agenda}"
                                                     target="#{compromissoController.agenda}"/>
                                    </p:commandButton>

                                    <p:commandButton update=":formfecharCompromisso" oncomplete="PF('fecharCopromisso').show();"
                                                     icon="ui-icon-close"
                                     rendered="#{comp.id eq calendarioAgendaController.usuarioAgenda.usuario.id and calendarioAgendaController.usuarioAgenda.fechar and comp.ativo eq true }">
                                        <f:setPropertyActionListener value="#{comp}" target="#{compromissoController.entity}"
                                         styleClass="btnblack"/>
                                        <f:setPropertyActionListener value="#{calendarioAgendaController.agenda}"
                                                     target="#{compromissoController.agenda}"/>
                                    </p:commandButton>
                                </p:column>

                                <p:rowExpansion>
                                    <p:dataTable id="detalhesCompromiso" var="detalhesCompromiso"
                                                 value="#{calendarioAgendaController.compromissoPessoaStatuses}"
                                                 emptyMessage="#{msg['global.nenhumRegistro']}">
                                        <p:column style="width: 20%" headerText="#{msg['entity.usuario']} alterou">
                                            <h:outputText value="#{detalhesCompromiso.usuario.pessoaFisica.nome}"/>
                                        </p:column>

                                        <p:column style="width: 15%"
                                              headerText="#{msg['entity.descricao']}  #{msg['entity.pessoa']}">
                                            <h:outputText value="#{detalhesCompromiso.statusCompromissoAnterior.descricaoPessoa}"/>
                                        </p:column>

                                        <p:column style="width: 20%" headerText="#{msg['entity.usuario']} destino">
                                            <h:outputText value="#{detalhesCompromiso.pessoa.pessoaFisica.nome}"/>
                                        </p:column>

                                        <p:column style="width: 15%" headerText="#{msg['entity.data']}">
                                            <h:outputText value="#{detalhesCompromiso.data}">
                                                <f:convertDateTime pattern="dd/MM/yyyy" locale="pt" timeZone="America/Sao_Paulo"/>
                                            </h:outputText>
                                        </p:column>

                                        <p:column style="width: 15%" headerText="#{msg['entity.statusAnterior']}">
                                            <h:outputText value="#{detalhesCompromiso.statusCompromissoAnterior.descricao}"
                                                          styleClass="#{detalhesCompromiso.statusCompromissoAnterior.cor}"/>
                                        </p:column>

                                        <p:column style="width: 15%" headerText="#{msg['entity.statusSeguinte']} anterior">
                                            <h:outputText value="#{detalhesCompromiso.statusCompromissoProximo.descricao}"
                                                          styleClass="#{detalhesCompromiso.statusCompromissoProximo.cor}"/>
                                        </p:column>
                                    </p:dataTable>
                                </p:rowExpansion>
                            </p:dataTable>

                            <p:panel style="text-align: center;border: none"
                                     rendered="#{calendarioAgendaController.tipoEvento eq true}">
                                <p:outputLabel value="Feriado: #{calendarioAgendaController.descricaoCompromisso}"/>
                                <br/>
                                <br/>
                                <p:commandButton value="OK" onclick="PF('telaCompromissoDialogo').hide();" immediate="true"
                                                 type="button"/>
                            </p:panel>
                        </h:form>
                    </Modal>
                )}

                {showForm && (
                    <Modal
                        title={isEditing ? 'Editar Compromisso' : 'Novo Compromisso'}
                        open={showForm}
                        onClose={() => { setShowForm(false); setFormData({}); setIsEditing(false); }}
                        size="lg"
                    >
                        <form onSubmit={(e) => { e.preventDefault(); isEditing ? updateCompromissoMutation.mutate(formData as any) : createCompromissoMutation.mutate(formData); }} className="form-compromisso">
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Agenda *</label>
                                    <AutoComplete
                                        value={formData.agenda}
                                        onChange={handleAgendaChange}
                                        options={agendasQuery.data || []}
                                        getOptionLabel={(a) => a.descricao}
                                        getOptionValue={(a) => a.id}
                                        required
                                        placeholder="Selecione a agenda"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Data *</label>
                                    <input
                                        type="text"
                                        value={formData.data ? formatDateBR(formData.data) : ''}
                                        onChange={(e) => {
                                            const dateStr = e.target.value.trim();
                                            if (!dateStr) {
                                                setFormData(prev => ({...prev, data: ''}));
                                                 return;
                                            }
                                            const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateStr);
                                            if (!match) return;
                                            const date = new Date(`${match[1]}-${match[2]}-${match[3]}`);
                                            if (isNaN(date.getTime())) return;
                                            const formatted = `${match[3]}/${match[2]}/${match[1]}`;
                                            setFormData(prev => ({...prev, data: formatted}));
                                            
                                            if (formData.agenda?.id) {
                                                loadHorarios(formData.agenda.id, formatted, formTipoHorario);
                                            }
                                        }}
                                        required
                                    />
                                    <small className="form-hint">Formato: dd/MM/yyyy</small>
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Tipo de Horário</label>
                                    <div className="radio-group">
                                        <label><input type="radio" name="tipoHorario" value="unidade" checked={formTipoHorario === 'unidade'} onChange={() => handleTipoHorarioChange('unidade')} /> Unidade</label>
                                        <label><input type="radio" name="tipoHorario" value="pessoa" checked={formTipoHorario === 'pessoa'} onChange={() => handleTipoHorarioChange('pessoa')} /> Pessoa</label>
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Horário *</label>
                                    <select
                                        value={formData.horario?.id || ''}
                                        onChange={(e) => setFormData(prev => ({...prev, horario: formHorarios.find(h => h.id === Number(e.target.value))}))}
                                        required
                                        disabled={formHorarios.length === 0}
                                    >
                                        <option value="">Selecione um horário</option>
                                        {formHorarios.map(h => (
                                            <option key={h.id} value={h.id}>{h.hora}</option>
                                        ))}
                                    </select>
                                    {formHorarios.length === 0 && <span className="form-hint">Selecione agenda e data para carregar horários</span>}
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Tipo de Compromisso</label>
                                    <select
                                        value={formData.tipoCompromisso?.id || ''}
                                        onChange={(e) => {
                                            const tipo = tiposCompromisso.find(t => t.id === Number(e.target.value));
                                            setFormData(prev => ({...prev, tipoCompromisso: tipo}));
                                        }}
                                    >
                                        <option value="">Selecione o tipo</option>
                                        {tiposCompromisso.map(t => (
                                            <option key={t.id} value={t.id}>{t.descricao}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Pessoa</label>
                                    <AutoComplete
                                        value={formData.pessoa ? {id: formData.pessoa.id, label: getPessoaNome(formData.pessoa)} : null}
                                        onChange={(opt) => {
                                            const pessoa = pessoasOptions.find(p => p.id === opt?.id);
                                            setFormData(prev => ({...prev, pessoa: pessoa || null}));
                                        }}
                                        fetchOptions={async (query) => {
                                            if (!query) return pessoasOptions.slice(0, 20).map(p => ({id: p.id, label: getPessoaNome(p)}));
                                            return pessoasOptions.filter(p => getPessoaNome(p).toLowerCase().includes(query.toLowerCase())).slice(0, 20).map(p => ({id: p.id, label: getPessoaNome(p)}));
                                        }}
                                        fetchById={async (id) => {
                                            const p = pessoasOptions.find(p => p.id === id);
                                            return p ? {id: p.id, label: getPessoaNome(p)} : null;
                                        }}
                                        minChars={2}
                                        placeholder="Buscar pessoa..."
                                    />
                                </div>
                            </div>

                            <div className="form-group full-width">
                                <label>Descrição / Visitante *</label>
                                <input
                                    type="text"
                                    value={formData.descricao || ''}
                                    onChange={(e) => setFormData(prev => ({...prev, descricao: e.target.value}))}
                                    required
                                    placeholder="Descrição do compromisso ou nome do visitante"
                                />
                            </div>

                            <div className="form-group full-width">
                                <label>Observação</label>
                                <textarea
                                    value={formData.observacao || ''}
                                    onChange={(e) => setFormData(prev => ({...prev, observacao: e.target.value}))}
                                    rows={3}
                                    placeholder="Observações adicionais..."
                                />
                            </div>

                            <div className="form-actions">
                                <button type="button" className="btn btn-secondary" onClick={() => { setShowForm(false); setFormData({}); setIsEditing(false); }}>Cancelar</button>
                                <button type="submit" className="btn btn-primary" disabled={createCompromissoMutation.isPending || updateCompromissoMutation.isPending}>
                                    {isEditing ? 'Salvar' : 'Criar'}
                                </button>
                            </div>
                        </form>
                    </Modal>
                )}

                {showChangeStatus && selectedCompromisso && (
                    <Modal
                        title={`Trocar Status - Compromisso #${selectedCompromisso.id}`}
                        open={showChangeStatus}
                        onClose={() => setShowChangeStatus(false)}
                        size="md"
                    >
                        <h:form id="formtrocaStatus">
                            <p:growl autoUpdate="true" showDetail="true" sticky="true" life="50000" edisplay="true" globalOnly="true"
                                     escape="false"/>

                            <p:outputLabel
                                    value="#{msg['alterstatus.compromisso.compromisso']} #{compromissoController.entity.id} ?"
                                    rendered="#{compromissoController.entity.statusCompromisso.alguem eq true}"/>
                            <br/>
                            <p:outputLabel
                                    value="#{msg['alterstatus.compromisso.compromisso']} #{compromissoController.entity.id} ?"
                                    rendered="#{compromissoController.entity.statusCompromisso.alguem eq false}"/>

                            <p:separator style="width: 99%"
                                         rendered="#{compromissoController.entity.statusCompromisso.alguem eq true}"/>

                            <h:panelGrid columns="5">
                                <c:forEach var="imageName" items="#{compromissoController.entity.statusCompromisso.statusModulos}">
                                    <p:commandButton value="#{imageName.modulo.rotulo}" icon="#{imageName.modulo.icone}"
                                     ajax="false"
                                     action="#{compromissoController.acessoUrl(imageName.modulo.outcome)}"
                                     styleClass="#{imageName.cor}"/>

                                </c:forEach>
                            </h:panelGrid>
                            <br/>
                            <p:outputLabel for="atendente" value="#{compromissoController.entity.statusCompromisso.descricaoPessoa}"
                                           style="margin-right: 2px"
                                           rendered="#{compromissoController.entity.statusCompromisso.alguem eq true}"/>
                            <p:autoComplete id="atendente" required="true"
                                            rendered="#{compromissoController.entity.statusCompromisso.alguem eq true}"
                                            scrollHeight="300" forceSelection="true"
                                            completeMethod="#{compromissoController.autoCompleteComUnidadeDiaSemana}"
                                            value="#{compromissoController.entity.atendente}" var="entity"
                                            itemValue="#{entity}" itemLabel="#{entity.login}" converter="#{usuarioConverter}"
                                            dropdown="true"/>
                            <br/><br/><br/>

                            <p:dataList value="#{compromissoController.entity.compromissoStatusUsuarios}" var="comStaUsu"
                                        rendered="#{compromissoController.entity.statusCompromisso.alguem eq true and compromissoController.entity.compromissoStatusUsuarios.size() ne 0}"
                                        type="ordered">
                                <f:facet name="header">
                                    Testemunhas
                                </f:facet>
                                <p:autoComplete required="true" scrollHeight="300" forceSelection="true"
                                                completeMethod="#{compromissoController.autoCompleteComUnidadeDiaSemana}"
                                                value="#{comStaUsu.usuario}" var="entity" dropdown="true"
                                                itemValue="#{entity}" itemLabel="#{entity.login}" converter="#{usuario}"/>
                            </p:dataList>

                            <br/>
                            <br/>
                            <br/>

                            <p:panelGrid columns="1" styleClass="div_form" style="width: 30%;"
                                         rendered="#{compromissoController.apresentarLancamento(compromissoController.entity.statusCompromisso)}">
                                <f:facet name="header">
                                    <p:outputLabel/>
                                </f:facet>

                                <h:panelGrid columns="2" styleClass="table_form">
                                    <p:outputLabel for="inputObservacao" value="#{msg['entity.observacao']}"/>
                                    <p:inputTextarea id="inputObservacao" value="#{compromissoController.entity.observacao}"
                                     rows="3" cols="65"/>
                                </h:panelGrid>

                                <h:panelGrid id="resultados_fields" columns="3" styleClass="table_form">
                                    <p:outputLabel value="#{msg['entity.resultado']}"/>
                                    <p:selectOneMenu id="inputResultado" styleClass="inputLarge"
                                     value="#{compromissoController.resultadoSelecionado}"
                                     converter="#{resultadoConverter}">
                                        <f:selectItem itemLabel="Selecione" itemValue=""/>
                                        <f:selectItems var="entity" itemValue="#{entity}" itemLabel="#{entity.descricao}"
                                                     value="#{compromissoController.listaResultadosDisponiveis}"/>
                                    </p:selectOneMenu>

                                    <p:commandButton id="btn_add" icon="ui-icon-plus"
                                     update="resultadosPanel resultados_fields :mainForm"
                                     process="resultados_fields" action="#{compromissoController.reinit}">
                                        <p:collector value="#{compromissoController.resultadoSelecionado}"
                                     addTo="#{compromissoController.listaResultados}" unique="true"/>
                                    </p:commandButton>
                                </h:panelGrid>

                                <p:outputPanel id="resultadosPanel">
                                    <p:dataTable value="#{compromissoController.listaResultados}" var="entity"
                                                 emptyMessage="#{msg['global.nenhumRegistroSelecionado']}">

                                        <ui:include src="#{resultadoController.colunas}"/>

                                        <p:column style="width:40px;">
                                            <p:commandButton id="btn_rem" immediate="true" styleClass="btnred" icon="ui-icon-minus"
                                             update="inputResultados:resultadosPanel"
                                             actionListener="#{compromissoController.remove(entity)}"
                                             process="inputResultados:resultadosPanel" ajax="false"/>
                                        </p:column>
                                    </p:dataTable>
                                </p:outputPanel>

                                <f:facet name="footer">
                                    <p:commandButton
                                        rendered="#{compromissoController.venda() eq false and not empty compromissoController.listaResultados}"
                                        id="finalizar" icon="ui-icon-check"
                                        action="#{compromissoController.finalizarCompromisso}"
                                        value="#{msg['button.finalizarAtendimento']}" ajax="false"/>
                                    <p:commandButton
                                        rendered="#{compromissoController.venda() eq false and not empty compromissoController.listaResultados}"
                                        icon="ui-icon-arrowthick-1-w" value="#{msg['button.back']}" ajax="false"
                                        action="/default"/>
                                </f:facet>
                            </p:panelGrid>
                        </h:form>
                    </Modal>
                )}

                {showCloseCompromisso && selectedCompromisso && (
                    <Modal
                        title={`Fechar Compromisso #${selectedCompromisso.id}`}
                        open={showCloseCompromisso}
                        onClose={() => setShowCloseCompromisso(false)}
                        size="md"
                    >
                        <h:form id="formfecharCompromisso">
                            <p:growl autoUpdate="true" showDetail="true" sticky="true" life="50000" edisplay="true" globalOnly="true"
                                     escape="false"/>

                            <p:outputLabel value="#{msg['close.compromisso.compromisso']} #{compromissoController.entity.id} ?"/>
                            <br/>
                            <br/>
                            <p:panelGrid columns="2" styleClass="semBorda2" style="width: 99%">
                                <f:facet name="header">
                                    <p:commandButton value="#{msg['button.dialog.yes']}" styleClass="btnblue"
                                     onsuccess="PF('fecharCopromisso').hide();" ajax="true"
                                     update=":formCompromissoAgenda"
                                     actionListener="#{compromissoController.fecharAgenda(compromissoController.entity)}">
                                        <f:setPropertyActionListener value="#{true}"
                                                     target="#{calendarioAgendaController.alterado}"/>
                                    </p:commandButton>
                                    <p:commandButton value="#{msg['button.dialog.no']}" onclick="PF('fecharCopromisso').hide();"
                                     styleClass="btnred" type="button"/>
                                </f:facet>
                            </p:panelGrid>
                        </h:form>
                    </Modal>
                )}

                {showNextStatus && selectedCompromisso && (
                    <Modal
                        title={`Próximo Status - Compromisso #${selectedCompromisso.id}`}
                        open={showNextStatus}
                        onClose={() => setShowNextStatus(false)}
                        size="lg"
                    >
                        <h:form id="formproximoStatus">
                            <p:growl autoUpdate="true" showDetail="true" sticky="true" life="50000" edisplay="true" globalOnly="true"
                                     escape="false"/>

                            <p:outputLabel value="#{msg['confirm.compromisso.compromisso']} #{compromissoController.entity.id} ?"
                                           rendered="#{compromissoController.entity.statusCompromisso.alguem eq true}"/>
                            <br/>
                            <p:outputLabel
                                    value="#{msg['alterstatus.compromisso.compromisso']} #{compromissoController.entity.id} ?"
                                    rendered="#{compromissoController.entity.statusCompromisso.alguem eq false}"/>

                            <p:separator style="width: 99%"
                                         rendered="#{compromissoController.entity.statusCompromisso.alguem eq true}"/>

                            <h:panelGrid columns="5">
                                <c:forEach var="imageName" items="#{compromissoController.entity.statusCompromisso.statusModulos}">
                                    <p:commandButton value="#{imageName.modulo.rotulo}" icon="#{imageName.modulo.icone}"
                                     ajax="false"
                                     action="#{compromissoController.acessoUrl(imageName.modulo.outcome)}"
                                     styleClass="#{imageName.cor}"/>

                                </c:forEach>
                            </h:panelGrid>
                            <br/>
                            <p:outputLabel for="atendente" value="#{compromissoController.entity.statusCompromisso.descricaoPessoa}"
                                           style="margin-right: 2px"
                                           rendered="#{compromissoController.entity.statusCompromisso.alguem eq true}"/>
                            <p:autoComplete id="atendente" required="true"
                                            rendered="#{compromissoController.entity.statusCompromisso.alguem eq true}"
                                            scrollHeight="300" forceSelection="true"
                                            completeMethod="#{compromissoController.autoCompleteComUnidadeDiaSemana}"
                                            value="#{compromissoController.entity.atendente}" var="entity"
                                            itemValue="#{entity}" itemLabel="#{entity.login}" converter="#{usuarioConverter}"
                                            dropdown="true"/>
                            <br/><br/><br/>

                            <p:dataList value="#{compromissoController.entity.compromissoStatusUsuarios}" var="comStaUsu"
                                        rendered="#{compromissoController.entity.statusCompromisso.alguem eq true and compromissoController.entity.compromissoStatusUsuarios.size() ne 0}"
                                        type="ordered">
                                <f:facet name="header">
                                    Testemunhas
                                </f:facet>
                                <p:autoComplete required="true" scrollHeight="300" forceSelection="true"
                                                completeMethod="#{compromissoController.autoCompleteComUnidadeDiaSemana}"
                                                value="#{comStaUsu.usuario}" var="entity" dropdown="true"
                                                itemValue="#{entity}" itemLabel="#{entity.login}" converter="#{usuario}"/>
                            </p:dataList>

                            <br/>
                            <br/>
                            <br/>

                            <p:panelGrid columns="1" styleClass="div_form" style="width: 30%;"
                                         rendered="#{compromissoController.apresentarLancamento(compromissoController.entity.statusCompromisso)}">
                                <f:facet name="header">
                                    <p:outputLabel/>
                                </f:facet>

                                <h:panelGrid columns="2" styleClass="table_form">
                                    <p:outputLabel for="inputObservacao" value="#{msg['entity.observacao']}"/>
                                    <p:inputTextarea id="inputObservacao" value="#{compromissoController.entity.observacao}"
                                     rows="3" cols="65"/>
                                </h:panelGrid>

                                <h:panelGrid id="resultados_fields" columns="3" styleClass="table_form">
                                    <p:outputLabel value="#{msg['entity.resultado']}"/>
                                    <p:selectOneMenu id="inputResultado" styleClass="inputLarge"
                                     value="#{compromissoController.resultadoSelecionado}"
                                     converter="#{resultadoConverter}">
                                        <f:selectItem itemLabel="Selecione" itemValue=""/>
                                        <f:selectItems var="entity" itemValue="#{entity}" itemLabel="#{entity.descricao}"
                                                     value="#{compromissoController.listaResultadosDisponiveis}"/>
                                    </p:selectOneMenu>

                                    <p:commandButton id="btn_add" icon="ui-icon-plus"
                                     update="resultadosPanel resultados_fields :mainForm"
                                     process="resultados_fields" action="#{compromissoController.reinit}">
                                        <p:collector value="#{compromissoController.resultadoSelecionado}"
                                     addTo="#{compromissoController.listaResultados}" unique="true"/>
                                    </p:commandButton>
                                </h:panelGrid>

                                <p:outputPanel id="resultadosPanel">
                                    <p:dataTable value="#{compromissoController.listaResultados}" var="entity"
                                 emptyMessage="#{msg['global.nenhumRegistroSelecionado']}">

                                        <ui:include src="#{resultadoController.colunas}"/>

                                        <p:column style="width:40px;">
                                            <p:commandButton id="btn_rem" immediate="true" styleClass="btnred" icon="ui-icon-minus"
                                             update="inputResultados:resultadosPanel"
                                             actionListener="#{compromissoController.remove(entity)}"
                                             process="inputResultados:resultadosPanel" ajax="false"/>
                                        </p:column>
                                    </p:dataTable>
                                </p:outputPanel>

                                <f:facet name="footer">
                                    <p:commandButton
                                        rendered="#{compromissoController.venda() eq false and not empty compromissoController.listaResultados}"
                                        id="finalizar" icon="ui-icon-check"
                                        action="#{compromissoController.finalizarCompromisso}"
                                        value="#{msg['button.finalizarAtendimento']}" ajax="false"/>
                                    <p:commandButton
                                        rendered="#{compromissoController.venda() eq false and not empty compromissoController.listaResultados}"
                                        icon="ui-icon-arrowthick-1-w" value="#{msg['button.back']}" ajax="false"
                                        action="/default"/>
                                </f:facet>
                            </p:panelGrid>
                        </h:form>
                    </Modal>
                )}

            </main>
        </PermissionGate>
    );
}

function statusModuloToStatus(sm?: StatusModulo): StatusCompromisso | undefined {
    if (!sm) return undefined;
    return {
        id: sm.modulo.id,
        descricao: sm.modulo.rotulo,
        cor: sm.cor,
        alguem: false,
        trocaautomatomatica: false,
        dias: 0,
        descricaoPessoa: '',
        qtdeUsuario: 0,
        statusModulos: [],
    };
}
