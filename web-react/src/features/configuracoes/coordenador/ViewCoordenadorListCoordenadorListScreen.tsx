import { useEffect, useState } from 'react';

import { useQuery } from '@tanstack/react-query';

import { PermissionGate } from '../../shared/services/permissions';

import { api } from '../../shared/services/api';

import { useAuth } from '../../features/auth/auth';

import { AutoComplete, type AutoCompleteOption } from '../../shared/components/AutoComplete';



import {
  Star,
  Building,
  Clock,
  Pause,
  Calendar,
  Shuffle,
  Search,
  X,
  AlertTriangle,
  PieChart,
  Phone,
  Play,
  Filter,
  User,
  Users,
} from 'lucide-react';



type CoordenadorRow = {

    id: number;

    id_operador: number;

    id_coordenador: number;

    data: string;

    ligacao: number;

    meta: number;

    agendado: number;

    pausa: number;

    prioritario: number;

    operador_login: string;

    operador_descricao: string;

    coordenador_login: string;

    coordenador_descricao: string;

};

type PagedResp = { content: CoordenadorRow[]; totalElements: number; totalPages: number; page: number; size: number };

const PAGE_SIZES = [10, 20, 50, 100];



const formatDate = (v: unknown) => {

    if (!v) return '';

    const s = String(v);

    const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(s);

    if (m) return `${m[3]}/${m[2]}/${m[1]}`;

    try { const d = new Date(s); if (!isNaN(d.getTime())) return d.toLocaleDateString('pt-BR'); } catch {}

    return s;

};

const formatDateTime = (v: unknown) => {

    if (!v) return '';

    try { const d = new Date(String(v)); if (!isNaN(d.getTime())) return d.toLocaleString('pt-BR'); } catch {}

    return String(v);

};

const tempoLigacao = (ini: unknown, fim: unknown) => {

    if (!ini || !fim) return '';

    const a = new Date(String(ini)).getTime();

    const b = new Date(String(fim)).getTime();

    if (isNaN(a) || isNaN(b) || b <= a) return '';

    const diffMin = (b - a) / 60000;

    const tempo = diffMin * 60;

    const segs = Math.round(tempo);

    const min = Math.floor(segs / 60);

    const seg = segs % 60;

    const hora = Math.floor(min / 60);

    const minR = min % 60;

    if (hora > 1) return `${String(hora).padStart(2, '0')}:${String(minR).padStart(2, '0')} h`;

    return `${String(minR).padStart(2, '0')}:${String(seg).padStart(2, '0')} m`;

};



function useCoordenadorAutoComplete() {

    return async (query: string): Promise<AutoCompleteOption[]> => {

        const res = await api.get<unknown[]>(`/api/central/coordenador/auto-complete`, { params: { query } });

        const arr = (res.data ?? []) as unknown[];

        return arr.map((r: unknown) => {

            const rec = r as Record<string, unknown>;

            const id = Number(rec.id ?? 0);

            const login = String(rec.login ?? rec.label ?? '');

            const nome = String(rec.nome ?? '');

            const label = nome ? `${login} - ${nome}` : login;

            return { id, label };

        });

    };

}



export default function ViewCoordenadorListCoordenadorListScreen() {

    const { session } = useAuth();

    const isAdmin = session?.hierarquia === 'ADMIN';

    const fetchOperador = useCoordenadorAutoComplete();



    const [filtros, setFiltros] = useState({ operadorLogin: '', coordenadorLogin: '', data: '' });

    const [showFiltros, setShowFiltros] = useState(false);

    const [page, setPage] = useState(0);

    const [size, setSize] = useState(10);

    const [notice, setNotice] = useState('');



    const [selOperador, setSelOperador] = useState<AutoCompleteOption | null>(null);

    const [selOperador2, setSelOperador2] = useState<AutoCompleteOption | null>(null);

    const [modalOperador, setModalOperador] = useState<{ id: number; login: string } | null>(null);

    const [modalOperadorOpt, setModalOperadorOpt] = useState<AutoCompleteOption | null>(null);

    const [modal, setModal] = useState<null | 'ligacao' | 'ligacaoCoord' | 'ordem' | 'prioritaria' | 'prioritariaCoord' | 'pausa' | 'pausaCoord' | 'agend' | 'pie' | 'trocaLig' | 'trocaPri'>(null);

    const [pieData, setPieData] = useState<Record<string, number> | null>(null);

    const [detailPage, setDetailPage] = useState(0);



    const q = useQuery({

        queryKey: ['coordenador-paged', page, size, filtros],

        queryFn: async () => {

            try {

                const res = await api.get<PagedResp>('/api/central/coordenador/paged-enriched', { params: { page, size, operadorLogin: filtros.operadorLogin || undefined, coordenadorLogin: filtros.coordenadorLogin || undefined, data: filtros.data || undefined } });

                return res.data;

            } catch {

                const res = await api.get<PagedResp>('/api/view/coordenador/listCoordenador/paged', { params: { page, size } });

                const content = (res.data.content as unknown as Record<string, unknown>[]).map(r => ({

                    id: Number(r.id),

                    id_operador: Number(r.id_operador ?? 0),

                    id_coordenador: Number(r.id_coordenador ?? 0),

                    data: String(r.data ?? ''),

                    ligacao: Number(r.ligacao ?? 0),

                    meta: Number(r.meta ?? 0),

                    agendado: Number(r.agendado ?? 0),

                    pausa: Number(r.pausa ?? 0),

                    prioritario: Number(r.prioritario ?? 0),

                    operador_login: String(r.operador_login ?? r.operador_descricao ?? ''),

                    operador_descricao: String(r.operador_descricao ?? r.operador_login ?? ''),

                    coordenador_login: String(r.coordenador_login ?? r.coordenador_descricao ?? ''),

                    coordenador_descricao: String(r.coordenador_descricao ?? r.coordenador_login ?? ''),

                } as CoordenadorRow));

                return { content, totalElements: res.data.totalElements ?? content.length, totalPages: res.data.totalPages ?? 1, page, size } as PagedResp;

            }

        },

    });



    const items = q.data?.content ?? [];

    const totalPages = q.data?.totalPages ?? 1;

    const totalElements = q.data?.totalElements ?? 0;



    const ligacoesQ = useQuery({

        queryKey: ['coord-ligacoes', modalOperador?.id, detailPage, modal],

        queryFn: async () => {

            if (!modalOperador) return [];

            const r = await api.get(`/api/central/coordenador/${modalOperador.id}/ligacoes`, { params: { page: detailPage, size: 10 } });

            return r.data as unknown[];

        },

        enabled: modal !== null && modalOperador !== null && (modal === 'ligacao' || modal === 'ligacaoCoord'),

    });

    const ordemQ = useQuery({

        queryKey: ['coord-ordem', modalOperador?.id, detailPage],

        queryFn: async () => {

            if (!modalOperador) return [];

            const r = await api.get(`/api/central/coordenador/${modalOperador.id}/ordem-ligacoes`, { params: { page: detailPage, size: 10 } });

            return r.data as unknown[];

        },

        enabled: modal === 'ordem' && modalOperador !== null,

    });

    const prioriQ = useQuery({

        queryKey: ['coord-priori', modalOperador?.id, detailPage],

        queryFn: async () => {

            if (!modalOperador) return [];

            const r = await api.get(`/api/central/coordenador/${modalOperador.id}/fila-prioritaria`, { params: { page: detailPage, size: 10 } });

            return r.data as unknown[];

        },

        enabled: (modal === 'prioritaria' || modal === 'prioritariaCoord') && modalOperador !== null,

    });

    const pausaQ = useQuery({

        queryKey: ['coord-pausa', modalOperador?.id, detailPage],

        queryFn: async () => {

            if (!modalOperador) return [];

            const r = await api.get(`/api/central/coordenador/${modalOperador.id}/pausas`, { params: { page: detailPage, size: 10 } });

            return r.data as unknown[];

        },

        enabled: (modal === 'pausa' || modal === 'pausaCoord') && modalOperador !== null,

    });

    const agendQ = useQuery({

        queryKey: ['coord-agend', modalOperador?.id, detailPage],

        queryFn: async () => {

            if (!modalOperador) return [];

            const r = await api.get(`/api/central/coordenador/${modalOperador.id}/compromissos`, { params: { page: detailPage, size: 10 } });

            return r.data as unknown[];

        },

        enabled: modal === 'agend' && modalOperador !== null,

    });



    const handlePausar = async (row: CoordenadorRow) => {

        try {

            await api.post(`/api/central/coordenador/${row.id_operador}/pausar`, null, { params: { usuarioLogadoId: row.id_operador } });

            setNotice(`Pausa solicitada para ${row.operador_login}`);

            q.refetch();

        } catch (e: unknown) { const msg = (e as { response?: { data?: { error?: string } } })?.response?.data?.error ?? (e as Error).message; setNotice(`Erro ao pausar: ${msg}`); }

    };

    const handleDespausar = async (row: CoordenadorRow) => {

        try {

            await api.post(`/api/central/coordenador/${row.id_operador}/despausar`);

            setNotice(`Pausa removida para ${row.operador_login}`);

            q.refetch();

        } catch (e: unknown) { const msg = (e as { response?: { data?: { error?: string } } })?.response?.data?.error ?? (e as Error).message; setNotice(`Erro ao despausar: ${msg}`); }

    };

    const handlePie = async (row: CoordenadorRow) => {

        setModalOperador({ id: row.id_operador, login: row.operador_login });

        try {

            const r = await api.get(`/api/central/coordenador/${row.id_operador}/pie`);

            setPieData(r.data as Record<string, number>);

        } catch { setPieData({ total: 0 }); }

        setModal('pie');

    };

    const handleTrocaPri = async () => {

        if (!selOperador || !selOperador2) { setNotice('Selecione Do e Para operador'); return; }

        try {

            await api.post('/api/central/coordenador/troca-prioritaria', null, { params: { de: selOperador.id, para: selOperador2.id } });

            setNotice(`Fila prioritária transferida de ${selOperador.label} para ${selOperador2.label}`);

            setModal(null);

        } catch (e: unknown) { const msg = (e as { response?: { data?: { error?: string } } })?.response?.data?.error ?? (e as Error).message; setNotice(`Erro troca prioritária: ${msg}`); }

    };

    const handleRedistribuir = async () => {

        const opId = selOperador?.id ?? modalOperador?.id;

        const opLabel = selOperador?.label ?? modalOperador?.login;

        if (!opId) { setNotice('Selecione o operador'); return; }

        try {

            await api.post(`/api/central/coordenador/${opId}/redistribuir`);

            setNotice(`Fila redistribuída para operador ${opLabel}`);

            setModal(null);

        } catch (e: unknown) { const msg = (e as { response?: { data?: { error?: string } } })?.response?.data?.error ?? (e as Error).message; setNotice(`Erro redistribuir: ${msg}`); }

    };



    const [enriched, setEnriched] = useState<Record<number, { turno: string; situacao: string }>>({});

    useEffect(() => {

        if (!items.length) return;

        items.forEach(row => {

            if (enriched[row.id]) return;

            Promise.all([

                api.get<string>(`/api/central/coordenador/${row.id_operador}/turnos`).then(r=>r.data).catch(()=>''),

                api.get<string>(`/api/central/coordenador/${row.id_operador}/situacao`).then(r=>r.data).catch(()=>''),

            ]).then(([turno, situacao]) => setEnriched(prev => ({ ...prev, [row.id]: { turno: String(turno ?? ''), situacao: String(situacao ?? '') } })));

        });

    }, [items, enriched]);



    const syncModalOptToId = (opt: AutoCompleteOption | null) => {

        setModalOperadorOpt(opt);

        if (opt) { setModalOperador({ id: opt.id, login: opt.label }); setDetailPage(0); } else setModalOperador(null);

    };



    return (

        <PermissionGate permission="READ">

            <main style={{ padding: '12px 16px' }}>

                <h1 style={{ margin: '8px 0 12px', fontSize: 22 }}>Coordenador</h1>



                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12, alignItems: 'center' }}>

                    <button className="btnblue" onClick={() => { if (selOperador) setModalOperador({ id: selOperador.id, login: selOperador.label }); setDetailPage(0); setModal('prioritariaCoord'); }} title="Detalhe Fila Prioritária" style={{ background: '#1976d2', color: '#fff', border: 0, padding: '6px 10px', borderRadius: 4 }}><Star className="icon" fill="currentColor" /> Fila Prioritária</button>

                    <button className="btnstop" onClick={() => { if (selOperador) setModalOperador({ id: selOperador.id, login: selOperador.label }); setDetailPage(0); setModal('ligacaoCoord'); }} title="Detalhe Ligações" style={{ background: '#37474f', color: '#fff', border: 0, padding: '6px 10px', borderRadius: 4 }}><Phone className="icon" /> Ligação</button>

                    <button onClick={() => { if (selOperador) setModalOperador({ id: selOperador.id, login: selOperador.label }); setDetailPage(0); setModal('ordem'); }} style={{ background: '#8d6e63', color: '#fff', border: 0, padding: '6px 10px', borderRadius: 4 }}><Clock className="icon" /> Fila Pendente</button>

                    <button onClick={() => { if (selOperador) setModalOperador({ id: selOperador.id, login: selOperador.label }); setDetailPage(0); setModal('pausaCoord'); }} title="Detalhe Pausa" style={{ background: '#c62828', color: '#fff', border: 0, padding: '6px 10px', borderRadius: 4 }}><Pause className="icon" /> Pausa</button>

                    <button onClick={() => { if (selOperador) setModalOperador({ id: selOperador.id, login: selOperador.label }); setDetailPage(0); setModal('agend'); }} style={{ background: '#2e7d32', color: '#fff', border: 0, padding: '6px 10px', borderRadius: 4 }}><Calendar className="icon" /> Agendados</button>

                    <button onClick={() => setModal('trocaLig')} style={{ background: '#f9a825', color: '#fff', border: 0, padding: '6px 10px', borderRadius: 4 }}><Shuffle className="icon" /> Redistribuir ligação</button>

                    <button onClick={() => setModal('trocaPri')} style={{ background: '#212121', color: '#fff', border: 0, padding: '6px 10px', borderRadius: 4 }}><Shuffle className="icon" /> Troca prioritária</button>

                    <button onClick={() => setShowFiltros(v => !v)} style={{ marginLeft: 'auto', background: '#607d8b', color: '#fff', border: 0, padding: '6px 10px', borderRadius: 4 }}><Filter className="icon" /> Filtros</button>

                </div>



                <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12, flexWrap: 'wrap' }}>

                    <label style={{ fontSize: 13, fontWeight: 600 }}>Operador selecionado:</label>

                    <div style={{ minWidth: 300 }}>

                        <AutoComplete value={selOperador} onChange={setSelOperador} fetchOptions={fetchOperador} placeholder="Buscar operador por login" />

                    </div>

                    {selOperador && <span style={{ fontSize: 13, color: '#555' }}>{selOperador.label} (id {selOperador.id})</span>}

                </div>



                {showFiltros && (

                    <div style={{ border: '1px solid #e0e0e0', borderRadius: 6, padding: 12, marginBottom: 12, background: '#fafafa' }}>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 10 }}>

                            <label>Operador login<input value={filtros.operadorLogin} onChange={e => setFiltros(s => ({ ...s, operadorLogin: e.target.value }))} placeholder="ex: operador01" style={{ width: '100%', padding: 6, borderRadius: 4, border: '1px solid #ccc' }} /></label>

                            <label>Coordenador login<input value={filtros.coordenadorLogin} onChange={e => setFiltros(s => ({ ...s, coordenadorLogin: e.target.value }))} placeholder="ex: coord01" style={{ width: '100%', padding: 6, borderRadius: 4, border: '1px solid #ccc' }} /></label>

                            <label>Data<input type="date" value={filtros.data} onChange={e => setFiltros(s => ({ ...s, data: e.target.value }))} style={{ width: '100%', padding: 6, borderRadius: 4, border: '1px solid #ccc' }} /></label>

                        </div>

                        <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>

                            <button onClick={() => { setPage(0); q.refetch(); }} style={{ padding: '6px 14px', background: '#1976d2', color: '#fff', border: 0, borderRadius: 4 }}><Search className="icon" /> Pesquisar</button>

                            <button onClick={() => { setFiltros({ operadorLogin: '', coordenadorLogin: '', data: '' }); setPage(0); }} style={{ padding: '6px 14px', background: '#ef6c00', color: '#fff', border: 0, borderRadius: 4 }}><X className="icon" /> Limpar</button>

                            <span style={{ marginLeft: 'auto', fontSize: 12, color: '#777', alignSelf: 'center' }}>Total: {totalElements} • Página {page + 1} de {totalPages}</span>

                        </div>

                    </div>

                )}



                {notice && <div style={{ background: '#fff3e0', border: '1px solid #ffe0b2', padding: 8, borderRadius: 4, marginBottom: 10, fontSize: 13 }}>{notice}</div>}



                <div style={{ overflowX: 'auto', border: '1px solid #e0e0e0', borderRadius: 6 }}>

                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>

                        <thead>

                            <tr style={{ background: '#263238', color: '#fff' }}>

                                {isAdmin && <th style={{ padding: '8px 10px', textAlign: 'left', whiteSpace: 'nowrap' }}>Coordenador</th>}

                                <th style={{ padding: '8px 10px', textAlign: 'left' }}>Operador</th>

                                <th style={{ padding: '8px 10px' }}>Data</th>

                                <th style={{ padding: '8px 10px' }}>Turno</th>

                                <th style={{ padding: '8px 10px' }}>Meta</th>

                                <th style={{ padding: '8px 10px' }}>Agendado</th>

                                <th style={{ padding: '8px 10px' }}>Ligação</th>

                                <th style={{ padding: '8px 10px' }}>Pausa</th>

                                <th style={{ padding: '8px 10px' }}>Fila Prioritária</th>

                                <th style={{ padding: '8px 10px' }}>Situação</th>

                                <th style={{ padding: '8px 10px', minWidth: 200 }}>Ações</th>

                            </tr>

                        </thead>

                        <tbody>

                            {q.isLoading ? (

                                <tr><td colSpan={isAdmin ? 11 : 10} style={{ padding: 16, textAlign: 'center' }}>Carregando...</td></tr>

                            ) : items.length === 0 ? (

                                <tr><td colSpan={isAdmin ? 11 : 10} style={{ padding: 16, textAlign: 'center', color: '#777' }}>Nenhum registro encontrado.</td></tr>

                            ) : items.map(row => {

                                const en = enriched[row.id] ?? { turno: '', situacao: '' };

                                return (

                                    <tr key={row.id} style={{ borderTop: '1px solid #eee' }}>

                                        {isAdmin && <td style={{ padding: '8px 10px', whiteSpace: 'nowrap' }}>{row.coordenador_login}</td>}

                                        <td style={{ padding: '8px 10px', whiteSpace: 'nowrap' }} title={row.operador_descricao}>{row.operador_login}</td>

                                        <td style={{ padding: '8px 10px', textAlign: 'center' }}>{formatDate(row.data)}</td>

                                        <td style={{ padding: '8px 10px', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={en.turno}>{en.turno || '—'}</td>

                                        <td style={{ padding: '8px 10px', textAlign: 'center' }}>{row.meta ?? 0}</td>

                                        <td style={{ padding: '8px 10px', textAlign: 'center' }}>{row.agendado ?? 0}</td>

                                        <td style={{ padding: '8px 10px', textAlign: 'center' }}>{row.ligacao ?? 0}</td>

                                        <td style={{ padding: '8px 10px', textAlign: 'center' }}>{row.pausa ?? 0}</td>

                                        <td style={{ padding: '8px 10px', textAlign: 'center' }}>{row.prioritario ?? 0}</td>

                                        <td style={{ padding: '8px 10px', textAlign: 'center' }}><span style={{ padding: '2px 6px', borderRadius: 10, fontSize: 11, background: en.situacao === 'Pausa' ? '#ffebee' : en.situacao === 'Acessando' ? '#e8f5e9' : en.situacao === 'Ausente' ? '#f5f5f5' : '#fff3e0', border: '1px solid #e0e0e0' }}>{en.situacao || '—'}</span></td>

                                        <td style={{ padding: '6px 8px', display: 'flex', gap: 4, flexWrap: 'wrap' }}>

                                            <button title="Resultados" onClick={() => handlePie(row)} style={{ background: '#7b1fa2', color: '#fff', border: 0, borderRadius: 4, padding: '4px 6px', cursor: 'pointer' }}><PieChart className="icon" /></button>

                                            <button title="Fila Prioritária" onClick={() => { setModalOperador({ id: row.id_operador, login: row.operador_login }); setModal('prioritaria'); setModalOperadorOpt({ id: row.id_operador, label: row.operador_login }); }} style={{ background: '#1976d2', color: '#fff', border: 0, borderRadius: 4, padding: '4px 6px' }}><Star className="icon" fill="currentColor" /></button>

                                            <button title="Ligações" onClick={() => { setModalOperador({ id: row.id_operador, login: row.operador_login }); setModal('ligacao'); setModalOperadorOpt({ id: row.id_operador, label: row.operador_login }); }} style={{ background: '#37474f', color: '#fff', border: 0, borderRadius: 4, padding: '4px 6px' }}><Phone className="icon" /></button>

                                            <button title="Pausa" onClick={() => { setModalOperador({ id: row.id_operador, login: row.operador_login }); setModal('pausa'); setModalOperadorOpt({ id: row.id_operador, label: row.operador_login }); }} style={{ background: '#c62828', color: '#fff', border: 0, borderRadius: 4, padding: '4px 6px' }}><Pause className="icon" /></button>

                                            <button title="Agendamentos" onClick={() => { setModalOperador({ id: row.id_operador, login: row.operador_login }); setModal('agend'); setModalOperadorOpt({ id: row.id_operador, label: row.operador_login }); }} style={{ background: '#2e7d32', color: '#fff', border: 0, borderRadius: 4, padding: '4px 6px' }}><Calendar className="icon" /></button>

                                            <button title={en.situacao === 'Pausa' ? 'Despausar' : 'Pausar'} onClick={() => en.situacao === 'Pausa' ? handleDespausar(row) : handlePausar(row)} style={{ background: en.situacao === 'Pausa' ? '#1976d2' : '#c62828', color: '#fff', border: 0, borderRadius: 4, padding: '4px 6px' }}>{en.situacao === 'Pausa' ? <Play className="icon" /> : <Pause className="icon" />}</button>

                                        </td>

                                    </tr>

                                );

                            })}

                        </tbody>

                    </table>

                </div>



                <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 10, flexWrap: 'wrap' }}>

                    <button disabled={page === 0} onClick={() => setPage(p => Math.max(0, p - 1))} style={{ padding: '6px 10px' }}>Anterior</button>

                    <span style={{ fontSize: 13 }}>Página {page + 1} de {Math.max(1, totalPages)} • Total {totalElements}</span>

                    <button disabled={page >= totalPages - 1} onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} style={{ padding: '6px 10px' }}>Próxima</button>

                    <label style={{ marginLeft: 'auto', fontSize: 13 }}>Registros por página

                        <select value={size} onChange={e => { setSize(Number(e.target.value)); setPage(0); }} style={{ marginLeft: 6, padding: 4 }}>

                            {PAGE_SIZES.map(n => <option key={n} value={n}>{n}</option>)}

                        </select>

                    </label>

                </div>



                {modal === 'pie' && (

                    <div className="modal-overlay" onClick={() => setModal(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>

                        <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: 8, padding: 16, minWidth: 360, maxWidth: 600 }}>

                            <h3 style={{ margin: '0 0 10px' }}>Ligações de {modalOperador?.login}</h3>

                            {!pieData ? <p>Carregando...</p> : (

                                <div style={{ display: 'grid', gap: 6 }}>

                                    {Object.entries(pieData).filter(([k]) => k !== 'total').map(([k, v]) => (

                                        <div key={k} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #eee', padding: '4px 0' }}><span>{k}</span><strong>{v}</strong></div>

                                    ))}

                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, marginTop: 6 }}><span>Total</span><span>{String((pieData as Record<string, unknown>).total ?? 0)}</span></div>

                                </div>

                            )}

                            <div style={{ textAlign: 'right', marginTop: 12 }}><button onClick={() => setModal(null)} style={{ padding: '6px 12px', background: '#1976d2', color: '#fff', border: 0, borderRadius: 4 }}>Fechar</button></div>

                        </div>

                    </div>

                )}



                {(modal === 'ligacao' || modal === 'ligacaoCoord') && (

                    <DetailModal title={`Detalhes da ligação - ${modalOperador?.login ?? ''}`} onClose={() => setModal(null)}>

                        {modal === 'ligacaoCoord' && (

                            <div style={{ marginBottom: 10 }}>

                                <AutoComplete value={modalOperadorOpt} onChange={syncModalOptToId} fetchOptions={fetchOperador} placeholder="Selecionar operador" />

                            </div>

                        )}

                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>

                            <thead><tr style={{ background: '#eceff1' }}><th style={{ padding: 6 }}>Inicio</th><th style={{ padding: 6 }}>Fim</th><th style={{ padding: 6 }}>Hora</th><th style={{ padding: 6 }}>Tempo</th><th style={{ padding: 6 }}>Prospecto</th><th style={{ padding: 6 }}>Telefone</th><th style={{ padding: 6 }}>Resultado</th><th style={{ padding: 6 }}>Data Marcada</th><th style={{ padding: 6 }}>Relato</th></tr></thead>

                            <tbody>

                                {(ligacoesQ.data as unknown[] ?? []).length === 0 ? <tr><td colSpan={9} style={{ padding: 12, textAlign: 'center', color: '#777' }}>{ligacoesQ.isLoading ? 'Carregando...' : 'Nenhum registro'}</td></tr> :

                                    (ligacoesQ.data as unknown as Record<string, unknown>[]).map((r: Record<string, unknown>, i: number) => (

                                        <tr key={i} style={{ borderTop: '1px solid #eee' }}>

                                            <td style={{ padding: 6 }}>{formatDateTime(r.dataInicial)}</td>

                                            <td style={{ padding: 6 }}>{formatDateTime(r.dataFinal)}</td>

                                            <td style={{ padding: 6 }}>{String(r.dataInicial ?? '').slice(11, 16)}</td>

                                            <td style={{ padding: 6 }}>{tempoLigacao(r.dataInicial, r.dataFinal)}</td>

                                            <td style={{ padding: 6 }}>{String(r.prospectoNome ?? '')}</td>

                                            <td style={{ padding: 6 }}>{String(r.telefoneDiscado ?? '')}</td>

                                            <td style={{ padding: 6 }}>{String(r.resultadoDescricao ?? '')}</td>

                                            <td style={{ padding: 6 }}>{formatDateTime(r.compromissoData)}</td>

                                            <td style={{ padding: 6, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={String(r.relato ?? '')}>{String(r.relato ?? '')}</td>

                                        </tr>

                                    ))}

                            </tbody>

                        </table>

                        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}><button disabled={detailPage === 0} onClick={() => setDetailPage(p => Math.max(0, p - 1))}>Anterior</button><span style={{ fontSize: 12 }}>Pág {detailPage + 1}</span><button onClick={() => setDetailPage(p => p + 1)}>Próxima</button></div>

                    </DetailModal>

                )}



                {modal === 'ordem' && (

                    <DetailModal title={`Fila pendente - ${modalOperador?.login ?? ''}`} onClose={() => setModal(null)}>

                        <div style={{ marginBottom: 10 }}>

                            <AutoComplete value={modalOperadorOpt} onChange={syncModalOptToId} fetchOptions={fetchOperador} placeholder="Selecionar operador" />

                        </div>

                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>

                            <thead><tr style={{ background: '#eceff1' }}><th style={{ padding: 6 }}>Prospecto</th><th style={{ padding: 6 }}>Telefone(s)</th></tr></thead>

                            <tbody>

                                {(ordemQ.data as unknown[] ?? []).length === 0 ? <tr><td colSpan={2} style={{ padding: 12, textAlign: 'center', color: '#777' }}>{ordemQ.isLoading ? 'Carregando...' : 'Nenhum registro'}</td></tr> :

                                    (ordemQ.data as unknown as Record<string, unknown>[]).map((r: Record<string, unknown>, i: number) => (

                                        <tr key={i} style={{ borderTop: '1px solid #eee' }}><td style={{ padding: 6 }}>{String(r.prospectoNome ?? '')}</td><td style={{ padding: 6 }}>{String(r.prospectoNome ?? '')}</td></tr>

                                    ))}

                            </tbody>

                        </table>

                        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}><button disabled={detailPage === 0} onClick={() => setDetailPage(p => Math.max(0, p - 1))}>Anterior</button><span style={{ fontSize: 12 }}>Pág {detailPage + 1}</span><button onClick={() => setDetailPage(p => p + 1)}>Próxima</button></div>

                    </DetailModal>

                )}



                {(modal === 'prioritaria' || modal === 'prioritariaCoord') && (

                    <DetailModal title={`Fila prioritária - ${modalOperador?.login ?? ''}`} onClose={() => setModal(null)}>

                        {modal === 'prioritariaCoord' && (

                            <div style={{ marginBottom: 10 }}>

                                <AutoComplete value={modalOperadorOpt} onChange={syncModalOptToId} fetchOptions={fetchOperador} placeholder="Selecionar operador" />

                            </div>

                        )}

                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>

                            <thead><tr style={{ background: '#eceff1' }}><th style={{ padding: 6 }}>Data retorno</th><th style={{ padding: 6 }}>Tempo</th><th style={{ padding: 6 }}>Prospecto</th><th style={{ padding: 6 }}>Telefone</th><th style={{ padding: 6 }}>Resultado</th><th style={{ padding: 6 }}>Relato</th></tr></thead>

                            <tbody>

                                {(prioriQ.data as unknown[] ?? []).length === 0 ? <tr><td colSpan={6} style={{ padding: 12, textAlign: 'center', color: '#777' }}>{prioriQ.isLoading ? 'Carregando...' : 'Nenhum registro'}</td></tr> :

                                    (prioriQ.data as unknown as Record<string, unknown>[]).map((r: Record<string, unknown>, i: number) => (

                                        <tr key={i} style={{ borderTop: '1px solid #eee' }}>

                                            <td style={{ padding: 6 }}>{formatDateTime(r.data)}</td>

                                            <td style={{ padding: 6 }}>{tempoLigacao(r.dataInicial, r.dataFinal)}</td>

                                            <td style={{ padding: 6 }}>{String(r.prospectoNome ?? '')}</td>

                                            <td style={{ padding: 6 }}>{String(r.telefoneDiscado ?? '')}</td>

                                            <td style={{ padding: 6 }}>{String(r.resultadoDescricao ?? '')}</td>

                                            <td style={{ padding: 6, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={String(r.relato ?? '')}>{String(r.relato ?? '')}</td>

                                        </tr>

                                    ))}

                            </tbody>

                        </table>

                        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}><button disabled={detailPage === 0} onClick={() => setDetailPage(p => Math.max(0, p - 1))}>Anterior</button><span style={{ fontSize: 12 }}>Pág {detailPage + 1}</span><button onClick={() => setDetailPage(p => p + 1)}>Próxima</button></div>

                    </DetailModal>

                )}



                {(modal === 'pausa' || modal === 'pausaCoord') && (

                    <DetailModal title={`Detalhes da Pausa - ${modalOperador?.login ?? ''}`} onClose={() => setModal(null)}>

                        {modal === 'pausaCoord' && (

                            <div style={{ marginBottom: 10 }}>

                                <AutoComplete value={modalOperadorOpt} onChange={syncModalOptToId} fetchOptions={fetchOperador} placeholder="Selecionar operador" />

                            </div>

                        )}

                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>

                            <thead><tr style={{ background: '#eceff1' }}><th style={{ padding: 6 }}>Quem pausou</th><th style={{ padding: 6 }}>Tipo Pausa</th><th style={{ padding: 6 }}>Inicio</th><th style={{ padding: 6 }}>Fim</th><th style={{ padding: 6 }}>Hora</th><th style={{ padding: 6 }}>Estorado</th><th style={{ padding: 6 }}>Observação</th></tr></thead>

                            <tbody>

                                {(pausaQ.data as unknown[] ?? []).length === 0 ? <tr><td colSpan={7} style={{ padding: 12, textAlign: 'center', color: '#777' }}>{pausaQ.isLoading ? 'Carregando...' : 'Nenhum registro'}</td></tr> :

                                    (pausaQ.data as unknown as Record<string, unknown>[]).map((r: Record<string, unknown>, i: number) => (

                                        <tr key={i} style={{ borderTop: '1px solid #eee' }}>

                                            <td style={{ padding: 6 }}>{String(r.usuarioLogin ?? '')}</td>

                                            <td style={{ padding: 6 }}>{String(r.tipoPausaDescricao ?? '')}</td>

                                            <td style={{ padding: 6 }}>{formatDateTime(r.dataInicial)}</td>

                                            <td style={{ padding: 6 }}>{formatDateTime(r.dataFinal)}</td>

                                            <td style={{ padding: 6 }}>{String(r.dataInicial ?? '').slice(11, 16)}</td>

                                            <td style={{ padding: 6 }}>{r.estorado ? 'Sim' : 'Não'}</td>

                                            <td style={{ padding: 6, maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={String(r.observacao ?? '')}>{String(r.observacao ?? '')}</td>

                                        </tr>

                                    ))}

                            </tbody>

                        </table>

                        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}><button disabled={detailPage === 0} onClick={() => setDetailPage(p => Math.max(0, p - 1))}>Anterior</button><span style={{ fontSize: 12 }}>Pág {detailPage + 1}</span><button onClick={() => setDetailPage(p => p + 1)}>Próxima</button></div>

                    </DetailModal>

                )}



                {modal === 'agend' && (

                    <DetailModal title={`Agendamentos - ${modalOperador?.login ?? ''}`} onClose={() => setModal(null)}>

                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>

                            <thead><tr style={{ background: '#eceff1' }}><th style={{ padding: 6 }}>Descrição</th><th style={{ padding: 6 }}>Data</th><th style={{ padding: 6 }}>Status</th><th style={{ padding: 6 }}>Observação</th></tr></thead>

                            <tbody>

                                {(agendQ.data as unknown[] ?? []).length === 0 ? <tr><td colSpan={4} style={{ padding: 12, textAlign: 'center', color: '#777' }}>{agendQ.isLoading ? 'Carregando...' : 'Nenhum registro'}</td></tr> :

                                    (agendQ.data as unknown as Record<string, unknown>[]).map((r: Record<string, unknown>, i: number) => (

                                        <tr key={i} style={{ borderTop: '1px solid #eee' }}>

                                            <td style={{ padding: 6 }}>{String(r.descricao ?? '')}</td>

                                            <td style={{ padding: 6 }}>{formatDateTime(r.data)}</td>

                                            <td style={{ padding: 6 }}>{String(r.statusDescricao ?? '')}</td>

                                            <td style={{ padding: 6, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={String(r.observacao ?? '')}>{String(r.observacao ?? '')}</td>

                                        </tr>

                                    ))}

                            </tbody>

                        </table>

                        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}><button disabled={detailPage === 0} onClick={() => setDetailPage(p => Math.max(0, p - 1))}>Anterior</button><span style={{ fontSize: 12 }}>Pág {detailPage + 1}</span><button onClick={() => setDetailPage(p => p + 1)}>Próxima</button></div>

                    </DetailModal>

                )}



                {modal === 'trocaPri' && (

                    <div className="modal-overlay" onClick={() => setModal(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>

                        <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: 8, padding: 16, minWidth: 420, maxWidth: 500 }}>

                            <h3>Troca da fila prioritária</h3>

                            <p style={{ fontSize: 13, color: '#555' }}>Transferir toda fila prioritária de um operador para outro.</p>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 10 }}>

                                <label>Do operador<div style={{ marginTop: 4 }}><AutoComplete value={selOperador} onChange={setSelOperador} fetchOptions={fetchOperador} placeholder="De" /></div></label>

                                <label>Para operador<div style={{ marginTop: 4 }}><AutoComplete value={selOperador2} onChange={setSelOperador2} fetchOptions={fetchOperador} placeholder="Para" /></div></label>

                            </div>

                            <div style={{ display: 'flex', gap: 8, marginTop: 16, justifyContent: 'flex-end' }}>

                                <button onClick={() => setModal(null)} style={{ padding: '6px 12px', background: '#e0e0e0', border: 0, borderRadius: 4 }}>Cancelar</button>

                                <button onClick={handleTrocaPri} style={{ padding: '6px 12px', background: '#1976d2', color: '#fff', border: 0, borderRadius: 4 }}>Confirmar</button>

                            </div>

                        </div>

                    </div>

                )}



                {modal === 'trocaLig' && (

                    <div className="modal-overlay" onClick={() => setModal(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>

                        <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: 8, padding: 16, minWidth: 420 }}>

                            <h3>Redistribuir ligação - {selOperador?.label ?? modalOperador?.login ?? ''}</h3>

                            <p style={{ fontSize: 13, color: '#555' }}>Distribui a fila de ligações pendentes do operador entre os demais operadores do coordenador.</p>

                            <div style={{ marginTop: 10 }}>

                                <label>Do operador<div style={{ marginTop: 4 }}><AutoComplete value={selOperador} onChange={setSelOperador} fetchOptions={fetchOperador} placeholder="Operador origem" /></div></label>

                            </div>

                            <div style={{ display: 'flex', gap: 8, marginTop: 16, justifyContent: 'flex-end' }}>

                                <button onClick={() => setModal(null)} style={{ padding: '6px 12px', background: '#e0e0e0', border: 0, borderRadius: 4 }}>Cancelar</button>

                                <button onClick={handleRedistribuir} style={{ padding: '6px 12px', background: '#f9a825', color: '#fff', border: 0, borderRadius: 4 }}>Confirmar</button>

                            </div>

                        </div>

                    </div>

                )}



            </main>

        </PermissionGate>

    );

}



function DetailModal({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {

    return (

        <div className="modal-overlay" onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: 12 }}>

            <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: 8, padding: 16, width: 'min(1100px, 95vw)', maxHeight: '85vh', overflow: 'auto' }}>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>

                    <h3 style={{ margin: 0, fontSize: 15 }}>{title}</h3>

                    <button onClick={onClose} style={{ background: '#e0e0e0', border: 0, borderRadius: 4, padding: '4px 8px' }}><X className="icon" /></button>

                </div>

                {children}

            </div>

        </div>

    );

}

