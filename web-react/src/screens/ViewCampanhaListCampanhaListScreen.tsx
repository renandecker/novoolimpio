import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PermissionGate } from '../permissions';
import { useModulePaged } from '../useModulePaged';
import { api } from '../api';
import { usePermissions } from '../permissions';
import type { ApiItem } from '../types';

const asRecord = (item: ApiItem) => item as unknown as Record<string, unknown>;

const formatDate = (value: unknown): string => {
    if (value === null || value === undefined) return '';
    const str = String(value);
    const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(str);
    if (match) return `${match[3]}/${match[2]}/${match[1]}`;
    // try ISO datetime
    const d = new Date(str);
    if (!isNaN(d.getTime())) return `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}`;
    return str;
};

const toDateInput = (value: unknown) => {
    if (!value) return '';
    const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(value));
    if (m) return `${m[1]}-${m[2]}-${m[3]}`;
    return '';
};

type AcaoRow = {
    id: number;
    tipoCanalId?: number;
    tipoCanalDescricao?: string;
    estrategiaId?: number;
    estrategiaDescricao?: string;
    dataInicial?: string;
    dataFinal?: string;
    id_tipo_canal?: number;
    tipo_canal_descricao?: string;
    id_estrategia?: number;
    estrategia_descricao?: string;
    data_inicial?: string;
    data_final?: string;
};

type UnidadeRow = {
    id: number;
    sucinto?: string;
    CNPJ?: string;
    cnpj?: string;
    razaoSocial?: string;
};

function useCampanhaDetails(campanhaId: number | null, expanded: boolean) {
    const [acoes, setAcoes] = useState<AcaoRow[]>([]);
    const [unidades, setUnidades] = useState<UnidadeRow[]>([]);
    const [loading, setLoading] = useState(false);
    useEffect(() => {
        if (!expanded || campanhaId == null) return;
        let cancelled = false;
        setLoading(true);
        Promise.all([
            api.get<AcaoRow[]>(`/api/comercial/campanha/${campanhaId}/acoes`).then(r => r.data).catch(() => [] as AcaoRow[]),
            api.get<UnidadeRow[]>(`/api/comercial/campanha/${campanhaId}/unidades`).then(r => r.data).catch(() => [] as UnidadeRow[]),
        ]).then(([a, u]) => {
            if (!cancelled) {
                setAcoes(a);
                setUnidades(u);
            }
        }).finally(() => { if (!cancelled) setLoading(false); });
        return () => { cancelled = true; };
    }, [campanhaId, expanded]);
    return { acoes, unidades, loading };
}

export default function ViewCampanhaListCampanhaListScreen() {
    const navigate = useNavigate();
    const { can } = usePermissions();
    const [page, setPage] = useState(0);
    const [size, setSize] = useState(10);
    const [expanded, setExpanded] = useState<Record<string, boolean>>({});
    const [modalPrioritaria, setModalPrioritaria] = useState<ApiItem | null>(null);
    const [modalOutros, setModalOutros] = useState<ApiItem | null>(null);
    const [notice, setNotice] = useState('');
    const [filterDescricao, setFilterDescricao] = useState('');
    const [filterAtivo, setFilterAtivo] = useState<'all' | 'true' | 'false'>('all');
    const [filterMeta, setFilterMeta] = useState('');
    const [filterDataInicial, setFilterDataInicial] = useState('');

    const q = useModulePaged('/api/view/campanha/listCampanha', page, size);
    const items = q.data?.content ?? [];
    const totalElements = q.data?.totalElements ?? 0;
    const totalPages = Math.max(1, q.data?.totalPages ?? 1);

    const filtered = items.filter(item => {
        const r = asRecord(item);
        if (filterDescricao && !String(r.descricao ?? '').toLowerCase().includes(filterDescricao.toLowerCase())) return false;
        if (filterAtivo !== 'all') {
            const ativo = r.fl_ativo ?? r.ativo;
            const isAtivo = ativo === true || ativo === 'true' || ativo === 1;
            if (filterAtivo === 'true' && !isAtivo) return false;
            if (filterAtivo === 'false' && isAtivo) return false;
        }
        if (filterMeta && String(r.meta ?? '') !== filterMeta) return false;
        if (filterDataInicial) {
            const d = toDateInput(r.data_inicial ?? r.dataInicial);
            if (d !== filterDataInicial) return false;
        }
        return true;
    });

    const canCreate = can('CREATE');
    const canUpdate = can('UPDATE');
    const canDelete = can('DELETE');
    const canExecute = can('EXECUTE') || can('UPDATE');

    const handleDelete = async (item: ApiItem) => {
        if (!confirm(`Deseja realmente desativar a campanha #${item.id}?`)) return;
        try {
            await api.delete(`/api/comercial/campanha/${item.id}`);
            setNotice(`Campanha #${item.id} desativada com sucesso.`);
            q.refetch();
        } catch (e: any) {
            setNotice(`Erro ao desativar: ${e?.response?.data?.error ?? e.message}`);
        }
    };

    const handleFinalizar = async (item: ApiItem, outros: boolean) => {
        try {
            const path = outros ? `/api/comercial/campanha/${item.id}/finalizar-prioritaria-outros` : `/api/comercial/campanha/${item.id}/finalizar-prioritaria`;
            const res = await api.post(path);
            setNotice(String((res.data as any)?.message ?? 'Operação concluída.'));
        } catch (e: any) {
            setNotice(`Erro: ${e?.response?.data?.error ?? e.message}`);
        } finally {
            setModalPrioritaria(null);
            setModalOutros(null);
        }
    };

    return (
        <PermissionGate permission="READ">
            <main>
                <h1>Campanha</h1>
                {notice && <div className="data-table-notice" style={{margin:'8px 0', padding:'8px', background:'#eef', border:'1px solid #ccd'}}>{notice}</div>}

                <div className="data-table-toolbar" style={{display:'flex', gap:8, flexWrap:'wrap', marginBottom:12}}>
                    {canCreate && <button className="btn-primary btnstop" onClick={() => navigate('/view/campanha/formCampanha')}>Novo</button>}
                    <input placeholder="Filtrar descrição" value={filterDescricao} onChange={e=>setFilterDescricao(e.target.value)} className="form-input" style={{maxWidth:200}}/>
                    <input type="date" value={filterDataInicial} onChange={e=>setFilterDataInicial(e.target.value)} className="form-input" style={{maxWidth:180}}/>
                    <input placeholder="Meta" type="number" value={filterMeta} onChange={e=>setFilterMeta(e.target.value)} className="form-input" style={{maxWidth:120}}/>
                    <select value={filterAtivo} onChange={e=>setFilterAtivo(e.target.value as any)} className="form-input form-select" style={{maxWidth:140}}>
                        <option value="all">Todos (Ativo)</option>
                        <option value="true">Ativo = Sim</option>
                        <option value="false">Ativo = Não</option>
                    </select>
                </div>

                {q.isError ? <p>Erro ao carregar os dados.</p> : (
                <table>
                    <thead>
                        <tr>
                            <th className="col-toggle" style={{width:'5%'}}></th>
                            <th style={{width:'10%'}}>Id</th>
                            <th style={{width:'35%'}}>Descrição</th>
                            <th style={{width:'10%'}}>Data Inicial</th>
                            <th style={{width:'10%', textAlign:'center'}}>Ativo</th>
                            <th style={{width:'10%'}}>Meta</th>
                            <th style={{width:90, textAlign:'right'}}>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {q.isLoading && items.length===0 ? <tr><td colSpan={7}>Carregando...</td></tr>
                        : filtered.length===0 ? <tr><td colSpan={7}>Nenhum registro encontrado.</td></tr>
                        : filtered.flatMap(item => {
                            const rowKey = String(item.id);
                            const isOpen = Boolean(expanded[rowKey]);
                            const r = asRecord(item);
                            const ativoVal = r.fl_ativo ?? r.ativo;
                            const isAtivo = ativoVal === true || ativoVal === 1 || ativoVal === 'true';
                            const dataInicial = r.data_inicial ?? r.dataInicial;
                            // check tem acoes ativas via data_final >= today would be done in expansion; for button we allow always but disable if not ativo
                            const row = (
                                <tr key={`${rowKey}-row`}>
                                    <td className="col-toggle">
                                        <button type="button" className="btn-row-toggle" onClick={()=>setExpanded(prev=>({...prev, [rowKey]: !prev[rowKey]}))}>
                                            {isOpen ? '▾' : '▸'}
                                        </button>
                                    </td>
                                    <td>{item.id}</td>
                                    <td>{String(r.descricao ?? '')}</td>
                                    <td>{formatDate(dataInicial)}</td>
                                    <td style={{textAlign:'center'}}>{isAtivo ? 'Sim' : 'Não'}</td>
                                    <td>{String(r.meta ?? '')}</td>
                                    <td style={{textAlign:'right', display:'flex', gap:4, justifyContent:'flex-end'}}>
                                        <button
                                            title="Gerar Pacote"
                                            className="btn-action btnorange"
                                            disabled={!isAtivo}
                                            style={{opacity: !isAtivo ? 0.5 : 1}}
                                            onClick={()=>navigate(`/view/campanha/formGerarPacotes?campanhaId=${item.id}`)}
                                        >
                                            <i className="fa fa-folder-open" />📦
                                        </button>
                                        <button title="Finaliza ligação prioritária desta campanha" className="btn-action btnblack" style={{background:'#333', color:'#fff'}} onClick={()=>setModalPrioritaria(item)}>↩</button>
                                        <button title="Finaliza ligação prioritária das outras campanhas" className="btn-action btnbrown" style={{background:'#8B4513', color:'#fff'}} onClick={()=>setModalOutros(item)}>⇄</button>
                                        {canUpdate && <button className="btn-action btngreen" title="Editar" onClick={()=>navigate(`/view/campanha/formCampanha?id=${item.id}`)}>✎</button>}
                                        {canDelete && <button className="btn-action btn-danger" title="Desativar" onClick={()=>handleDelete(item)}>✕</button>}
                                    </td>
                                </tr>
                            );
                            if (!isOpen) return [row];
                            return [row, <CampanhaExpansion key={`${rowKey}-exp`} campanhaId={item.id as number} />];
                        })}
                    </tbody>
                    <tfoot>
                        <tr>
                            <td colSpan={7} className="data-table-paginator">
                                <button onClick={()=>setPage(c=>Math.max(0,c-1))} disabled={page===0 || q.isFetching}>Anterior</button>
                                <span> Página {page+1} de {totalPages} </span>
                                <button onClick={()=>setPage(c=>Math.min(totalPages-1,c+1))} disabled={page>=totalPages-1 || q.isFetching}>Próxima</button>
                                <label> Registros por página
                                    <select value={size} onChange={e=>{setSize(Number(e.target.value)); setPage(0);}}>
                                        {[10,20,50,100].map(o=><option key={o} value={o}>{o}</option>)}
                                    </select>
                                </label>
                                <span>Total: {totalElements}</span>
                            </td>
                        </tr>
                    </tfoot>
                </table>
                )}

                {modalPrioritaria && (
                    <div className="modal-overlay" onClick={()=>setModalPrioritaria(null)}>
                        <div className="modal" onClick={e=>e.stopPropagation()} style={{maxWidth:320}}>
                            <h3>Finalizar Atendimento</h3>
                            <p>Você tem certeza que deseja finalizar as filas prioritárias desta campanha ?</p>
                            <p><small>Observação: Vai finalizar referente as UNIDADES desta campanha !</small></p>
                            <div className="modal-actions">
                                <button className="btnblue" onClick={()=>handleFinalizar(modalPrioritaria, false)}>Sim</button>
                                <button className="btnred" onClick={()=>setModalPrioritaria(null)}>Não</button>
                            </div>
                        </div>
                    </div>
                )}
                {modalOutros && (
                    <div className="modal-overlay" onClick={()=>setModalOutros(null)}>
                        <div className="modal" onClick={e=>e.stopPropagation()} style={{maxWidth:320}}>
                            <h3>Finalizar Atendimento</h3>
                            <p>Você tem certeza que deseja finalizar as filas prioritárias das outras campanhas ?</p>
                            <p><small>Observação: Vai finalizar referente as UNIDADES desta campanha e campanhas anteriores a esta!</small></p>
                            <div className="modal-actions">
                                <button className="btnblue" onClick={()=>handleFinalizar(modalOutros, true)}>Sim</button>
                                <button className="btnred" onClick={()=>setModalOutros(null)}>Não</button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </PermissionGate>
    );
}

function CampanhaExpansion({ campanhaId }: { campanhaId: number }) {
    const { acoes, unidades, loading } = useCampanhaDetails(campanhaId, true);
    if (loading) return <tr className="row-detail"><td colSpan={7}>Carregando detalhes...</td></tr>;
    return (
        <tr className="row-detail">
            <td colSpan={7}>
                <div style={{display:'grid', gridTemplateColumns:'2fr 1fr', gap:16}}>
                    <div>
                        <table style={{width:'100%'}}>
                            <thead><tr><th colSpan={4} style={{textAlign:'center', background:'#f5f5f5'}}>Ação de Campanha</th></tr>
                                <tr><th>Tipo Canal</th><th>Estratégia</th><th>Data Inicial</th><th>Data Final</th></tr>
                            </thead>
                            <tbody>
                                {acoes.length===0 ? <tr><td colSpan={4} style={{textAlign:'center'}}>Nenhum registro</td></tr>
                                : acoes.map((a, idx)=>(
                                    <tr key={idx}>
                                        <td>{String(a.tipoCanalDescricao ?? (a as any).tipo_canal_descricao ?? (a as any).id_tipo_canal ?? '')}</td>
                                        <td>{String(a.estrategiaDescricao ?? (a as any).estrategia_descricao ?? (a as any).id_estrategia ?? '')}</td>
                                        <td>{formatDate((a as any).dataInicial ?? (a as any).data_inicial)}</td>
                                        <td>{formatDate((a as any).dataFinal ?? (a as any).data_final)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div>
                        <table style={{width:'100%'}}>
                            <thead><tr><th colSpan={2} style={{textAlign:'center', background:'#f5f5f5'}}>Unidades</th></tr>
                                <tr><th>Sucinto</th><th>CNPJ</th></tr>
                            </thead>
                            <tbody>
                                {unidades.length===0 ? <tr><td colSpan={2} style={{textAlign:'center'}}>Nenhum registro</td></tr>
                                : unidades.map((u, idx)=>(
                                    <tr key={idx}>
                                        <td>{String(u.sucinto ?? '')}</td>
                                        <td>{String(u.CNPJ ?? u.cnpj ?? '')}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </td>
        </tr>
    );
}
