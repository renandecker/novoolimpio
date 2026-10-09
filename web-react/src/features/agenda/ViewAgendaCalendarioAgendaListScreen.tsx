import {useCallback, useMemo, useState} from 'react';
import {useQuery} from '@tanstack/react-query';
import {api} from '../../shared/services/api';
import {PermissionGate} from '../../shared/services/permissions';
import {useAuth} from '../../features/auth/auth';
import {AutoComplete, type AutoCompleteOption} from '../../shared/components/AutoComplete';
import {ScheduleWeekView, mondayOf, toIsoDate, parseDate, addDays, monthRangeForWeek, type ScheduleEventData} from '../../shared/components/WeeklyGrid';
import '../../features/professor/Disponibilidade.css';
import './ViewAgendaCompromissosScreen.css';

interface CompromissoBasico {
    id: number;
    descricao: string;
    data: string;
    horarioId?: number | null;
    agendaId?: number | null;
    pessoaId?: number | null;
    observacao?: string;
    ativo?: boolean;
    usuarioId?: number | null;
    statusCompromissoId?: number | null;
}

interface AgendaBasica {
    id: number;
    descricao: string;
    unidadeId?: number | null;
    tipoAgendaId?: number | null;
}

interface HorarioBasico {
    id: number;
    hora: string;
}

interface UnidadeView {
    id: number;
    sucinto?: string;
    nomeFantasia?: string;
    razaoSocial?: string;
}

interface PessoaFisicaView {
    id: number;
    id_pessoa?: number;
    nome?: string;
    nome_social?: string;
    cpf?: string;
}

interface PessoaJuridicaView {
    id: number;
    id_pessoa?: number;
    nome_fantasia?: string;
    razao_social?: string;
    cnpj?: string;
}

const PALETTE = [
    '#3366CC', '#3C854D', '#E76600', '#C90000', '#553D7A',
    '#4AB1CF', '#EFB70B', '#C71585', '#2EB82E', '#000000',
    '#8A4513', '#0000CD', '#008080', '#B22222', '#556B2F',
    '#6A5ACD',
];

function hashKey(key: string): number {
    let h = 0;
    for (let i = 0; i < key.length; i++) {
        h = (h * 31 + key.charCodeAt(i)) | 0;
    }
    return Math.abs(h);
}

function comboClass(key: string): string {
    return `cal-combo-${hashKey(key) % PALETTE.length}`;
}

function comboColor(key: string): string {
    return PALETTE[hashKey(key) % PALETTE.length];
}

function formatDateBR(dateStr?: string): string {
    if (!dateStr) return '';
    const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(dateStr);
    if (!m) return dateStr;
    return `${m[3]}/${m[2]}/${m[1]}`;
}

function compromissoDateKey(c: CompromissoBasico): string {
    const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(c.data ?? ''));
    return m ? `${m[1]}-${m[2]}-${m[3]}` : String(c.data ?? '');
}

export default function ViewAgendaCalendarioAgendaListScreen() {
    const {session} = useAuth();
    const isAdmin = session?.hierarquia === 'ADMIN';
    const [weekStart, setWeekStart] = useState(() => toIsoDate(mondayOf(new Date())));
    const [selectedAgenda, setSelectedAgenda] = useState<AutoCompleteOption | null>(null);
    const [selectedPessoa, setSelectedPessoa] = useState<AutoCompleteOption | null>(null);
    const [detailId, setDetailId] = useState<number | null>(null);

    const {inicio: rangeInicio, fim: rangeFim} = monthRangeForWeek(weekStart);

    const usuarioAtualQuery = useQuery({
        queryKey: ['calendarioAgenda-usuario-atual'],
        queryFn: async () => (await api.get<{id: number; hierarquia?: string}>('/api/basico/usuario/atual')).data,
        retry: false,
    });
    const usuarioId = usuarioAtualQuery.data?.id;

    const agendasPermitidasQuery = useQuery({
        queryKey: ['calendarioAgenda-agendas-permitidas', usuarioId, isAdmin],
        queryFn: async () => {
            if (isAdmin) return null;
            if (!usuarioId) return [] as number[];
            try {
                const {data} = await api.get<number[]>(`/api/basico/usuario/${usuarioId}/agendas`);
                return Array.isArray(data) ? data.map(Number) : [];
            } catch {
                // Sem permissão/erro: nunca vazar a lista completa; vazio é o estado seguro.
                return [] as number[];
            }
        },
        enabled: !isAdmin && !!usuarioId,
    });

    const agendasQuery = useQuery({
        queryKey: ['calendarioAgenda-agendas'],
        queryFn: async () => (await api.get<AgendaBasica[]>('/api/basico/agenda')).data ?? [],
    });

    const unidadesQuery = useQuery({
        queryKey: ['calendarioAgenda-unidades'],
        queryFn: async () => (await api.get<UnidadeView[]>('/api/view/unidade/listUnidade')).data ?? [],
    });

    const horariosQuery = useQuery({
        queryKey: ['calendarioAgenda-horarios'],
        queryFn: async () => (await api.get<HorarioBasico[]>('/api/basico/horario')).data ?? [],
    });

    const pessoasOptionsQuery = useQuery({
        queryKey: ['calendarioAgenda-pessoas'],
        queryFn: async () => (await api.get<Array<{id: number; nome?: string; pessoaFisica?: {nome?: string; cpf?: string}; pessoaJuridica?: {nomeFantasia?: string; cnpj?: string}}>>('/api/view/pessoa/listPessoa')).data ?? [],
    });

    const agendasPermitidas = useMemo(() => {
        const todas = agendasQuery.data ?? [];
        if (isAdmin) return todas;
        const ids = agendasPermitidasQuery.data;
        if (!ids || ids.length === 0) return [] as AgendaBasica[];
        const permitidas = new Set(ids.map(Number));
        return todas.filter(a => permitidas.has(Number(a.id)));
    }, [agendasQuery.data, agendasPermitidasQuery.data, isAdmin]);

    const agendaMap = useMemo(() => {
        const map = new Map<number, AgendaBasica>();
        for (const a of agendasPermitidas) map.set(Number(a.id), a);
        return map;
    }, [agendasPermitidas]);

    const horarioMap = useMemo(() => {
        const map = new Map<number, string>();
        for (const h of horariosQuery.data ?? []) map.set(Number(h.id), h.hora);
        return map;
    }, [horariosQuery.data]);

    const unidadeMap = useMemo(() => {
        const map = new Map<number, UnidadeView>();
        for (const u of unidadesQuery.data ?? []) map.set(Number(u.id), u);
        return map;
    }, [unidadesQuery.data]);

    const pessoaNomeMap = useMemo(() => {
        const map = new Map<number, string>();
        for (const p of pessoasOptionsQuery.data ?? []) {
            const pid = Number(p.id);
            const nome = p.nome || p.pessoaFisica?.nome || p.pessoaJuridica?.nomeFantasia || '';
            const doc = p.pessoaFisica?.cpf ? ` (${p.pessoaFisica.cpf})` : p.pessoaJuridica?.cnpj ? ` (${p.pessoaJuridica.cnpj})` : '';
            if (pid && nome) map.set(pid, `${nome}${doc}`);
        }
        return map;
    }, [pessoasOptionsQuery.data]);

    const pessoaOptions = useMemo<AutoCompleteOption[]>(() => {
        return Array.from(pessoaNomeMap.entries()).map(([id, label]) => ({id, label}));
    }, [pessoaNomeMap]);

    const fetchPessoaOptions = useCallback(async (query: string): Promise<AutoCompleteOption[]> => {
        const q = query.trim().toLowerCase();
        const list = pessoaOptions;
        const filtered = q ? list.filter(p => p.label.toLowerCase().includes(q)) : list;
        return filtered.slice(0, 50);
    }, [pessoaOptions]);

    const fetchPessoaById = useCallback(async (id: number): Promise<AutoCompleteOption | null> => {
        const label = pessoaNomeMap.get(Number(id));
        return label ? {id: Number(id), label} : null;
    }, [pessoaNomeMap]);

    const fetchAgendaOptions = useCallback(async (query: string): Promise<AutoCompleteOption[]> => {
        const q = query.trim().toLowerCase();
        const list = agendasPermitidas;
        const filtered = q ? list.filter(a => String(a.descricao ?? '').toLowerCase().includes(q) || String(a.id) === q) : list;
        return filtered.slice(0, 50).map(a => ({id: Number(a.id), label: `${a.descricao} (#${a.id})`}));
    }, [agendasPermitidas]);

    const fetchAgendaById = useCallback(async (id: number): Promise<AutoCompleteOption | null> => {
        const agenda = agendaMap.get(Number(id));
        return agenda ? {id: Number(agenda.id), label: `${agenda.descricao} (#${agenda.id})`} : null;
    }, [agendaMap]);

    const compromissosQuery = useQuery({
        queryKey: ['calendarioAgenda-compromissos', rangeInicio, rangeFim, selectedAgenda?.id ?? ''],
        queryFn: async () => {
            const params: Record<string, string | number> = {inicio: rangeInicio, fim: rangeFim};
            if (selectedAgenda?.id) params.agendaId = selectedAgenda.id;
            const {data} = await api.get<CompromissoBasico[]>('/api/basico/compromisso/list-compromisso', {params});
            return Array.isArray(data) ? data : [];
        },
    });

    const compromissosFiltrados = useMemo(() => {
        let list = compromissosQuery.data ?? [];
        if (!selectedAgenda?.id && !isAdmin) {
            const ids = new Set(agendaMap.keys());
            list = list.filter(c => c.agendaId == null || ids.has(Number(c.agendaId)));
        }
        if (selectedPessoa?.id) {
            list = list.filter(c => Number(c.pessoaId) === Number(selectedPessoa.id));
        }
        return list;
    }, [compromissosQuery.data, selectedAgenda, selectedPessoa, isAdmin, agendaMap]);

    const events: ScheduleEventData[] = useMemo(() => {
        return compromissosFiltrados.map(c => {
            const agenda = c.agendaId != null ? agendaMap.get(Number(c.agendaId)) : undefined;
            const unidadeId = agenda?.unidadeId != null ? Number(agenda.unidadeId) : 0;
            const key = `${c.agendaId ?? 0}|${c.pessoaId ?? 0}|${unidadeId}`;
            const hora = (c.horarioId != null ? horarioMap.get(Number(c.horarioId)) : undefined) ?? '';
            const dia = compromissoDateKey(c);
            const start = hora ? `${dia}T${hora}` : `${dia}T00:00`;
            const pessoaNome = c.pessoaId != null ? (pessoaNomeMap.get(Number(c.pessoaId)) ?? `Pessoa #${c.pessoaId}`) : '';
            const agendaDesc = agenda?.descricao ?? (c.agendaId != null ? `Agenda #${c.agendaId}` : 'Agenda');
            return {
                id: c.id,
                title: `${hora ? hora + ' - ' : ''}${agendaDesc}${pessoaNome ? ' • ' + pessoaNome : ''}${c.descricao ? ' • ' + c.descricao : ''}`,
                start,
                end: start,
                allDay: !hora,
                // Ao filtrar por pessoa, os campos do calendário ficam verdes
                styleClass: selectedPessoa?.id ? 'evento-green' : comboClass(key),
                ocorrenciaId: c.id,
            } as ScheduleEventData;
        });
    }, [compromissosFiltrados, agendaMap, horarioMap, pessoaNomeMap, selectedPessoa]);

    const legenda = useMemo(() => {
        if (selectedPessoa?.id) {
            return [{agenda: 'Filtro pessoa', pessoa: selectedPessoa.label, unidade: 'destaque verde', color: '#2eb82e', className: 'evento-green'}];
        }
        const seen = new Map<string, {agenda: string; pessoa: string; unidade: string; color: string; className: string}>();
        for (const c of compromissosFiltrados) {
            const agenda = c.agendaId != null ? agendaMap.get(Number(c.agendaId)) : undefined;
            const unidadeId = agenda?.unidadeId != null ? Number(agenda.unidadeId) : 0;
            const key = `${c.agendaId ?? 0}|${c.pessoaId ?? 0}|${unidadeId}`;
            if (seen.has(key)) continue;
            const unidade = unidadeId ? unidadeMap.get(unidadeId) : undefined;
            seen.set(key, {
                agenda: agenda?.descricao ?? (c.agendaId != null ? `Agenda #${c.agendaId}` : '—'),
                pessoa: c.pessoaId != null ? (pessoaNomeMap.get(Number(c.pessoaId)) ?? `Pessoa #${c.pessoaId}`) : '—',
                unidade: unidade ? (unidade.sucinto || unidade.nomeFantasia || `Unidade #${unidadeId}`) : '—',
                color: comboColor(key),
                className: comboClass(key),
            });
        }
        return Array.from(seen.values()).slice(0, 40);
    }, [compromissosFiltrados, agendaMap, unidadeMap, pessoaNomeMap, selectedPessoa]);

    const comboStyles = useMemo(() => {
        const base = `.evento-green { background-color: #2eb82e !important; color: #fff !important; }\n` +
            `.calendar-view.pessoa-filtrada .wg-event, .calendar-view.pessoa-filtrada .wg-all-day-event { background-color: #2eb82e !important; border-color: #249424 !important; }`;
        const keys = new Set(compromissosFiltrados.map(c => {
            const agenda = c.agendaId != null ? agendaMap.get(Number(c.agendaId)) : undefined;
            const unidadeId = agenda?.unidadeId != null ? Number(agenda.unidadeId) : 0;
            return `${c.agendaId ?? 0}|${c.pessoaId ?? 0}|${unidadeId}`;
        }));
        return base + '\n' + Array.from(keys).map(key => `.${comboClass(key)} { background-color: ${comboColor(key)} !important; color: #fff !important; }`).join('\n');
    }, [compromissosFiltrados, agendaMap]);

    const detalhe = useMemo(() => {
        if (detailId == null) return null;
        const c = compromissosFiltrados.find(x => Number(x.id) === Number(detailId));
        if (!c) return null;
        const agenda = c.agendaId != null ? agendaMap.get(Number(c.agendaId)) : undefined;
        const unidade = agenda?.unidadeId != null ? unidadeMap.get(Number(agenda.unidadeId)) : undefined;
        const hora = c.horarioId != null ? horarioMap.get(Number(c.horarioId)) : undefined;
        const pessoa = c.pessoaId != null ? pessoaNomeMap.get(Number(c.pessoaId)) : undefined;
        return {c, agenda, unidade, hora, pessoa};
    }, [detailId, compromissosFiltrados, agendaMap, unidadeMap, horarioMap, pessoaNomeMap]);

    const limparFiltros = () => {
        setSelectedAgenda(null);
        setSelectedPessoa(null);
    };

    return (
        <PermissionGate permission="READ">
            <main className="agenda-compromissos-screen">
                <style>{comboStyles}</style>
                <div className="screen-header">
                    <h1>Calendário Agenda</h1>
                </div>

                <div className="filters-bar">
                    <div className="filter-group" style={{flex: 1, minWidth: 240}}>
                        <label>Agenda</label>
                        <div style={{flex: 1, minWidth: 200}}>
                            <AutoComplete
                                id="cal-agenda"
                                value={selectedAgenda}
                                onChange={setSelectedAgenda}
                                fetchOptions={fetchAgendaOptions}
                                fetchById={fetchAgendaById}
                                minChars={0}
                                minDropdownResults={50}
                                placeholder="Todas as agendas permitidas"
                            />
                        </div>
                    </div>
                    <div className="filter-group" style={{flex: 1, minWidth: 240}}>
                        <label>Pessoa</label>
                        <div style={{flex: 1, minWidth: 200}}>
                            <AutoComplete
                                id="cal-pessoa"
                                value={selectedPessoa}
                                onChange={setSelectedPessoa}
                                fetchOptions={fetchPessoaOptions}
                                fetchById={fetchPessoaById}
                                minChars={0}
                                minDropdownResults={50}
                                placeholder="Todas as pessoas"
                            />
                        </div>
                    </div>
                    <div className="filter-group">
                        <button type="button" className="btn-today" style={{padding: '8px 14px', border: 'none', borderRadius: 4, background: '#5cb85c', color: '#fff', cursor: 'pointer'}} onClick={limparFiltros} title="Limpar filtros">
                            Limpar
                        </button>
                    </div>
                    <div className="filter-group">
                        <label>Semana</label>
                        <div className="week-nav">
                            <button type="button" onClick={() => setWeekStart(toIsoDate(addDays(parseDate(weekStart), -7)))}>‹ Anterior</button>
                            <span>{formatDateBR(weekStart)} - {formatDateBR(toIsoDate(addDays(parseDate(weekStart), 6)))}</span>
                            <button type="button" onClick={() => setWeekStart(toIsoDate(addDays(parseDate(weekStart), 7)))}>Próximo ›</button>
                            <button type="button" onClick={() => setWeekStart(toIsoDate(mondayOf(new Date())))} className="btn-today">Hoje</button>
                        </div>
                    </div>
                </div>

                {(selectedAgenda || selectedPessoa) && (
                    <div className="disp-aviso">
                        Filtrando por{' '}
                        {[selectedAgenda ? `agenda "${selectedAgenda.label}"` : null, selectedPessoa ? `pessoa "${selectedPessoa.label}"` : null].filter(Boolean).join(' + ')}
                        {' '}• {compromissosFiltrados.length} compromisso(s) no período.
                        {selectedPessoa && <> — eventos em <span className="status-badge evento-green">verde</span></>}
                    </div>
                )}

                <div className={`calendar-view${selectedPessoa ? ' pessoa-filtrada' : ''}`}>
                    <ScheduleWeekView
                        startDate={weekStart}
                        onWeekChange={setWeekStart}
                        events={events}
                        loading={compromissosQuery.isLoading || agendasQuery.isLoading}
                        error={compromissosQuery.isError ? 'Erro ao carregar a agenda.' : null}
                        legend={legenda.map(l => ({className: l.className, label: `${l.agenda} • ${l.pessoa} • ${l.unidade}`}))}
                        onEventClick={(e) => {
                            if (e.ocorrenciaId != null) setDetailId(Number(e.ocorrenciaId));
                        }}
                    />
                </div>

                {legenda.length > 0 && (
                    <div style={{marginTop: 12, display: 'flex', flexWrap: 'wrap', gap: 8}}>
                        {legenda.map((l, i) => (
                            <span key={i} style={{display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, background: '#f8f9fa', border: '1px solid #e9ecef', borderRadius: 4, padding: '4px 8px'}}>
                                <span style={{width: 12, height: 12, borderRadius: 3, background: l.color, display: 'inline-block'}} />
                                {l.agenda} • {l.pessoa} • {l.unidade}
                            </span>
                        ))}
                    </div>
                )}

                {detalhe && (
                    <div className="modal-overlay" onClick={() => setDetailId(null)} style={{position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000}}>
                        <div onClick={(e) => e.stopPropagation()} style={{background: '#fff', borderRadius: 8, padding: 20, maxWidth: 520, width: '90%', maxHeight: '80vh', overflowY: 'auto'}}>
                            <h3 style={{marginTop: 0}}>Compromisso #{detalhe.c.id}</h3>
                            <dl style={{display: 'grid', gap: 8, fontSize: 13}}>
                                <div><strong>Data:</strong> {formatDateBR(String(detalhe.c.data))} {detalhe.hora ? `• ${detalhe.hora}` : ''}</div>
                                <div><strong>Descrição:</strong> {detalhe.c.descricao || '—'}</div>
                                <div><strong>Agenda:</strong> {detalhe.agenda?.descricao ?? (detalhe.c.agendaId != null ? `#${detalhe.c.agendaId}` : '—')}</div>
                                <div><strong>Pessoa:</strong> {detalhe.pessoa ?? (detalhe.c.pessoaId != null ? `Pessoa #${detalhe.c.pessoaId}` : '—')}</div>
                                <div><strong>Unidade da agenda:</strong> {detalhe.unidade ? (detalhe.unidade.sucinto || detalhe.unidade.nomeFantasia || `#${detalhe.unidade.id}`) : '—'}</div>
                                {detalhe.c.observacao && <div><strong>Observação:</strong> {detalhe.c.observacao}</div>}
                            </dl>
                            <div style={{display: 'flex', justifyContent: 'flex-end', marginTop: 16}}>
                                <button type="button" className="btnyellow" onClick={() => setDetailId(null)} style={{padding: '8px 16px'}}>Fechar</button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </PermissionGate>
    );
}
