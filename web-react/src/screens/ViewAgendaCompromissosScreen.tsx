import {useState, useCallback, useMemo} from 'react';
import {useQuery, useMutation, useQueryClient} from '@tanstack/react-query';
import {api} from '../api';
import {PermissionGate} from '../permissions';
import {ScheduleWeekView, mondayOf, toIsoDate, type ScheduleEventData} from '../WeeklyGrid';
import {DataTable, type DataTableColumn} from '../DataTable';
import {Tabs} from '../Tabs';
import {Modal} from '../Modal';
import {AutoComplete} from '../AutoComplete';
import {Modal} from '../Modal';
import {format} from 'date-fns';
import '../Disponibilidade.css';
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
            const params: Record<string, any> = {inicio: weekStart, fim: toIsoDate(new Date(weekStart + 'T00:00:00').getTime() + 6 * 86400000)};
            if (selectedAgendaId) params.agendaId = selectedAgendaId;
            const response = await api.get<Compromisso[]>('/api/view/compromisso/listCompromisso', {params});
            return response.data;
        },
        enabled: viewMode === 'list' || !!selectedAgendaId,
    });

    const eventosQuery = useQuery({
        queryKey: ['compromissos-eventos', selectedAgendaId, weekStart],
        queryFn: async () => {
            const params: Record<string, any> = {inicio: weekStart, fim: toIsoDate(new Date(weekStart + 'T00:00:00').getTime() + 6 * 86400000)};
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

    const handleDateChange = useCallback((data: string) => {
        if (formData.agenda?.id) {
            loadHorarios(formData.agenda.id, data, formTipoHorario);
        }
        setFormData(prev => ({...prev, data}));
    }, [formData.agenda?.id, formTipoHorario, loadHorarios]);

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

                    <div className="filter-group">
                        <label>Agenda</label>
                        <select
                            value={selectedAgendaId}
                            onChange={(e) => setSelectedAgendaId(Number(e.target.value) || '')}
                            disabled={agendasQuery.isLoading}
                        >
                            <option value="">Todas</option>
                            {agendasQuery.data?.map(a => (
                                <option key={a.id} value={a.id}>
                                    {a.descricao} {a.tipoAgenda && `(${a.tipoAgenda.descricao})`}
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
                                <button onClick={() => setWeekStart(toIsoDate(new Date(new Date(weekStart).getTime() - 7 * 86400000)))}>‹ Anterior</button>
                                <span>{formatDateBR(weekStart)} - {formatDateBR(toIsoDate(new Date(weekStart).getTime() + 6 * 86400000))}</span>
                                <button onClick={() => setWeekStart(toIsoDate(new Date(new Date(weekStart).getTime() + 7 * 86400000)))}>Próximo ›</button>
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
                        <div className="details-content">
                            <div className="detail-grid">
                                <div className="detail-item"><label>ID</label><span>{selectedCompromisso.id}</span></div>
                                <div className="detail-item"><label>Descrição</label><span>{selectedCompromisso.descricao}</span></div>
                                <div className="detail-item"><label>Agenda</label><span>{selectedCompromisso.agenda?.descricao}</span></div>
                                <div className="detail-item"><label>Data</label><span>{formatDateBR(selectedCompromisso.data)}</span></div>
                                <div className="detail-item"><label>Horário</label><span>{selectedCompromisso.horario?.hora}</span></div>
                                <div className="detail-item"><label>Pessoa</label><span>{getPessoaNome(selectedCompromisso.pessoa)}</span></div>
                                <div className="detail-item"><label>Tipo Compromisso</label><span>{selectedCompromisso.tipoCompromisso?.descricao}</span></div>
                                <div className="detail-item"><label>Status</label><span><span className={`status-badge ${selectedCompromisso.statusCompromisso?.cor}`}>{selectedCompromisso.statusCompromisso?.descricao}</span></span></div>
                                <div className="detail-item"><label>Agendado por</label><span>{selectedCompromisso.usuario?.login}</span></div>
                                <div className="detail-item"><label>Atendente</label><span>{selectedCompromisso.atendente?.login}</span></div>
                                <div className="detail-item"><label>Finalizado por</label><span>{selectedCompromisso.usuarioFinalizou?.login}</span></div>
                                <div className="detail-item full-width"><label>Observação</label><span>{selectedCompromisso.observacao || '-'}</span></div>
                            </div>

                            {selectedCompromisso.compromissoStatusUsuarios && selectedCompromisso.compromissoStatusUsuarios.length > 0 && (
                                <div className="detail-section">
                                    <h4>Histórico de Alterações de Status</h4>
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
                                            {selectedCompromisso.compromissoStatusUsuarios.map((h, i) => (
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
                                </div>
                            )}

                            {selectedCompromisso.resultados && selectedCompromisso.resultados.length > 0 && (
                                <div className="detail-section">
                                    <h4>Resultados</h4>
                                    <ul>
                                        {selectedCompromisso.resultados.map((r, i) => (
                                            <li key={i}>{r.descricao}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
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
                                        type="date"
                                        value={formData.data || ''}
                                        onChange={(e) => handleDateChange(e.target.value)}
                                        required
                                        min={isEditing ? undefined : format(new Date(), 'yyyy-MM-dd')}
                                        max={formData.agenda?.diasmmaximo && formData.agenda?.qtdediasmaximo
                                            ? format(new Date(new Date().getTime() + formData.agenda.qtdediasmaximo * 86400000), 'yyyy-MM-dd')
                                            : undefined}
                                    />
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
                        <div className="modal-content">
                            <p>Alterar status de <strong>{selectedCompromisso.statusCompromisso?.descricao}</strong> para:</p>
                            <select
                                value={formData.statusCompromisso?.id || ''}
                                onChange={(e) => {
                                    const status = selectedCompromisso.statusCompromisso?.statusModulos?.find(sm => sm.modulo.id === Number(e.target.value));
                                    setFormData(prev => ({...prev, statusCompromisso: statusModuloToStatus(status)}));
                                }}
                            >
                                <option value="">Selecione</option>
                                {selectedCompromisso.statusCompromisso?.statusModulos?.map(sm => (
                                    <option key={sm.modulo.id} value={sm.modulo.id}>{sm.modulo.rotulo}</option>
                                ))}
                            </select>
                            <div className="modal-actions">
                                <button className="btn btn-secondary" onClick={() => setShowChangeStatus(false)}>Cancelar</button>
                                <button className="btn btn-warning" onClick={() => changeStatusMutation.mutate({compromissoId: selectedCompromisso.id!, statusId: formData.statusCompromisso!.id})} disabled={changeStatusMutation.isPending || !formData.statusCompromisso?.id}>
                                    Confirmar Troca
                                </button>
                            </div>
                        </div>
                    </Modal>
                )}

                {showCloseCompromisso && selectedCompromisso && (
                    <Modal
                        title={`Fechar Compromisso #${selectedCompromisso.id}`}
                        open={showCloseCompromisso}
                        onClose={() => setShowCloseCompromisso(false)}
                        size="md"
                    >
                        <div className="modal-content">
                            <p>Tem certeza que deseja fechar o compromisso <strong>#{selectedCompromisso.id} - {selectedCompromisso.descricao}</strong>?</p>
                            <p className="warning">Esta ação não pode ser desfeita. O compromisso será marcado como inativo.</p>
                            <div className="modal-actions">
                                <button className="btn btn-secondary" onClick={() => setShowCloseCompromisso(false)}>Cancelar</button>
                                <button className="btn btn-danger" onClick={() => closeCompromissoMutation.mutate(selectedCompromisso.id!)} disabled={closeCompromissoMutation.isPending}>
                                    Sim, Fechar Compromisso
                                </button>
                            </div>
                        </div>
                    </Modal>
                )}

                {showNextStatus && selectedCompromisso && (
                    <Modal
                        title={`Próximo Status - Compromisso #${selectedCompromisso.id}`}
                        open={showNextStatus}
                        onClose={() => setShowNextStatus(false)}
                        size="lg"
                    >
                        <div className="next-status-wizard">
                            <div className="wizard-header">
                                <p>Status atual: <strong>{selectedCompromisso.statusCompromisso?.descricao}</strong></p>
                                <p>Próximo status: <strong>{selectedCompromisso.statusCompromisso?.proxStatusCompromisso?.descricao}</strong></p>
                                {selectedCompromisso.statusCompromisso?.alguem && (
                                    <p className="requires-attendant">⚠ Este status requer atendente e testemunhas</p>
                                )}
                                {selectedCompromisso.statusCompromisso?.proxStatusCompromisso && (
                                    <p className="requires-resultados">⚠ É necessário adicionar pelo menos um resultado para avançar</p>
                                )}
                            </div>

                            <div className="wizard-section">
                                <h4>Observação</h4>
                                <textarea
                                    value={nextStatusObservacao}
                                    onChange={(e) => setNextStatusObservacao(e.target.value)}
                                    rows={3}
                                    placeholder="Observação para a mudança de status..."
                                />
                            </div>

                            <div className="wizard-section">
                                <h4>Resultados {selectedCompromisso.statusCompromisso?.proxStatusCompromisso ? '(obrigatório)' : ''}</h4>
                                <div className="resultados-manager">
                                    <div className="add-resultado">
                                        <AutoComplete
                                            value={formData.resultadoSelecionado}
                                            onChange={(opt) => setFormData(prev => ({...prev, resultadoSelecionado: opt}))}
                                            fetchOptions={async (query) => {
                                                const resultados = selectedCompromisso.agenda?.resultados || [];
                                                if (!query) return resultados.slice(0, 20).map(r => ({id: r.id, label: r.descricao}));
                                                return resultados.filter(r => r.descricao.toLowerCase().includes(query.toLowerCase())).slice(0, 20).map(r => ({id: r.id, label: r.descricao}));
                                            }}
                                            fetchById={async (id) => {
                                                const r = selectedCompromisso.agenda?.resultados?.find(r => r.id === id);
                                                return r ? {id: r.id, label: r.descricao} : null;
                                            }}
                                            minChars={0}
                                            placeholder="Adicionar resultado..."
                                        />
                                        <button type="button" className="btn btn-sm btn-primary" onClick={() => {
                                            if (formData.resultadoSelecionado && !nextStatusResultados.find(r => r.id === formData.resultadoSelecionado?.id)) {
                                                setNextStatusResultados([...nextStatusResultados, {id: formData.resultadoSelecionado.id, descricao: formData.resultadoSelecionado.label}]);
                                                setFormData(prev => ({...prev, resultadoSelecionado: null}));
                                            }
                                        }} disabled={!formData.resultadoSelecionado}>
                                            +
                                        </button>
                                    </div>
                                    <ul className="resultados-list">
                                        {nextStatusResultados.map((r, i) => (
                                            <li key={i}>
                                                {r.descricao}
                                                <button type="button" className="btn-remove" onClick={() => setNextStatusResultados(nextStatusResultados.filter((_, idx) => idx !== i))}>×</button>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>

                            {selectedCompromisso.statusCompromisso?.alguem && (
                                <div className="wizard-section">
                                    <h4>Atendente (obrigatório)</h4>
                                    <AutoComplete
                                        value={nextStatusAtendente ? {id: nextStatusAtendente.id, label: nextStatusAtendente.login} : null}
                                        onChange={(opt) => setNextStatusAtendente(opt ? usuariosOptions.find(u => u.id === opt.id) || null : null)}
                                        fetchOptions={async (query) => {
                                            if (!query) return usuariosOptions.slice(0, 20).map(u => ({id: u.id, label: u.login}));
                                            return usuariosOptions.filter(u => u.login.toLowerCase().includes(query.toLowerCase())).slice(0, 20).map(u => ({id: u.id, label: u.login}));
                                        }}
                                        fetchById={async (id) => {
                                            const u = usuariosOptions.find(u => u.id === id);
                                            return u ? {id: u.id, label: u.login} : null;
                                        }}
                                        minChars={2}
                                        placeholder="Buscar atendente..."
                                    />
                                </div>
                            )}

                            {selectedCompromisso.statusCompromisso?.alguem && selectedCompromisso.statusCompromisso.qtdeUsuario > 0 && (
                                <div className="wizard-section">
                                    <h4>Testemunhas (mínimo {selectedCompromisso.statusCompromisso.qtdeUsuario})</h4>
                                    <div className="testemunhas-manager">
                                        <AutoComplete
                                            value={formData.testemunhaSelecionada}
                                            onChange={(opt) => setFormData(prev => ({...prev, testemunhaSelecionada: opt}))}
                                            fetchOptions={async (query) => {
                                                if (!query) return usuariosOptions.slice(0, 20).map(u => ({id: u.id, label: u.login}));
                                                return usuariosOptions.filter(u => u.login.toLowerCase().includes(query.toLowerCase())).slice(0, 20).map(u => ({id: u.id, label: u.login}));
                                            }}
                                            fetchById={async (id) => {
                                                const u = usuariosOptions.find(u => u.id === id);
                                                return u ? {id: u.id, label: u.login} : null;
                                            }}
                                            minChars={2}
                                            placeholder="Adicionar testemunha..."
                                        />
                                        <button type="button" className="btn btn-sm btn-primary" onClick={() => {
                                            if (formData.testemunhaSelecionada && !nextStatusTestemunhas.find(t => t.id === formData.testemunhaSelecionada?.id)) {
                                                setNextStatusTestemunhas([...nextStatusTestemunhas, {id: formData.testemunhaSelecionada.id, login: formData.testemunhaSelecionada.label, nome: ''}]);
                                                setFormData(prev => ({...prev, testemunhaSelecionada: null}));
                                            }
                                        }} disabled={!formData.testemunhaSelecionada}>
                                            +
                                        </button>
                                        <ul className="testemunhas-list">
                                            {nextStatusTestemunhas.map((t, i) => (
                                                <li key={i}>
                                                    {t.login}
                                                    <button type="button" className="btn-remove" onClick={() => setNextStatusTestemunhas(nextStatusTestemunhas.filter((_, idx) => idx !== i))}>×</button>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            )}

                            <div className="modal-actions">
                                <button className="btn btn-secondary" onClick={() => setShowNextStatus(false)}>Cancelar</button>
                                <button
                                    className="btn btn-success"
                                    onClick={() => nextStatusMutation.mutate({
                                        compromissoId: selectedCompromisso.id!,
                                        observacao: nextStatusObservacao,
                                        resultadoIds: nextStatusResultados.map(r => r.id),
                                        atendenteId: nextStatusAtendente?.id,
                                        testemunhaIds: nextStatusTestemunhas.map(t => t.id),
                                    })}
                                    disabled={nextStatusMutation.isPending ||
                                        (selectedCompromisso.statusCompromisso?.proxStatusCompromisso && nextStatusResultados.length === 0) ||
                                        (selectedCompromisso.statusCompromisso?.alguem && !nextStatusAtendente) ||
                                        (selectedCompromisso.statusCompromisso?.alguem && selectedCompromisso.statusCompromisso.qtdeUsuario > 0 && nextStatusTestemunhas.length < (selectedCompromisso.statusCompromisso.qtdeUsuario || 0))
                                    }
                                >
                                    Avançar para Próximo Status
                                </button>
                            </div>
                        </div>
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