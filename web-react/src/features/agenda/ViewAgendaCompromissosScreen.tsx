import {useState, useCallback, useMemo} from 'react';
import {useQuery, useMutation, useQueryClient} from '@tanstack/react-query';
import {api} from '../../shared/services/api';
import {PermissionGate} from '../../shared/services/permissions';
import {ScheduleWeekView, mondayOf, toIsoDate, parseDate, addDays, monthRangeForWeek, type ScheduleEventData} from '../../shared/components/WeeklyGrid';
import {DataTable, type DataTableColumn, type DataTableRowAction} from '../../shared/components/DataTable';
import type {ApiItem} from '../../shared/types/types';
import {Tabs} from '../../shared/components/Tabs';
import {Modal} from '../../shared/components/Modal';
import {AutoComplete, type AutoCompleteOption} from '../../shared/components/AutoComplete';
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
    const [selectedPessoa, setSelectedPessoa] = useState<AutoCompleteOption | null>(null);

    const {inicio: rangeInicio, fim: rangeFim} = monthRangeForWeek(weekStart);

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

    const pessoasByUnidadeQuery = useQuery({
        queryKey: ['pessoas-by-unidade', selectedAgendaId],
        queryFn: async () => {
            const agenda = agendasQuery.data?.find(a => a.id === selectedAgendaId);
            if (!agenda?.unidade?.id) return [];
            const response = await api.get<Array<{id: number; nome: string; pessoaFisica?: {nome: string; cpf: string}; pessoaJuridica?: {nomeFantasia: string; cnpj: string}}>>('/api/view/pessoa/listPessoa', {
                params: {unidadeId: agenda.unidade.id}
            });
            return response.data;
        },
        enabled: !!selectedAgendaId && !!agendasQuery.data?.find(a => a.id === selectedAgendaId)?.unidade?.id,
    });

    const fetchPessoaOptions = useCallback(async (query: string): Promise<AutoCompleteOption[]> => {
        const list = pessoasByUnidadeQuery.data || pessoasOptionsQuery.data || [];
        const filtered = query.trim()
            ? list.filter(p => getPessoaNome(p).toLowerCase().includes(query.trim().toLowerCase()))
            : list;
        return filtered.slice(0, 50).map(p => ({id: p.id, label: getPessoaNome(p)}));
    }, [pessoasByUnidadeQuery.data, pessoasOptionsQuery.data]);

    const fetchPessoaById = useCallback(async (id: number): Promise<AutoCompleteOption | null> => {
        const pessoa = (pessoasByUnidadeQuery.data || pessoasOptionsQuery.data || []).find(p => p.id === id);
        return pessoa ? {id: pessoa.id, label: getPessoaNome(pessoa)} : null;
    }, [pessoasByUnidadeQuery.data, pessoasOptionsQuery.data]);

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
        queryKey: ['compromissos-eventos', selectedAgendaId, rangeInicio, rangeFim, selectedPessoa?.id],
        queryFn: async () => {
            const params: Record<string, any> = {inicio: rangeInicio, fim: rangeFim};
            if (selectedAgendaId) params.agendaId = selectedAgendaId;
            if (selectedPessoa?.id) params.pessoaId = selectedPessoa.id;
            const response = await api.get<Compromisso[]>('/api/view/compromisso/listCompromisso', {params});
            return response.data.map(c => ({
                id: c.id,
                title: `${c.horario?.hora || ''} - ${c.descricao} (${getPessoaNome(c.pessoa)})`,
                start: `${c.data}T${c.horario?.hora || '00:00'}`,
                end: `${c.data}T${c.horario?.hora || '00:00'}`,
                allDay: false,
                styleClass: selectedPessoa?.id ? 'evento-green' : getStatusClass(c.statusCompromisso),
                ocorrenciaId: c.id,
            })) as ScheduleEventData[];
        },
        enabled: viewMode === 'calendar',
    });

    const [selectedCompromisso, setSelectedCompromisso] = useState<Compromisso | null>(null);
    type ModalType = 'details' | 'form' | 'changeStatus' | 'closeCompromisso' | 'nextStatus' | null;
    const [openModal, setOpenModal] = useState<ModalType>(null);
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

    const fetchAgendaOptions = useCallback(async (query: string): Promise<AutoCompleteOption[]> => {
        const list = agendasQuery.data || [];
        const filtered = query.trim()
            ? list.filter(a => a.descricao.toLowerCase().includes(query.trim().toLowerCase()))
            : list;
        return filtered.slice(0, 50).map(a => ({id: a.id, label: a.descricao}));
    }, [agendasQuery.data]);

    const fetchAgendaById = useCallback(async (id: number): Promise<AutoCompleteOption | null> => {
        const agenda = (agendasQuery.data || []).find(a => a.id === id);
        return agenda ? {id: agenda.id, label: agenda.descricao} : null;
    }, [agendasQuery.data]);

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
            setOpenModal(null);
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
            setOpenModal(null);
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
            setOpenModal(null);
        },
    });

    const closeCompromissoMutation = useMutation({
        mutationFn: async (compromissoId: number) => {
            await api.put(`/api/basico/compromisso/${compromissoId}/fechar`, {});
        },
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['compromissos']});
            queryClient.invalidateQueries({queryKey: ['compromissos-eventos']});
            setOpenModal(null);
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
            setOpenModal(null);
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
            setOpenModal('details');
        } catch (error) {
            console.error('Erro ao carregar detalhes:', error);
        }
    }, []);

    const openCreateForm = useCallback(() => {
        setFormData({ativo: true});
        setFormHorarios([]);
        setFormTipoHorario('unidade');
        setIsEditing(false);
        setOpenModal('form');
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
        setOpenModal('form');
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
            pessoa: selectedPessoa?.id ? pessoasOptionsQuery.data?.find(p => p.id === selectedPessoa.id) as unknown as Compromisso['pessoa'] : undefined,
        });
        setFormTipoHorario('unidade');
        setIsEditing(false);
        loadHorarios(selectedAgendaId, date, 'unidade');
        setOpenModal('form');
    }, [selectedAgendaId, agendasQuery.data, loadHorarios, selectedPessoa, pessoasOptionsQuery.data]);

    const handleRowClick = useCallback((compromisso: Compromisso) => {
        fetchCompromissoDetails(compromisso.id);
    }, [fetchCompromissoDetails]);

    const handleOpenChangeStatus = useCallback((compromisso: Compromisso) => {
        if (!compromisso.ativo) return;
        setSelectedCompromisso(compromisso);
        setOpenModal('changeStatus');
    }, []);

    const handleOpenCloseCompromisso = useCallback((compromisso: Compromisso) => {
        if (!compromisso.ativo) return;
        setSelectedCompromisso(compromisso);
        setOpenModal('closeCompromisso');
    }, []);

    const handleOpenNextStatus = useCallback((compromisso: Compromisso) => {
        if (!compromisso.ativo || !compromisso.statusCompromisso?.proxStatusCompromisso) return;
        setSelectedCompromisso(compromisso);
        setNextStatusResultados(compromisso.resultados || []);
        setOpenModal('nextStatus');
    }, []);

    const statusOptions = useMemo<StatusCompromisso[]>(() => {
        const statuses = agendasQuery.data?.flatMap(a => a.status || []) || [];
        const unique = new Map(statuses.map(s => [s.descricao, s]));
        return Array.from(unique.values());
    }, [agendasQuery.data]);

    const LEGENDA = useMemo(() => {
        const statuses = agendasQuery.data?.flatMap(a => a.status || []) || [];
        const unique = new Map(statuses.map(s => [s.descricao, s]));
        const base = Array.from(unique.values()).map(s => ({
            className: getStatusClass(s),
            label: s.descricao,
        }));
        if (selectedPessoa?.id) {
            return [{className: 'evento-green', label: `Pessoa: ${selectedPessoa.label}`}, ...base];
        }
        return base;
    }, [agendasQuery.data, selectedPessoa]);

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
        const result = compromissosQuery.data || [];
        if (selectedPessoa?.id) {
            return result.filter(c => c.pessoa?.id === selectedPessoa.id);
        }
        return result;
    }, [compromissosQuery.data, selectedPessoa]);

    const asRecord = (item: ApiItem) => item as unknown as Record<string, any>;
    const asCompromisso = (item: ApiItem) => item as unknown as Compromisso;

    const extraRowActions: DataTableRowAction[] = useMemo(() => [
        {
            key: 'observacao',
            title: 'Observação',
            className: 'btnyellow',
            icon: <i className="fa fa-info-circle"/>,
            visible: (item) => Boolean(asRecord(item).observacao),
            onClick: (item) => handleRowClick(asCompromisso(item)),
        },
        {
            key: 'resultados',
            title: 'Ver Resultados',
            className: 'btnyellow',
            icon: <i className="fa fa-search"/>,
            visible: (item) => Boolean(asRecord(item).resultados?.length),
            onClick: (item) => handleRowClick(asCompromisso(item)),
        },
        {
            key: 'prospecto',
            title: 'Prospecto',
            className: 'btnstop',
            icon: <i className="fa fa-external-link"/>,
            visible: (item) => {
                const rec = asRecord(item);
                return rec.ativo !== false && rec.prospecto !== null && rec.prospecto !== undefined;
            },
            onClick: () => {},
        },
        {
            key: 'trocaStatus',
            title: 'Troca Status',
            className: 'btnorange',
            icon: <i className="fa fa-exchange"/>,
            permission: 'CREATE',
            onClick: (item) => handleOpenChangeStatus(asCompromisso(item)),
        },
        {
            key: 'proximoStatus',
            title: 'Próximo Status',
            className: 'btngreen',
            icon: <i className="fa fa-forward"/>,
            permission: 'UPDATE',
            visible: (item) => asRecord(item).statusCompromisso?.proxStatusCompromisso !== null && asRecord(item).statusCompromisso?.proxStatusCompromisso !== undefined,
            onClick: (item) => handleOpenNextStatus(asCompromisso(item)),
        },
        {
            key: 'fechar',
            title: 'Fechar',
            className: 'btnblack',
            icon: <i className="fa fa-times"/>,
            permission: 'DELETE',
            visible: (item) => asRecord(item).ativo !== false,
            onClick: (item) => handleOpenCloseCompromisso(asCompromisso(item)),
        },
    ], []);

    return (
        <PermissionGate permission="READ">
            <main className="agenda-compromissos-screen">
                <div className="screen-header">
                    <h1>Agenda de Compromissos</h1>
                    <div className="agenda-selector">
                        <label htmlFor="agenda">Agenda *</label>
                        <AutoComplete
                            id="agenda"
                            value={selectedAgendaId ? agendasQuery.data?.find(a => a.id === selectedAgendaId) ? {id: selectedAgendaId, label: agendasQuery.data.find(a => a.id === selectedAgendaId)?.descricao || ''} : null : null}
                            onChange={(opt: AutoCompleteOption | null) => {
                                const agenda = opt?.id ? agendasQuery.data?.find((a: Agenda) => a.id === opt.id) : null;
                                setSelectedAgendaId(agenda?.id || '');
                                if (agenda && formData.data) {
                                    loadHorarios(agenda.id, formData.data, formTipoHorario);
                                } else {
                                    setFormHorarios([]);
                                }
                                setFormData(prev => ({...prev, agenda}));
                            }}
                            fetchOptions={fetchAgendaOptions}
                            fetchById={fetchAgendaById}
                            minChars={1}
                            minDropdownResults={50}
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
                        <button className="btnblue" onClick={openCreateForm}>
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
                        <label>Pessoa</label>
                        <AutoComplete
                            id="pessoa-filter"
                            value={selectedPessoa}
                            onChange={(opt: AutoCompleteOption | null) => setSelectedPessoa(opt)}
                            fetchOptions={fetchPessoaOptions}
                            fetchById={fetchPessoaById}
                            minChars={2}
                            minDropdownResults={50}
                            placeholder="Buscar pessoa... (combo + autocomplete)"
                        />
                        {selectedPessoa && (
                            <button
                                type="button"
                                className="btnyellow"
                                onClick={() => setSelectedPessoa(null)}
                                title="Limpar filtro pessoa"
                            >
                                Limpar ✕
                            </button>
                        )}
                    </div>

{viewMode === 'calendar' && (
                        <div className="filter-group">
                            <label>Semana</label>
                            <div className="week-nav">
                                <button className="btnstop" onClick={() => setWeekStart(toIsoDate(addDays(parseDate(weekStart), -7)))}>‹ Anterior</button>
                                <span>{formatDateBR(weekStart)} - {formatDateBR(toIsoDate(addDays(parseDate(weekStart), 6)))}</span>
                                <button className="btnstop" onClick={() => setWeekStart(toIsoDate(addDays(parseDate(weekStart), 7)))}>Próximo ›</button>
                                <button className="btnblue" onClick={() => setWeekStart(toIsoDate(mondayOf(new Date())))}>Hoje</button>
                            </div>
                        </div>
                    )}
                </div>

                {viewMode === 'calendar' ? (
                    <div className={`calendar-view${selectedPessoa ? ' pessoa-filtrada' : ''}`}>
                        {selectedPessoa && (
                            <div className="filtro-pessoa-ativo">
                                Filtrando por pessoa: <strong>{selectedPessoa.label}</strong> — eventos em <span className="status-badge evento-green">verde</span>
                            </div>
                        )}
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
                            data={filteredCompromissos as unknown as ApiItem[]}
                            onRowClick={(item) => handleRowClick(asCompromisso(item))}
                            extraRowActions={extraRowActions}
                            expandableRows
                            renderExpandedRow={(item) => {
                                const compromisso = asCompromisso(item);
                                return (
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
                                );
                            }}
                        />
                    </div>
                )}

                {openModal === 'details' && selectedCompromisso && (
                    <Modal
                        title={`Compromisso #${selectedCompromisso.id} - Detalhes`}
                        open={openModal === 'details'}
                        onClose={() => setOpenModal(null)}
                        size="lg"
                    >
                        <div className="details-content">
                            <div className="detail-grid">
                                <div className="detail-item">
                                    <label>ID</label>
                                    <span>{selectedCompromisso.id}</span>
                                </div>
                                <div className="detail-item">
                                    <label>Descrição / Visitante</label>
                                    <span>{selectedCompromisso.descricao}</span>
                                </div>
                                <div className="detail-item">
                                    <label>Agenda</label>
                                    <span>{selectedCompromisso.agenda?.descricao || ''}</span>
                                </div>
                                <div className="detail-item">
                                    <label>Data</label>
                                    <span>{formatDateBR(selectedCompromisso.data)}</span>
                                </div>
                                <div className="detail-item">
                                    <label>Horário</label>
                                    <span>{selectedCompromisso.horario?.hora || ''}</span>
                                </div>
                                <div className="detail-item">
                                    <label>Pessoa</label>
                                    <span>{getPessoaNome(selectedCompromisso.pessoa)}</span>
                                </div>
                                <div className="detail-item">
                                    <label>Tipo de Compromisso</label>
                                    <span>{selectedCompromisso.tipoCompromisso?.descricao || ''}</span>
                                </div>
                                <div className="detail-item">
                                    <label>Status</label>
                                    <span><span className={`status-badge ${selectedCompromisso.statusCompromisso?.cor}`}>{selectedCompromisso.statusCompromisso?.descricao || ''}</span></span>
                                </div>
                                <div className="detail-item">
                                    <label>Agendou por</label>
                                    <span>{selectedCompromisso.usuario?.login || ''}</span>
                                </div>
                                <div className="detail-item">
                                    <label>Atendente</label>
                                    <span>{selectedCompromisso.atendente?.login || ''}</span>
                                </div>
                                <div className="detail-item">
                                    <label>Finalizou por</label>
                                    <span>{selectedCompromisso.usuarioFinalizou?.login || ''}</span>
                                </div>
                                <div className="detail-item full-width">
                                    <label>Observação</label>
                                    <span>{selectedCompromisso.observacao || '—'}</span>
                                </div>
                            </div>
                            {selectedCompromisso.compromissoStatusUsuarios && selectedCompromisso.compromissoStatusUsuarios.length > 0 && (
                                <div className="detail-section">
                                    <h4>Histórico de Status</h4>
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

{openModal === 'form' && (
                    <Modal
                        title={isEditing ? 'Editar Compromisso' : 'Cadastrar compromisso'}
                        open={openModal === 'form'}
                        onClose={() => { setOpenModal(null); setFormData({}); setIsEditing(false); setFormHorarios([]); setFormTipoHorario('unidade'); }}
                        size="lg"
                    >
                        <form onSubmit={(e) => { e.preventDefault(); isEditing ? updateCompromissoMutation.mutate(formData as any) : createCompromissoMutation.mutate(formData); }} className="form-compromisso">
                            <div className="form-grid-layout">
                                <div className="form-row-grid">
                                    <label className="form-label-grid">Agenda *</label>
                                    <div className="form-control-grid">
                                        <AutoComplete
                                            value={formData.agenda ? {id: formData.agenda.id, label: formData.agenda.descricao} : null}
                                            onChange={(opt: AutoCompleteOption | null) => {
                                                const agenda = opt?.id ? agendasQuery.data?.find(a => a.id === opt.id) : null;
                                                handleAgendaChange(agenda || null);
                                            }}
                                            fetchOptions={fetchAgendaOptions}
                                            fetchById={fetchAgendaById}
                                            minChars={1}
                                            minDropdownResults={50}
                                            required
                                            placeholder="Selecione a agenda"
                                        />
                                    </div>
                                </div>

                                <div className="form-row-grid">
                                    <label className="form-label-grid">Data *</label>
                                    <div className="form-control-grid">
                                        <input
                                            type="text"
                                            className="form-input-grid"
                                            value={formData.data ? formatDateBR(formData.data) : ''}
                                            onChange={(e) => {
                                                const dateStr = e.target.value.trim();
                                                if (!dateStr) {
                                                    setFormData(prev => ({...prev, data: ''}));
                                                    setFormHorarios([]);
                                                    return;
                                                }
                                                const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(dateStr);
                                                if (!match) return;
                                                const formatted = `${match[1]}/${match[2]}/${match[3]}`;
                                                setFormData(prev => ({...prev, data: formatted}));
                                                if (formData.agenda?.id) {
                                                    loadHorarios(formData.agenda.id, formatted, formTipoHorario);
                                                }
                                            }}
                                            required
                                            placeholder="dd/MM/yyyy"
                                        />
                                    </div>
                                </div>

                                <div className="form-row-grid">
                                    <label className="form-label-grid">Tipo de Horário</label>
                                    <div className="form-control-grid">
                                        <div className="radio-group">
                                            <label><input type="radio" name="tipoHorario" value="2" checked={formTipoHorario === 'pessoa'} onChange={() => handleTipoHorarioChange('pessoa')} /> Pessoa</label>
                                            <label><input type="radio" name="tipoHorario" value="1" checked={formTipoHorario === 'unidade'} onChange={() => handleTipoHorarioChange('unidade')} /> Unidade</label>
                                        </div>
                                    </div>
                                </div>

                                <div className="form-row-grid">
                                    <label className="form-label-grid">Horário *</label>
                                    <div className="form-control-grid">
                                        <select
                                            className="form-select-grid"
                                            value={formData.horario?.id || ''}
                                            onChange={(e) => setFormData(prev => ({...prev, horario: formHorarios.find(h => h.id === Number(e.target.value))}))}
                                            required
                                            disabled={formHorarios.length === 0}
                                        >
                                            <option value="">Selecione</option>
                                            {formHorarios.map(h => (
                                                <option key={h.id} value={h.id}>{h.hora}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="form-row-grid">
                                    <label className="form-label-grid">Tipo de Compromisso</label>
                                    <div className="form-control-grid">
                                        <select
                                            className="form-select-grid"
                                            value={formData.tipoCompromisso?.id || ''}
                                            onChange={(e) => {
                                                const tipo = tiposCompromisso.find(t => t.id === Number(e.target.value));
                                                setFormData(prev => ({...prev, tipoCompromisso: tipo}));
                                            }}
                                        >
                                            <option value="">Selecione</option>
                                            {tiposCompromisso.map(t => (
                                                <option key={t.id} value={t.id}>{t.descricao}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="form-row-grid">
                                    <label className="form-label-grid">Pessoa</label>
                                    <div className="form-control-grid">
                                        <AutoComplete
                                            value={formData.pessoa ? {id: formData.pessoa.id, label: getPessoaNome(formData.pessoa)} : null}
                                            onChange={(opt) => {
                                                const pessoasList = pessoasByUnidadeQuery.data || pessoasOptionsQuery.data || [];
                                                const pessoa = pessoasList.find(p => p.id === opt?.id);
                                                setFormData(prev => ({...prev, pessoa: pessoa || null}));
                                            }}
                                            fetchOptions={async (query) => {
                                                const pessoasList = pessoasByUnidadeQuery.data || pessoasOptionsQuery.data || [];
                                                if (!query) return pessoasList.slice(0, 20).map(p => ({id: p.id, label: getPessoaNome(p)}));
                                                return pessoasList.filter(p => getPessoaNome(p).toLowerCase().includes(query.toLowerCase())).slice(0, 20).map(p => ({id: p.id, label: getPessoaNome(p)}));
                                            }}
                                            fetchById={async (id) => {
                                                const pessoasList = pessoasByUnidadeQuery.data || pessoasOptionsQuery.data || [];
                                                const p = pessoasList.find(p => p.id === id);
                                                return p ? {id: p.id, label: getPessoaNome(p)} : null;
                                            }}
                                            minChars={2}
                                            placeholder="Buscar pessoa..."
                                        />
                                    </div>
                                </div>

                                <div className="form-row-grid">
                                    <label className="form-label-grid">Descrição *</label>
                                    <div className="form-control-grid">
                                        <input
                                            type="text"
                                            className="form-input-grid"
                                            value={formData.descricao || ''}
                                            onChange={(e) => setFormData(prev => ({...prev, descricao: e.target.value}))}
                                            required
                                            placeholder="Descrição"
                                        />
                                    </div>
                                </div>

                                <div className="form-row-grid">
                                    <label className="form-label-grid">Observação</label>
                                    <div className="form-control-grid">
                                        <textarea
                                            className="form-textarea-grid"
                                            value={formData.observacao || ''}
                                            onChange={(e) => setFormData(prev => ({...prev, observacao: e.target.value}))}
                                            rows={3}
                                            placeholder="Observação"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="form-actions-grid">
                                <button type="submit" className="btn btn-primary btn-save-compromisso" disabled={createCompromissoMutation.isPending || updateCompromissoMutation.isPending}>
                                    Salvar
                                </button>
                            </div>
                        </form>
                    </Modal>
                )}

{openModal === 'changeStatus' && selectedCompromisso && (
                    <Modal
                        title={`Trocar Status - Compromisso #${selectedCompromisso.id}`}
                        open={openModal === 'changeStatus'}
                        onClose={() => setOpenModal(null)}
                        size="md"
                    >
                        <div className="modal-content">
                            <p>Deseja alterar o status do compromisso <strong>#{selectedCompromisso.id}</strong>?</p>
                            <div className="form-group">
                                <label>Novo Status</label>
                                <select
                                    value={formData.statusCompromisso?.id || ''}
                                    onChange={(e) => {
                                        const status = statusOptions.find(s => s.id === Number(e.target.value));
                                        setFormData(prev => ({...prev, statusCompromisso: status}));
                                    }}
                                >
                                    <option value="">Selecione o status</option>
                                    {statusOptions.map(s => (
                                        <option key={s.id} value={s.id}>{s.descricao}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn-form-back" onClick={() => setOpenModal(null)}>Cancelar</button>
                                <button type="button" className="btn-form-save" onClick={() => {
                                    if (formData.statusCompromisso?.id) {
                                        changeStatusMutation.mutate({compromissoId: selectedCompromisso.id, statusId: formData.statusCompromisso.id});
                                    }
                                }} disabled={changeStatusMutation.isPending}>
                                    Confirmar
                                </button>
                            </div>
                        </div>
                    </Modal>
                )}

                {openModal === 'closeCompromisso' && selectedCompromisso && (
                    <Modal
                        title={`Fechar Compromisso #${selectedCompromisso.id}`}
                        open={openModal === 'closeCompromisso'}
                        onClose={() => setOpenModal(null)}
                        size="md"
                    >
                        <div className="modal-content">
                            <p>Deseja realmente fechar o compromisso <strong>#{selectedCompromisso.id}</strong>?</p>
                            <p className="warning">Esta ação não pode ser desfeita.</p>
                            <div className="modal-actions">
                                <button type="button" className="btn-form-back" onClick={() => setOpenModal(null)}>Não</button>
                                <button type="button" className="btn-danger" onClick={() => closeCompromissoMutation.mutate(selectedCompromisso.id)} disabled={closeCompromissoMutation.isPending}>
                                    Sim, Fechar
                                </button>
                            </div>
                        </div>
                    </Modal>
                )}

                {openModal === 'nextStatus' && selectedCompromisso && (
                    <Modal
                        title={`Próximo Status - Compromisso #${selectedCompromisso.id}`}
                        open={openModal === 'nextStatus'}
                        onClose={() => { setOpenModal(null); setNextStatusResultados([]); setNextStatusAtendente(null); setNextStatusTestemunhas([]); setNextStatusObservacao(''); }}
                        size="lg"
                    >
                        <div className="next-status-wizard">
                            <div className="wizard-header">
                                <p><strong>Compromisso:</strong> {selectedCompromisso.descricao}</p>
                                <p><strong>Status Atual:</strong> {selectedCompromisso.statusCompromisso?.descricao}</p>
                                <p><strong>Próximo Status:</strong> {selectedCompromisso.statusCompromisso?.proxStatusCompromisso?.descricao}</p>
                                {selectedCompromisso.statusCompromisso?.alguem && <p className="requires-attendant">Este status requer atendente e testemunhas.</p>}
                                {selectedCompromisso.statusCompromisso?.statusModulos && selectedCompromisso.statusCompromisso.statusModulos.length > 0 && <p className="requires-resultados">Selecione os resultados do atendimento.</p>}
                            </div>

                            <div className="wizard-section">
                                <h4>Resultados do Atendimento</h4>
                                <div className="resultados-manager">
                                    <div className="add-resultado">
                                        <div className="autocomplete-wrapper">
                                            <AutoComplete
                                                value={formData.resultadoSelecionado || null}
                                                onChange={(opt) => setFormData(prev => ({...prev, resultadoSelecionado: opt}))}
                                                fetchOptions={async (query) => {
                                                    if (!query) return [];
                                                    return nextStatusResultados
                                                        .filter(r => r.descricao.toLowerCase().includes(query.toLowerCase()))
                                                        .map(r => ({id: r.id, label: r.descricao}));
                                                }}
                                                fetchById={async (id) => {
                                                    const r = nextStatusResultados.find(r => r.id === id);
                                                    return r ? {id: r.id, label: r.descricao} : null;
                                                }}
                                                minChars={1}
                                                placeholder="Adicionar resultado..."
                                            />
                                        </div>
                                    </div>
                                    <ul className="resultados-list">
                                        {nextStatusResultados.map((r, i) => (
                                            <li key={i}>
                                                {r.descricao}
                                                <button type="button" className="btn-remove" onClick={() => setNextStatusResultados(prev => prev.filter((_, idx) => idx !== i))}>×</button>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>

                            {selectedCompromisso.statusCompromisso?.alguem && (
                                <div className="wizard-section">
                                    <h4>Atendente</h4>
                                    <div className="autocomplete-wrapper">
                                        <AutoComplete
                                            value={nextStatusAtendente ? {id: nextStatusAtendente.id, label: nextStatusAtendente.login} : null}
                                            onChange={(opt) => setNextStatusAtendente(opt ? {id: opt.id, login: opt.label, nome: ''} : null)}
                                            fetchOptions={async (query) => {
                                                if (!query) return usuariosOptions.slice(0, 20).map(u => ({id: u.id, label: u.login}));
                                                return usuariosOptions
                                                    .filter(u => u.login.toLowerCase().includes(query.toLowerCase()) || u.nome.toLowerCase().includes(query.toLowerCase()))
                                                    .slice(0, 20)
                                                    .map(u => ({id: u.id, label: u.login}));
                                            }}
                                            fetchById={async (id) => {
                                                const u = usuariosOptions.find(u => u.id === id);
                                                return u ? {id: u.id, label: u.login} : null;
                                            }}
                                            minChars={1}
                                            placeholder="Selecionar atendente..."
                                        />
                                    </div>
                                </div>
                            )}

                            {selectedCompromisso.statusCompromisso?.alguem && (
                                <div className="wizard-section">
                                    <h4>Testemunhas</h4>
                                    <div className="testemunhas-manager">
                                        <div className="add-resultado">
                                            <div className="autocomplete-wrapper">
                                                <AutoComplete
                                                    value={null}
                                                    onChange={(opt) => {
                                                        if (opt) {
                                                            setNextStatusTestemunhas(prev => [...prev, {id: opt.id, login: opt.label, nome: ''}]);
                                                        }
                                                    }}
                                                    fetchOptions={async (query) => {
                                                        if (!query) return usuariosOptions.slice(0, 20).map(u => ({id: u.id, label: u.login}));
                                                        return usuariosOptions
                                                            .filter(u => u.login.toLowerCase().includes(query.toLowerCase()) || u.nome.toLowerCase().includes(query.toLowerCase()))
                                                            .slice(0, 20)
                                                            .map(u => ({id: u.id, label: u.login}));
                                                    }}
                                                    fetchById={async (id) => {
                                                        const u = usuariosOptions.find(u => u.id === id);
                                                        return u ? {id: u.id, label: u.login} : null;
                                                    }}
                                                    minChars={1}
                                                    placeholder="Adicionar testemunha..."
                                                />
                                            </div>
                                        </div>
                                        <ul className="testemunhas-list">
                                            {nextStatusTestemunhas.map((t, i) => (
                                                <li key={i}>
                                                    {t.login}
                                                    <button type="button" className="btn-remove" onClick={() => setNextStatusTestemunhas(prev => prev.filter((_, idx) => idx !== i))}>×</button>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            )}

                            <div className="wizard-section">
                                <h4>Observação</h4>
                                <textarea
                                    value={nextStatusObservacao}
                                    onChange={(e) => setNextStatusObservacao(e.target.value)}
                                    rows={3}
                                    placeholder="Observações sobre o atendimento..."
                                />
                            </div>

                            <div className="modal-actions">
                                <button type="button" className="btn-form-back" onClick={() => { setOpenModal(null); setNextStatusResultados([]); setNextStatusAtendente(null); setNextStatusTestemunhas([]); setNextStatusObservacao(''); }}>Cancelar</button>
                                <button type="button" className="btn-form-save" onClick={() => {
                                    nextStatusMutation.mutate({
                                        compromissoId: selectedCompromisso.id,
                                        observacao: nextStatusObservacao,
                                        resultadoIds: nextStatusResultados.map(r => r.id),
                                        atendenteId: nextStatusAtendente?.id,
                                        testemunhaIds: nextStatusTestemunhas.map(t => t.id),
                                    });
                                }} disabled={nextStatusMutation.isPending}>
                                    Confirmar
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
