import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { PermissionGate } from '../permissions';
import { MasterDetail } from '../MasterDetail';
import { UNIDADE_SOURCE, UNIDADE_COLUMNS, UNIDADE_SEARCH } from '../masterDetailSources';
import type { ApiItem } from '../types';
import { api } from '../api';
import { useQuery } from '@tanstack/react-query';

type AcaoForm = {
    idTemp: string;
    tipoCanalId: number | null;
    tipoCanalDescricao?: string;
    estrategiaId: number | null;
    estrategiaDescricao?: string;
    dataInicial: string;
    dataFinal: string;
};

const asRecord = (item: ApiItem) => item as unknown as Record<string, unknown>;

function formatDateInput(dateStr: string) {
    return dateStr;
}

export default function ViewCampanhaFormCampanhaListScreen() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const editId = searchParams.get('id');
    const isEdit = Boolean(editId);

    const [descricao, setDescricao] = useState('');
    const [dataInicial, setDataInicial] = useState('');
    const [meta, setMeta] = useState('');
    const [ativo, setAtivo] = useState(true);
    const [unidades, setUnidades] = useState<ApiItem[]>([]);
    const [acoes, setAcoes] = useState<AcaoForm[]>([]);

    // inline builder states
    const [tipoCanalId, setTipoCanalId] = useState<string>('');
    const [estrategiaId, setEstrategiaId] = useState<string>('');
    const [acaoDataInicial, setAcaoDataInicial] = useState('');
    const [acaoDataFinal, setAcaoDataFinal] = useState('');
    const [estrategiaQuery, setEstrategiaQuery] = useState('');
    const [showEstrategiaSuggestions, setShowEstrategiaSuggestions] = useState(false);

    const [notice, setNotice] = useState('');
    const [saving, setSaving] = useState(false);

    // combos
    const tipoCanalQuery = useQuery({
        queryKey: ['tipoCanalList'],
        queryFn: async () => (await api.get<any[]>('/api/comercial/tipo-canal')).data,
    });
    const estrategiaQueryData = useQuery({
        queryKey: ['estrategiaList', estrategiaQuery],
        queryFn: async () => {
            if (!estrategiaQuery) return (await api.get<any[]>('/api/comercial/estrategia')).data;
            return (await api.get<any[]>(`/api/comercial/estrategia/autocomplete?query=${encodeURIComponent(estrategiaQuery)}`)).data;
        },
        enabled: showEstrategiaSuggestions,
    });

    // estrategia full list for rendering descricao
    const estrategiaListQuery = useQuery({
        queryKey: ['estrategiaFullList'],
        queryFn: async () => (await api.get<any[]>('/api/comercial/estrategia')).data,
    });

    const tipoCanalList: any[] = tipoCanalQuery.data ?? [];
    const estrategiaList: any[] = estrategiaListQuery.data ?? [];

    // load existing campanha
    useEffect(() => {
        if (!editId) return;
        let cancelled = false;
        api.get<any>(`/api/comercial/campanha/${editId}`).then(res => {
            if (cancelled) return;
            const d = res.data;
            setDescricao(d.descricao ?? '');
            // dataInicial is Date, convert to yyyy-MM-dd
            const di = d.dataInicial ?? d.data_inicial;
            if (di) {
                const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(di));
                if (m) setDataInicial(`${m[1]}-${m[2]}-${m[3]}`);
                else {
                    const dt = new Date(String(di));
                    if (!isNaN(dt.getTime())) setDataInicial(`${dt.getFullYear()}-${String(dt.getMonth()+1).padStart(2,'0')}-${String(dt.getDate()).padStart(2,'0')}`);
                }
            }
            setMeta(d.meta != null ? String(d.meta) : '');
            setAtivo(d.ativo ?? d.fl_ativo ?? true);
            // unidades
            const unidadeIds: number[] = d.unidadeIds ?? d.unidades ?? [];
            if (unidadeIds.length > 0) {
                // fetch unidade details via view/unidade/listUnidade then filter
                api.get<any[]>(UNIDADE_SOURCE).then(r => {
                    if (cancelled) return;
                    const all = r.data;
                    const selected = all.filter(u => unidadeIds.includes(Number((u as any).id)));
                    setUnidades(selected);
                }).catch(()=>{});
            }
            // acoes
            const acoesData: any[] = d.acoes ?? [];
            setAcoes(acoesData.map((a, idx) => ({
                idTemp: `existing-${a.id ?? idx}`,
                tipoCanalId: a.tipoCanalId ?? a.id_tipo_canal ?? null,
                tipoCanalDescricao: a.tipoCanalDescricao ?? a.tipo_canal_descricao ?? '',
                estrategiaId: a.estrategiaId ?? a.id_estrategia ?? null,
                estrategiaDescricao: a.estrategiaDescricao ?? a.estrategia_descricao ?? '',
                dataInicial: a.dataInicial ? String(a.dataInicial).slice(0,10) : (a.data_inicial ? String(a.data_inicial).slice(0,10) : ''),
                dataFinal: a.dataFinal ? String(a.dataFinal).slice(0,10) : (a.data_final ? String(a.data_final).slice(0,10) : ''),
            })));
        }).catch(e => setNotice(`Erro ao carregar campanha: ${e?.response?.data?.error ?? e.message}`));
        return () => { cancelled = true; };
    }, [editId]);

    const tipoCanalMap = useMemo(() => {
        const m = new Map<string,string>();
        for (const t of tipoCanalList) m.set(String((t as any).id), String((t as any).descricao ?? (t as any).nome ?? ''));
        return m;
    }, [tipoCanalList]);
    const estrategiaMap = useMemo(() => {
        const m = new Map<string,string>();
        for (const e of estrategiaList) m.set(String((e as any).id), String((e as any).descricao ?? ''));
        return m;
    }, [estrategiaList]);

    const validateAndAddAcao = () => {
        if (!tipoCanalId) { setNotice('Selecione o Tipo de Canal'); return; }
        if (!estrategiaId) { setNotice('Selecione a Estratégia'); return; }
        if (!acaoDataInicial) { setNotice('Data Inicial da ação é obrigatória'); return; }
        if (!acaoDataFinal) { setNotice('Data Final da ação é obrigatória'); return; }
        if (new Date(acaoDataFinal) < new Date(acaoDataInicial)) {
            setNotice('A data final não pode ser anterior a data inicial');
            return;
        }
        if (dataInicial && new Date(acaoDataInicial) < new Date(dataInicial)) {
            setNotice('A Ação de Marketing deve começar após o início da Campanha');
            return;
        }
        const exists = acoes.some(a => String(a.tipoCanalId) === String(tipoCanalId));
        if (exists) {
            setNotice('O tipo de canal escolhido já está contido nesta campanha');
            return;
        }
        if (exists) return;
        const newAcao: AcaoForm = {
            idTemp: `tmp-${Date.now()}`,
            tipoCanalId: Number(tipoCanalId),
            tipoCanalDescricao: tipoCanalMap.get(String(tipoCanalId)) ?? '',
            estrategiaId: Number(estrategiaId),
            estrategiaDescricao: estrategiaMap.get(String(estrategiaId)) ?? '',
            dataInicial: acaoDataInicial,
            dataFinal: acaoDataFinal,
        };
        setAcoes(prev => [...prev, newAcao]);
        setTipoCanalId('');
        setEstrategiaId('');
        setEstrategiaQuery('');
        setAcaoDataInicial('');
        setAcaoDataFinal('');
        setNotice('');
    };

    const removeAcao = (idTemp: string) => setAcoes(prev => prev.filter(a => a.idTemp !== idTemp));

    const updateAcaoField = (idTemp: string, field: keyof AcaoForm, value: string) => {
        setAcoes(prev => prev.map(a => a.idTemp === idTemp ? { ...a, [field]: value } as AcaoForm : a));
    };

    const handleSave = async (continueSaving: boolean) => {
        setNotice('');
        if (!descricao.trim() || descricao.trim().length < 3 || descricao.trim().length > 255) {
            setNotice('Descrição deve ter entre 3 e 255 caracteres'); return;
        }
        if (!dataInicial) { setNotice('Data Inicial é obrigatória'); return; }
        if (!meta || isNaN(Number(meta))) { setNotice('Meta é obrigatória e deve ser numérica'); return; }
        if (unidades.length === 0) { setNotice('Selecione pelo menos uma unidade'); return; }
        if (acoes.length === 0) { setNotice('Selecione pelo menos um Tipo de Canal'); return; }
        // check duplicate tipoCanal
        const tipos = new Set();
        for (const a of acoes) {
            if (tipos.has(String(a.tipoCanalId))) { setNotice('As Ações de Marketing não podem possuir Tipos de Canais repetidos'); return; }
            tipos.add(String(a.tipoCanalId));
            if (new Date(a.dataInicial) < new Date(dataInicial)) { setNotice('A Ação de Marketing deve começar após o início da Campanha'); return; }
            if (new Date(a.dataFinal) < new Date(a.dataInicial)) { setNotice('A data inicial de Ação de Campanha é maior que a data final'); return; }
        }
        if (!isEdit) {
            const yesterday = new Date(); yesterday.setDate(yesterday.getDate()-1); yesterday.setHours(0,0,0,0);
            const campDate = new Date(dataInicial); campDate.setHours(0,0,0,0);
            if (campDate < yesterday) { setNotice('A data inicial não pode ser anterior ao dia de Hoje'); return; }
        }
        setSaving(true);
        const payload = {
            descricao: descricao.trim(),
            meta: Number(meta),
            ativo: isEdit ? ativo : true,
            dataInicial: new Date(dataInicial).toISOString(),
            unidadeIds: unidades.map(u => Number((asRecord(u).id as any))),
            acoes: acoes.map(a => ({
                tipoCanalId: a.tipoCanalId,
                estrategiaId: a.estrategiaId,
                dataInicial: new Date(a.dataInicial).toISOString(),
                dataFinal: new Date(a.dataFinal).toISOString(),
            })),
        };
        try {
            if (isEdit) {
                await api.put(`/api/comercial/campanha/${editId}`, payload);
                setNotice('Campanha atualizada com sucesso!');
            } else {
                await api.post('/api/comercial/campanha', payload);
                setNotice('Campanha criada com sucesso!');
            }
            if (continueSaving) {
                if (!isEdit) {
                    setDescricao(''); setDataInicial(''); setMeta(''); setUnidades([]); setAcoes([]);
                }
            } else {
                setTimeout(()=>navigate('/view/campanha/listCampanha'), 800);
            }
        } catch (e:any) {
            setNotice(`Erro ao salvar: ${e?.response?.data?.error ?? e?.response?.data?.message ?? e.message}`);
        } finally { setSaving(false); }
    };

    return (
        <PermissionGate permission="READ">
            <main>
                <div style={{display:'flex', alignItems:'center', gap:12, marginBottom:12}}>
                    <button className="btn-form-back" onClick={()=>navigate('/view/campanha/listCampanha')}>← Voltar</button>
                    <h1 style={{margin:0}}>Campanha - {isEdit ? `Editar #${editId}` : 'Novo'}</h1>
                </div>

                {notice && <div style={{margin:'8px 0', padding:'8px', background: notice.includes('sucesso') ? '#e6ffe6' : '#ffe6e6', border:'1px solid #ccc'}}>{notice}</div>}

                <div className="div_form" style={{width:'100%', maxWidth:900, margin:'0 auto'}}>
                    <div className="form-title">Campanha</div>
                    <div className="table_form" style={{display:'flex', flexDirection:'column', gap:16, padding:16}}>

                        <div style={{display:'grid', gridTemplateColumns:'180px 1fr', gap:12, alignItems:'center'}}>
                            <label>Id</label>
                            <input className="form-input inputTiny" value={editId ?? ''} disabled style={{maxWidth:100}}/>
                        </div>

                        <div style={{display:'grid', gridTemplateColumns:'180px 1fr', gap:12, alignItems:'center'}}>
                            <label>Descrição *</label>
                            <input className="form-input inputLarge" value={descricao} onChange={e=>setDescricao(e.target.value)} placeholder="Descrição (3-255)" maxLength={255} required/>
                        </div>

                        <div style={{display:'grid', gridTemplateColumns:'180px 1fr', gap:12, alignItems:'center'}}>
                            <label>Data Inicial *</label>
                            <input type="date" className="form-input" style={{maxWidth:180}} value={dataInicial} onChange={e=>setDataInicial(e.target.value)} required/>
                        </div>

                        <div style={{display:'grid', gridTemplateColumns:'180px 1fr', gap:12, alignItems:'center'}}>
                            <label>Meta *</label>
                            <input type="number" className="form-input inputTiny" style={{maxWidth:120}} value={meta} onChange={e=>setMeta(e.target.value)} required/>
                        </div>

                        {isEdit && (
                            <div style={{display:'grid', gridTemplateColumns:'180px 1fr', gap:12, alignItems:'center'}}>
                                <label>Ativo</label>
                                <label style={{display:'flex', alignItems:'center', gap:8}}>
                                    <input type="checkbox" checked={ativo} onChange={e=>setAtivo(e.target.checked)} />
                                    {ativo ? 'Sim' : 'Não'}
                                </label>
                            </div>
                        )}

                        <div style={{marginTop:16}}>
                            <MasterDetail
                                label="Unidade"
                                source={UNIDADE_SOURCE}
                                valueKey="id"
                                searchKeys={UNIDADE_SEARCH}
                                columns={UNIDADE_COLUMNS}
                                items={unidades}
                                onChange={setUnidades}
                            />
                        </div>

                        <div style={{borderTop:'1px solid #ddd', paddingTop:16, marginTop:8}}>
                            <h3 style={{margin:'0 0 12px 0'}}>Ações de Campanha</h3>
                            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, alignItems:'end'}}>
                                <div>
                                    <label className="form-label">Tipo Canal *</label>
                                    <select className="form-input form-select" value={tipoCanalId} onChange={e=>setTipoCanalId(e.target.value)}>
                                        <option value="">-- Selecione --</option>
                                        {tipoCanalList.map((t:any)=><option key={t.id} value={t.id}>{t.descricao}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="form-label">Estratégia *</label>
                                    <div style={{position:'relative'}}>
                                        <input
                                            className="form-input"
                                            value={(() => {
                                                if (estrategiaId && estrategiaMap.has(String(estrategiaId))) return estrategiaMap.get(String(estrategiaId))!;
                                                return estrategiaQuery;
                                            })()}
                                            onChange={e=>{
                                                const val = e.target.value;
                                                setEstrategiaQuery(val);
                                                setEstrategiaId('');
                                                setShowEstrategiaSuggestions(true);
                                            }}
                                            onFocus={()=>setShowEstrategiaSuggestions(true)}
                                            placeholder="Digite para buscar estratégia"
                                        />
                                        {showEstrategiaSuggestions && (estrategiaQuery || estrategiaList.length>0) && (
                                            <ul style={{position:'absolute', zIndex:10, background:'#fff', border:'1px solid #ccc', width:'100%', maxHeight:150, overflowY:'auto', listStyle:'none', margin:0, padding:0}}>
                                                {(estrategiaList.filter((es:any)=> !estrategiaQuery || String(es.descricao).toLowerCase().includes(estrategiaQuery.toLowerCase())).slice(0,10)).map((es:any)=>(
                                                    <li key={es.id}>
                                                        <button type="button" style={{width:'100%', textAlign:'left', padding:'6px 8px', border:'none', background:'transparent', cursor:'pointer'}} onClick={()=>{
                                                            setEstrategiaId(String(es.id));
                                                            setEstrategiaQuery(String(es.descricao));
                                                            setShowEstrategiaSuggestions(false);
                                                        }}>
                                                            {es.descricao}
                                                        </button>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <label className="form-label">Data Inicial *</label>
                                    <input type="date" className="form-input" value={acaoDataInicial} onChange={e=>setAcaoDataInicial(e.target.value)} />
                                </div>
                                <div>
                                    <label className="form-label">Data Final *</label>
                                    <input type="date" className="form-input" value={acaoDataFinal} onChange={e=>setAcaoDataFinal(e.target.value)} />
                                </div>
                                <div style={{gridColumn:'span 2'}}>
                                    <button type="button" className="btnblue" style={{padding:'6px 12px'}} onClick={validateAndAddAcao}>+ Adicionar</button>
                                </div>
                            </div>

                            <table style={{width:'100%', marginTop:16}}>
                                <thead>
                                    <tr>
                                        <th style={{width:'5%'}}></th>
                                        <th style={{width:'15%'}}>Data Inicial</th>
                                        <th style={{width:'15%'}}>Data Final</th>
                                        <th style={{width:'20%'}}>Tipo Canal</th>
                                        <th style={{width:'40%'}}>Estratégia</th>
                                        <th style={{width:'5%'}}></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {acoes.length===0 ? <tr><td colSpan={6} style={{textAlign:'center', padding:12}}>Nenhum registro selecionado.</td></tr>
                                    : acoes.map(a=>(
                                        <tr key={a.idTemp}>
                                            <td>✎</td>
                                            <td><input type="date" className="form-input" value={a.dataInicial} onChange={e=>updateAcaoField(a.idTemp,'dataInicial', e.target.value)} style={{width:140}}/></td>
                                            <td><input type="date" className="form-input" value={a.dataFinal} onChange={e=>updateAcaoField(a.idTemp,'dataFinal', e.target.value)} style={{width:140}}/></td>
                                            <td>{a.tipoCanalDescricao || tipoCanalMap.get(String(a.tipoCanalId)) || a.tipoCanalId}</td>
                                            <td>{a.estrategiaDescricao || estrategiaMap.get(String(a.estrategiaId)) || a.estrategiaId}</td>
                                            <td><button type="button" className="btnred" style={{padding:'4px 8px'}} onClick={()=>removeAcao(a.idTemp)} title="Remover">−</button></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="form-footer" style={{display:'flex', gap:8, justifyContent:'flex-end', marginTop:16}}>
                            <button type="button" className="btn-form-back" onClick={()=>navigate('/view/campanha/listCampanha')}>Voltar</button>
                            <button type="button" className="btn-form-save" disabled={saving} onClick={()=>handleSave(false)}>{saving ? 'Salvando...' : 'Salvar'}</button>
                            <button type="button" className="btn-form-save" disabled={saving} onClick={()=>handleSave(true)} style={{background:'#1976d2', color:'#fff'}}>{saving ? 'Salvando...' : 'Salvar e Continuar'}</button>
                        </div>
                    </div>
                </div>
            </main>
        </PermissionGate>
    );
}
