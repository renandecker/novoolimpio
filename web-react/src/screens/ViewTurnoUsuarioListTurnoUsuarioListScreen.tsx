import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PermissionGate } from '../permissions';
import { AutoComplete, type AutoCompleteOption } from '../AutoComplete';
import { MasterDetail } from '../MasterDetail';
import { TURNO_TRABALHO_SOURCE, TURNO_TRABALHO_COLUMNS, TURNO_TRABALHO_SEARCH } from '../masterDetailSources';
import { api } from '../api';
import type { ApiItem } from '../types';

const asRecord = (item: ApiItem) => item as unknown as Record<string, unknown>;

function parseHora(h: string): number {
    if (!h || typeof h !== 'string') return NaN;
    const parts = h.split(':');
    if (parts.length !== 2) return NaN;
    const hh = Number(parts[0]);
    const mm = Number(parts[1]);
    if (Number.isNaN(hh) || Number.isNaN(mm)) return NaN;
    return hh * 60 + mm;
}

function existeConflitoEntreHorarios(inicio1: string, fim1: string, inicio2: string, fim2: string): boolean {
    const s1 = parseHora(inicio1);
    const e1 = parseHora(fim1);
    const s2 = parseHora(inicio2);
    const e2 = parseHora(fim2);
    if ([s1, e1, s2, e2].some((v) => Number.isNaN(v))) return false;
    return (s2 < e1 && e2 > s1) || (s1 < e2 && e1 > s2);
}

function getDiaSemanaId(item: ApiItem): string {
    const r = asRecord(item);
    const v = (r.diaSemanaId ?? r.diaSemana ?? (r as Record<string, unknown>)['id_dia_semana'] ?? (r as Record<string, unknown>)['diaSemana_id']) as unknown;
    if (v === null || v === undefined) return '';
    if (typeof v === 'object') {
        const rec = v as Record<string, unknown>;
        if (rec.id !== undefined) return String(rec.id);
        return '';
    }
    return String(v);
}

export default function ViewTurnoUsuarioListTurnoUsuarioListScreen() {
    const navigate = useNavigate();
    const [operador, setOperador] = useState<AutoCompleteOption | null>(null);
    const [listaTurnos, setListaTurnos] = useState<ApiItem[]>([]);
    const [saving, setSaving] = useState(false);
    const [loadingTurnos, setLoadingTurnos] = useState(false);
    const [notice, setNotice] = useState<{ type: 'info' | 'warn' | 'error' | 'success'; detail: string } | null>(null);

    const fetchUsuarioOptions = async (query: string): Promise<AutoCompleteOption[]> => {
        const q = query.trim().toLowerCase();
        // tenta varias fontes para compatibilidade legada listarUsuariosParaTurno (usuarioService.autoComplete)
        const tryPaths = ['/api/basico/usuario', '/api/view/usuario/listUsuario', '/api/central/usuario'];
        for (const p of tryPaths) {
            try {
                const res = await api.get<unknown>(p);
                const raw: unknown[] = Array.isArray(res.data) ? (res.data as unknown[]) : ((res.data as { content?: unknown[] })?.content ?? []);
                const opts: AutoCompleteOption[] = raw
                    .map((u) => {
                        const r = u as Record<string, unknown>;
                        const id = Number(r.id ?? r.id_usuario ?? 0);
                        const login = String(r.login ?? r.nome ?? r.descricao ?? '');
                        const nome = String(r.nome ?? '');
                        const label = login ? (nome && nome !== login ? `${login} - ${nome}` : login) : `#${id}`;
                        return { id, label, _raw: r } as AutoCompleteOption & { _raw: Record<string, unknown> };
                    })
                    .filter((o) => o.id > 0)
                    .filter((o) => !q || o.label.toLowerCase().includes(q));
                if (opts.length > 0 || q.length === 0) return opts.slice(0, 300);
            } catch {
                // tenta proxima fonte
            }
        }
        return [];
    };

    const fetchUsuarioById = async (id: number): Promise<AutoCompleteOption | null> => {
        try {
            const res = await api.get<Record<string, unknown>>(`/api/basico/usuario/${id}`);
            const r = res.data as Record<string, unknown>;
            const login = String(r.login ?? r.nome ?? '');
            const nome = String(r.nome ?? '');
            return { id: Number(r.id), label: login ? (nome && nome !== login ? `${login} - ${nome}` : login) : `#${id}` };
        } catch {
            return { id, label: `#${id}` };
        }
    };

    const carregarTurnosDoUsuario = async (usuarioId: number) => {
        setLoadingTurnos(true);
        setNotice(null);
        try {
            // endpoint por-usuario retorna TurnoUsuarioResponse[]; fallback buscar-turno-usuario retorna Long[]
            let turnoIds: number[] = [];
            try {
                const res = await api.get<unknown[]>(`/api/central/turno-usuario/por-usuario?usuarioId=${usuarioId}`);
                const arr = Array.isArray(res.data) ? res.data : [];
                turnoIds = arr.map((x: unknown) => {
                    const r = x as Record<string, unknown>;
                    const v = r.turnoTrabalhoId ?? r.id_turno ?? r.idTurno ?? r;
                    return Number(v as number);
                }).filter((n) => !Number.isNaN(n));
            } catch {
                const res2 = await api.get<unknown[]>(`/api/central/turno-usuario/buscar-turno-usuario?operadorId=${usuarioId}`);
                const arr2 = Array.isArray(res2.data) ? res2.data : [];
                turnoIds = arr2.map((x) => Number(x as number)).filter((n) => !Number.isNaN(n));
            }

            if (turnoIds.length === 0) {
                setListaTurnos([]);
                return;
            }

            // carrega detalhes dos turnos via turno-trabalho lista
            let allTurnos: ApiItem[] = [];
            try {
                const resT = await api.get<ApiItem[]>('/api/central/turno-trabalho');
                allTurnos = Array.isArray(resT.data) ? resT.data : ((resT.data as unknown as { content?: ApiItem[] })?.content ?? []);
            } catch {
                try {
                    const resT2 = await api.get<ApiItem[]>('/api/central/turno-trabalho/paged?page=0&size=100');
                    const paged = resT2.data as unknown as { content?: ApiItem[] };
                    allTurnos = Array.isArray(paged?.content) ? (paged.content as ApiItem[]) : [];
                } catch {
                    allTurnos = [];
                }
            }
            const idSet = new Set(turnoIds.map((n) => String(n)));
            const filtrados = allTurnos.filter((t) => idSet.has(String((t as unknown as Record<string, unknown>).id ?? (t as unknown as Record<string, unknown>).id_turno)));
            // fallback: busca individual se lista filtrada vazia
            if (filtrados.length === 0 && turnoIds.length > 0) {
                const fetched: ApiItem[] = [];
                for (const tid of turnoIds) {
                    try {
                        const r = await api.get<ApiItem>(`/api/central/turno-trabalho/${tid}`);
                        fetched.push(r.data as ApiItem);
                    } catch {
                        fetched.push({ id: tid, nome: `#${tid}` } as unknown as ApiItem);
                    }
                }
                setListaTurnos(fetched);
            } else {
                setListaTurnos(filtrados);
            }
        } catch (e: unknown) {
            const msg = (e as { response?: { data?: { error?: string } } })?.response?.data?.error ?? (e as Error)?.message ?? 'Erro ao carregar turnos do usuário';
            setNotice({ type: 'error', detail: msg });
        } finally {
            setLoadingTurnos(false);
        }
    };

    const handleSelectOperador = async (opt: AutoCompleteOption | null) => {
        setOperador(opt);
        setNotice(null);
        if (!opt) {
            setListaTurnos([]);
            return;
        }
        await carregarTurnosDoUsuario(opt.id);
    };

    const handleTurnosChange = (next: ApiItem[]) => {
        // reinitTurno: valida adição (legado TurnoUsuarioController.reinitTurno)
        if (next.length > listaTurnos.length) {
            const added = next.find((n) => !listaTurnos.some((o) => String(asRecord(o).id ?? (o as unknown as Record<string, unknown>).id) === String(asRecord(n).id ?? (n as unknown as Record<string, unknown>).id)));
            if (added) {
                const rAdded = asRecord(added);
                const diaAdded = getDiaSemanaId(added);
                const inicioAdded = String(rAdded.inicio ?? '');
                const fimAdded = String(rAdded.fim ?? '');
                let num = 0;
                let conflito = false;
                for (const t of listaTurnos) {
                    const dia = getDiaSemanaId(t);
                    if (dia && diaAdded && dia === diaAdded) {
                        num++;
                        const rt = asRecord(t);
                        const inicio = String(rt.inicio ?? '');
                        const fim = String(rt.fim ?? '');
                        if (existeConflitoEntreHorarios(inicio, fim, inicioAdded, fimAdded)) {
                            conflito = true;
                        }
                    }
                }
                if (conflito) {
                    setNotice({ type: 'warn', detail: 'Existe Conflito de horário entre os turnos' });
                    return;
                }
                if (num >= 2) {
                    setNotice({ type: 'warn', detail: 'Não é possível utilizar mais de dois turnos no mesmo dia para um Operador' });
                    return;
                }
                setNotice(null);
            }
        } else {
            // remoção: limpa aviso de conflito se houver
            if (notice?.type === 'warn') setNotice(null);
        }
        setListaTurnos(next);
    };

    const salvar = async () => {
        if (!operador) {
            setNotice({ type: 'warn', detail: 'Selecione um Operador' });
            return;
        }
        if (listaTurnos.length === 0) {
            setNotice({ type: 'warn', detail: 'Antes de salvar preencha os turnos de trabalho' });
            return;
        }
        setSaving(true);
        setNotice(null);
        try {
            const turnoTrabalhoIds = listaTurnos.map((t) => Number((asRecord(t).id ?? (t as unknown as Record<string, unknown>).id) as number)).filter((n) => !Number.isNaN(n));
            await api.post('/api/central/turno-usuario/salvar', { usuarioId: operador.id, turnoTrabalhoIds });
            setNotice({ type: 'success', detail: 'Turnos salvos com sucesso.' });
            // init() legado: limpa form após salvar
            setOperador(null);
            setListaTurnos([]);
        } catch (e: unknown) {
            const msg = (e as { response?: { data?: { error?: string } } })?.response?.data?.error ?? (e as Error)?.message ?? 'Erro ao salvar';
            setNotice({ type: 'error', detail: msg });
        } finally {
            setSaving(false);
        }
    };

    const voltar = () => navigate('/view/turnoTrabalho/listTurnoTrabalho');

    return (
        <PermissionGate permission="READ">
            <main>
                <h1 className="cabecario">Inserir Turno Usuário</h1>
                <hr id="separator" style={{ width: '99%' }} />

                {/* growl autoUpdate showDetail sticky life 50000 */}
                {notice && (
                    <div
                        role="alert"
                        className={`growl growl-${notice.type}`}
                        style={{
                            margin: '8px auto',
                            maxWidth: 980,
                            padding: '10px 14px',
                            borderRadius: 6,
                            border: `1px solid ${notice.type === 'error' ? '#f5c6cb' : notice.type === 'warn' ? '#ffeeba' : notice.type === 'success' ? '#c3e6cb' : '#bee5eb'}`,
                            background: notice.type === 'error' ? '#f8d7da' : notice.type === 'warn' ? '#fff3cd' : notice.type === 'success' ? '#d4edda' : '#d1ecf1',
                            color: notice.type === 'error' ? '#721c24' : notice.type === 'warn' ? '#856404' : notice.type === 'success' ? '#155724' : '#0c5460',
                        }}
                    >
                        <strong>{notice.type === 'error' ? 'Erro' : notice.type === 'warn' ? 'Atenção' : notice.type === 'success' ? 'Sucesso' : 'Informação'}: </strong>
                        <span>{notice.detail}</span>
                    </div>
                )}

                <div className="div_form" style={{ width: '30%', minWidth: 420, margin: '16px auto', padding: 16, border: '1px solid #e0e0e0', borderRadius: 6, background: '#fff' }}>
                    <div className="form-title" style={{ fontWeight: 700, marginBottom: 12 }}>
                        Turno Usuário
                    </div>

                    <div className="table_form" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <AutoComplete
                            id="usuario"
                            label="Operador"
                            placeholder="Digite o login do operador..."
                            value={operador}
                            onChange={(opt) => void handleSelectOperador(opt)}
                            fetchOptions={fetchUsuarioOptions}
                            fetchById={fetchUsuarioById}
                            minChars={2}
                            minDropdownResults={300}
                        />

                        {loadingTurnos && <div style={{ fontSize: 12, color: '#666' }}>Carregando turnos do operador...</div>}

                        <MasterDetail
                            label="Turno de Trabalho"
                            source={TURNO_TRABALHO_SOURCE}
                            valueKey="id"
                            searchKeys={TURNO_TRABALHO_SEARCH}
                            columns={TURNO_TRABALHO_COLUMNS}
                            items={listaTurnos}
                            onChange={handleTurnosChange}
                        />
                    </div>

                    <div className="form-footer" style={{ display: 'flex', gap: 8, marginTop: 18, justifyContent: 'flex-start' }}>
                        <button
                            id="btnSalvar"
                            type="button"
                            className="btnblue"
                            style={{ float: 'left' } as React.CSSProperties}
                            disabled={saving}
                            onClick={() => void salvar()}
                        >
                            <i className="ui-icon-disk" style={{ marginRight: 6 }} />
                            {saving ? 'Salvando...' : 'Salvar'}
                        </button>
                        <button
                            id="btnVoltar"
                            type="button"
                            className="btnyellow"
                            style={{ float: 'left' } as React.CSSProperties}
                            onClick={voltar}
                        >
                            <i className="ui-icon-clock" style={{ marginRight: 6 }} />
                            Turno Trabalho
                        </button>
                    </div>
                </div>
            </main>
        </PermissionGate>
    );
}
