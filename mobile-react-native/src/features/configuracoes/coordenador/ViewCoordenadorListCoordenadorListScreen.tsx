import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { api } from '../api';
import { AutoComplete, type AutoCompleteOption } from '../AutoComplete';
import { Colors, Spacing, BorderRadius, Typography } from '../theme';

type CoordenadorRow = {
    id: number; id_operador: number; id_coordenador: number; data: string;
    ligacao: number; meta: number; agendado: number; pausa: number; prioritario: number;
    operador_login: string; operador_descricao: string; coordenador_login: string; coordenador_descricao: string;
};
type PagedResp = { content: CoordenadorRow[]; totalElements: number; totalPages: number; page: number; size: number };
const PAGE_SIZES = [10, 20, 50, 100];
const formatDate = (v: unknown) => {
    if (!v) return '';
    const s = String(v);
    const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(s);
    if (m) return `${m[3]}/${m[2]}/${m[1]}`;
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
    const segs = Math.round(diffMin * 60);
    const min = Math.floor(segs / 60); const seg = segs % 60;
    const hora = Math.floor(min / 60); const minR = min % 60;
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
    const [pieTitle, setPieTitle] = useState('Ligações de Todos Operadores');
    const [pieUsuarios, setPieUsuarios] = useState<{id: number; login: string}[]>([]);
    const [pieUsuarioSelecionado, setPieUsuarioSelecionado] = useState<number | null>(null);
    const [detailPage, setDetailPage] = useState(0);
    const [enriched, setEnriched] = useState<Record<number, { turno: string; situacao: string }>>({});

    const q = useQuery({
        queryKey: ['coordenador-paged-m', page, size, filtros],
        queryFn: async () => {
            try {
                const res = await api.get<PagedResp>('/api/central/coordenador/paged-enriched', { params: { page, size, operadorLogin: filtros.operadorLogin || undefined, coordenadorLogin: filtros.coordenadorLogin || undefined, data: filtros.data || undefined } });
                return res.data;
            } catch {
                const res = await api.get<PagedResp>('/api/view/coordenador/listCoordenador/paged', { params: { page, size } });
                const content = (res.data.content as unknown as Record<string, unknown>[]).map(r => ({
                    id: Number(r.id), id_operador: Number(r.id_operador ?? 0), id_coordenador: Number(r.id_coordenador ?? 0),
                    data: String(r.data ?? ''), ligacao: Number(r.ligacao ?? 0), meta: Number(r.meta ?? 0), agendado: Number(r.agendado ?? 0), pausa: Number(r.pausa ?? 0), prioritario: Number(r.prioritario ?? 0),
                    operador_login: String(r.operador_login ?? r.operador_descricao ?? ''), operador_descricao: String(r.operador_descricao ?? ''),
                    coordenador_login: String(r.coordenador_login ?? ''), coordenador_descricao: String(r.coordenador_descricao ?? ''),
                } as CoordenadorRow));
                return { content, totalElements: res.data.totalElements ?? content.length, totalPages: res.data.totalPages ?? 1, page, size } as PagedResp;
            }
        },
    });
    const items = q.data?.content ?? [];
    const totalPages = q.data?.totalPages ?? 1;
    const totalElements = q.data?.totalElements ?? 0;

    useEffect(() => {
        if (!items.length) return;
        items.forEach(row => {
            if (enriched[row.id]) return;
            Promise.all([
                api.get<string>(`/api/central/coordenador/${row.id_operador}/turnos`).then(r=>r.data).catch(()=>''),
                api.get<string>(`/api/central/coordenador/${row.id_operador}/situacao`).then(r=>r.data).catch(()=>''),
            ]).then(([turno, situacao]) => setEnriched(prev => ({ ...prev, [row.id]: { turno: String(turno ?? ''), situacao: String(situacao ?? '') } })));
        });
    }, [items]);

    const ligacoesQ = useQuery({
        queryKey: ['coord-ligacoes-m', modalOperador?.id, detailPage, modal],
        queryFn: async () => { if (!modalOperador) return []; const r = await api.get(`/api/central/coordenador/${modalOperador.id}/ligacoes`, { params: { page: detailPage, size: 10 } }); return r.data as unknown[]; },
        enabled: modal !== null && modalOperador !== null && (modal === 'ligacao' || modal === 'ligacaoCoord'),
    });
    const ordemQ = useQuery({
        queryKey: ['coord-ordem-m', modalOperador?.id, detailPage],
        queryFn: async () => { if (!modalOperador) return []; const r = await api.get(`/api/central/coordenador/${modalOperador.id}/ordem-ligacoes`, { params: { page: detailPage, size: 10 } }); return r.data as unknown[]; },
        enabled: modal === 'ordem' && modalOperador !== null,
    });
    const prioriQ = useQuery({
        queryKey: ['coord-priori-m', modalOperador?.id, detailPage],
        queryFn: async () => { if (!modalOperador) return []; const r = await api.get(`/api/central/coordenador/${modalOperador.id}/fila-prioritaria`, { params: { page: detailPage, size: 10 } }); return r.data as unknown[]; },
        enabled: (modal === 'prioritaria' || modal === 'prioritariaCoord') && modalOperador !== null,
    });
    const pausaQ = useQuery({
        queryKey: ['coord-pausa-m', modalOperador?.id, detailPage],
        queryFn: async () => { if (!modalOperador) return []; const r = await api.get(`/api/central/coordenador/${modalOperador.id}/pausas`, { params: { page: detailPage, size: 10 } }); return r.data as unknown[]; },
        enabled: (modal === 'pausa' || modal === 'pausaCoord') && modalOperador !== null,
    });
    const agendQ = useQuery({
        queryKey: ['coord-agend-m', modalOperador?.id, detailPage],
        queryFn: async () => { if (!modalOperador) return []; const r = await api.get(`/api/central/coordenador/${modalOperador.id}/compromissos`, { params: { page: detailPage, size: 10 } }); return r.data as unknown[]; },
        enabled: modal === 'agend' && modalOperador !== null,
    });

    const handlePausar = async (row: CoordenadorRow) => {
        try { await api.post(`/api/central/coordenador/${row.id_operador}/pausar`); setNotice(`Pausa solicitada para ${row.operador_login}`); q.refetch(); }
        catch (e: unknown) { const msg = (e as { response?: { data?: { error?: string } } })?.response?.data?.error ?? (e as Error).message; setNotice(`Erro ao pausar: ${msg}`); }
    };
    const handleDespausar = async (row: CoordenadorRow) => {
        try { await api.post(`/api/central/coordenador/${row.id_operador}/despausar`); setNotice(`Pausa removida para ${row.operador_login}`); q.refetch(); }
        catch (e: unknown) { const msg = (e as { response?: { data?: { error?: string } } })?.response?.data?.error ?? (e as Error).message; setNotice(`Erro ao despausar: ${msg}`); }
    };
    const handlePie = async (row: CoordenadorRow) => {
        setModalOperador({ id: row.id_operador, login: row.operador_login });
        try {
            const [users, pie] = await Promise.all([
                api.get<{id: number; login: string}[]>(`/api/central/coordenador/${row.id_operador}/usuarios`),
                api.get<Record<string, number>>(`/api/central/coordenador/${row.id_operador}/pie`),
            ]);
            setPieUsuarios(users.data ?? []);
            setPieData(pie.data ?? {});
            setPieTitle(`Ligações de ${row.operador_login}`);
            setPieUsuarioSelecionado(null);
        } catch { setPieData({ total: 0 }); }
        setModal('pie');
    };

    const onPieUsuarioChange = async (usuarioId: number | null) => {
        if (!modalOperador) return;
        setPieUsuarioSelecionado(usuarioId);
        try {
            if (usuarioId) {
                const pie = await api.get<Record<string, number>>(`/api/central/coordenador/${modalOperador.id}/pie?usuarioId=${usuarioId}`);
                setPieData(pie.data ?? {});
                const user = pieUsuarios.find(u => u.id === usuarioId);
                setPieTitle(user ? `Ligações do(a): ${user.login}` : 'Ligações de Todos Operadores');
            } else {
                const pie = await api.get<Record<string, number>>(`/api/central/coordenador/${modalOperador.id}/pie`);
                setPieData(pie.data ?? {});
                setPieTitle('Ligações de Todos Operadores');
            }
        } catch (e) {
            console.error('Erro ao buscar ligações por usuário', e);
        }
    };
    const handleTrocaPri = async () => {
        if (!selOperador || !selOperador2) { setNotice('Selecione Do e Para operador'); return; }
        try { await api.post('/api/central/coordenador/troca-prioritaria', null, { params: { de: selOperador.id, para: selOperador2.id } }); setNotice(`Fila transferida de ${selOperador.label} para ${selOperador2.label}`); setModal(null); }
        catch (e: unknown) { const msg = (e as { response?: { data?: { error?: string } } })?.response?.data?.error ?? (e as Error).message; setNotice(`Erro troca: ${msg}`); }
    };
    const handleRedistribuir = async () => {
        const opId = selOperador?.id ?? modalOperador?.id;
        const opLabel = selOperador?.label ?? modalOperador?.login;
        if (!opId) { setNotice('Selecione o operador'); return; }
        try { await api.post(`/api/central/coordenador/${opId}/redistribuir`); setNotice(`Fila redistribuída para ${opLabel}`); setModal(null); }
        catch (e: unknown) { const msg = (e as { response?: { data?: { error?: string } } })?.response?.data?.error ?? (e as Error).message; setNotice(`Erro redistribuir: ${msg}`); }
    };
    const syncModalOpt = (opt: AutoCompleteOption | null) => {
        setModalOperadorOpt(opt);
        if (opt) { setModalOperador({ id: opt.id, login: opt.label }); setDetailPage(0); } else setModalOperador(null);
    };

    if (q.isLoading) return <View style={styles.center}><ActivityIndicator color={Colors.primary} size="large" /></View>;
    if (q.isError) return <View style={styles.center}><Text style={styles.errorText}>Erro ao carregar</Text></View>;

    return (
        <View style={styles.page}>
            <Text style={styles.title}>Coordenador</Text>
            {notice ? <Text style={styles.notice}>{notice}</Text> : null}

            <View style={styles.toolbar}>
                <Pressable style={[styles.tbBtn, { backgroundColor: '#1976d2' }]} onPress={() => { if (selOperador) setModalOperador({ id: selOperador.id, login: selOperador.label }); setDetailPage(0); setModal('prioritariaCoord'); }}><Text style={styles.tbText}>★ Prioritária</Text></Pressable>
                <Pressable style={[styles.tbBtn, { backgroundColor: '#37474f' }]} onPress={() => { if (selOperador) setModalOperador({ id: selOperador.id, login: selOperador.label }); setDetailPage(0); setModal('ligacaoCoord'); }}><Text style={styles.tbText}>☎ Ligação</Text></Pressable>
                <Pressable style={[styles.tbBtn, { backgroundColor: '#8d6e63' }]} onPress={() => { if (selOperador) setModalOperador({ id: selOperador.id, login: selOperador.label }); setDetailPage(0); setModal('ordem'); }}><Text style={styles.tbText}>☰ Pendente</Text></Pressable>
                <Pressable style={[styles.tbBtn, { backgroundColor: '#c62828' }]} onPress={() => { if (selOperador) setModalOperador({ id: selOperador.id, login: selOperador.label }); setDetailPage(0); setModal('pausaCoord'); }}><Text style={styles.tbText}>⏸ Pausa</Text></Pressable>
                <Pressable style={[styles.tbBtn, { backgroundColor: '#2e7d32' }]} onPress={() => { if (selOperador) setModalOperador({ id: selOperador.id, login: selOperador.label }); setDetailPage(0); setModal('agend'); }}><Text style={styles.tbText}>📅 Agend</Text></Pressable>
                <Pressable style={[styles.tbBtn, { backgroundColor: '#f9a825' }]} onPress={() => setModal('trocaLig')}><Text style={styles.tbText}>⇄ Redistribuir</Text></Pressable>
                <Pressable style={[styles.tbBtn, { backgroundColor: '#212121' }]} onPress={() => setModal('trocaPri')}><Text style={styles.tbText}>⇄ Troca Pri</Text></Pressable>
                <Pressable style={[styles.tbBtn, { backgroundColor: '#607d8b' }]} onPress={() => setShowFiltros(v=>!v)}><Text style={styles.tbText}>🔍 Filtros</Text></Pressable>
            </View>

            <Text style={styles.label}>Operador selecionado:</Text>
            <AutoComplete value={selOperador} onChange={setSelOperador} fetchOptions={fetchOperador} placeholder="Buscar operador por login" />

            {showFiltros && (
                <View style={styles.filterBox}>
                    <TextInput style={styles.input} placeholder="Operador login" value={filtros.operadorLogin} onChangeText={t=>setFiltros(s=>({...s, operadorLogin:t}))} />
                    <TextInput style={styles.input} placeholder="Coordenador login" value={filtros.coordenadorLogin} onChangeText={t=>setFiltros(s=>({...s, coordenadorLogin:t}))} />
                    <TextInput style={styles.input} placeholder="Data (YYYY-MM-DD)" value={filtros.data} onChangeText={t=>setFiltros(s=>({...s, data:t}))} />
                    <View style={styles.filterActions}>
                        <Pressable style={styles.primaryBtn} onPress={()=>{ setPage(0); q.refetch(); }}><Text style={styles.primaryText}>Pesquisar</Text></Pressable>
                        <Pressable style={styles.secondaryBtn} onPress={()=>{ setFiltros({ operadorLogin:'', coordenadorLogin:'', data:'' }); setPage(0); }}><Text style={styles.secondaryText}>Limpar</Text></Pressable>
                    </View>
                    <Text style={styles.pageInfo}>Total: {totalElements} • Página {page+1} de {totalPages}</Text>
                </View>
            )}

            <FlatList
                data={items}
                keyExtractor={item=>String(item.id)}
                refreshing={q.isFetching}
                onRefresh={()=>q.refetch()}
                renderItem={({item}) => {
                    const en = enriched[item.id] ?? { turno:'', situacao:'' };
                    return (
                        <View style={styles.card}>
                            <View style={styles.cardHeader}><Text style={styles.cardTitle}>{item.operador_login}</Text><Text style={styles.cardId}>#{item.id}</Text></View>
                            <Text style={styles.cardMeta}>Coord: {item.coordenador_login} • Data: {formatDate(item.data)}</Text>
                            <Text style={styles.cardMeta}>Turno: {en.turno || '—'}</Text>
                            <View style={styles.badges}>
                                <Text style={styles.badge}>Meta {item.meta ?? 0}</Text>
                                <Text style={styles.badge}>Agend {item.agendado ?? 0}</Text>
                                <Text style={styles.badge}>Lig {item.ligacao ?? 0}</Text>
                                <Text style={styles.badge}>Pausa {item.pausa ?? 0}</Text>
                                <Text style={styles.badge}>Pri {item.prioritario ?? 0}</Text>
                                <Text style={[styles.badge, { backgroundColor: en.situacao==='Pausa' ? '#ffebee' : en.situacao==='Acessando' ? '#e8f5e9' : '#f5f5f5' }]}>{en.situacao || '—'}</Text>
                            </View>
                            <View style={styles.actionsRow}>
                                <Pressable style={[styles.actionBtn, {backgroundColor:'#7b1fa2'}]} onPress={()=>handlePie(item)}><Text style={styles.actionText}>◉</Text></Pressable>
                                <Pressable style={[styles.actionBtn, {backgroundColor:'#1976d2'}]} onPress={()=>{ setModalOperador({id:item.id_operador, login:item.operador_login}); setModalOperadorOpt({id:item.id_operador, label:item.operador_login}); setModal('prioritaria'); }}><Text style={styles.actionText}>★</Text></Pressable>
                                <Pressable style={[styles.actionBtn, {backgroundColor:'#37474f'}]} onPress={()=>{ setModalOperador({id:item.id_operador, login:item.operador_login}); setModalOperadorOpt({id:item.id_operador, label:item.operador_login}); setModal('ligacao'); }}><Text style={styles.actionText}>☎</Text></Pressable>
                                <Pressable style={[styles.actionBtn, {backgroundColor:'#c62828'}]} onPress={()=>{ setModalOperador({id:item.id_operador, login:item.operador_login}); setModalOperadorOpt({id:item.id_operador, label:item.operador_login}); setModal('pausa'); }}><Text style={styles.actionText}>⏸</Text></Pressable>
                                <Pressable style={[styles.actionBtn, {backgroundColor:'#2e7d32'}]} onPress={()=>{ setModalOperador({id:item.id_operador, login:item.operador_login}); setModalOperadorOpt({id:item.id_operador, label:item.operador_login}); setModal('agend'); }}><Text style={styles.actionText}>📅</Text></Pressable>
                                <Pressable style={[styles.actionBtn, {backgroundColor: en.situacao==='Pausa' ? '#1976d2' : '#c62828'}]} onPress={()=> en.situacao==='Pausa' ? handleDespausar(item) : handlePausar(item)}><Text style={styles.actionText}>{en.situacao==='Pausa' ? '▶' : '⏸'}</Text></Pressable>
                                <Pressable style={[styles.actionBtn, {backgroundColor:'#f9a825'}]} onPress={()=>{ setModalOperador({id:item.id_operador, login:item.operador_login}); setModal('ligacao'); }}><Text style={styles.actionText}>○</Text></Pressable>
                            </View>
                        </View>
                    );
                }}
                ListEmptyComponent={<Text style={styles.empty}>Nenhum registro encontrado.</Text>}
            />

            <View style={styles.paginator}>
                <Pressable style={[styles.pageBtn, page===0 && styles.disabled]} disabled={page===0} onPress={()=>setPage(p=>Math.max(0,p-1))}><Text style={styles.pageBtnText}>Anterior</Text></Pressable>
                <Text style={styles.pageInfo}>Pág {page+1} de {totalPages} • Total {totalElements}</Text>
                <Pressable style={[styles.pageBtn, page>=totalPages-1 && styles.disabled]} disabled={page>=totalPages-1} onPress={()=>setPage(p=>Math.min(totalPages-1,p+1))}><Text style={styles.pageBtnText}>Próxima</Text></Pressable>
            </View>

            {/* Modais - usando React Native Modal */}
            <Modal visible={modal==='pie'} transparent animationType="fade" onRequestClose={()=>setModal(null)}>
                <View style={styles.overlay}><View style={styles.modalBox}>
                    <Text style={styles.modalTitle}>{pieTitle}</Text>
                    {!pieData ? <ActivityIndicator/> : (
                        <>
                            <View style={{marginBottom: 12, alignItems: 'center'}}>
                                <Pressable style={{backgroundColor: '#f9a825', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 4}} onPress={() => onPieUsuarioChange(null)}>
                                    <Text style={{color: '#fff', fontWeight: 'bold'}}>Todos os operadores</Text>
                                </Pressable>
                            </View>
                            <View style={{marginBottom: 12, flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8}}>
                                <Text style={{fontWeight: 'bold', marginTop: 8}}>Operadores:</Text>
                                <View style={{width: '100%', marginTop: 4}}>
                                    <AutoComplete
                                        value={pieUsuarioSelecionado ? pieUsuarios.find(u => u.id === pieUsuarioSelecionado) || null : null}
                                        onChange={opt => onPieUsuarioChange(opt?.id ?? null)}
                                        fetchOptions={async () => pieUsuarios.map(u => ({id: u.id, label: u.login}))}
                                        placeholder="Selecionar operador"
                                    />
                                </View>
                            </View>
                            <ScrollView>{Object.entries(pieData).filter(([k])=>k!=='total').map(([k,v])=><View key={k} style={styles.row}><Text>{k}</Text><Text style={styles.bold}>{v}</Text></View>)}<View style={[styles.row, {borderTopWidth:1, borderColor:'#eee', marginTop:8}]}><Text style={styles.bold}>Total</Text><Text style={styles.bold}>{(pieData as Record<string, unknown>).total ?? 0 as unknown as string}</Text></View></ScrollView>
                        </>
                    )}
                    <Pressable style={styles.closeBtn} onPress={()=>setModal(null)}><Text style={styles.closeText}>Fechar</Text></Pressable>
                </View></View>
            </Modal>

            <DetailModalMobile visible={modal==='ligacao' || modal==='ligacaoCoord'} title={`Ligações - ${modalOperador?.login ?? ''}`} onClose={()=>setModal(null)}>
                {modal==='ligacaoCoord' && <AutoComplete value={modalOperadorOpt} onChange={syncModalOpt} fetchOptions={fetchOperador} placeholder="Selecionar operador" />}
                {(ligacoesQ.data as unknown[] ?? []).length===0 ? <Text style={styles.empty}>{ligacoesQ.isLoading ? 'Carregando...' : 'Nenhum registro'}</Text> :
                    (ligacoesQ.data as unknown as Record<string, unknown>[]).map((r,i)=><View key={i} style={styles.detailRow}><Text style={styles.detailLabel}>{String(r.prospectoNome ?? '')} • {String(r.telefoneDiscado ?? '')}</Text><Text style={styles.detailMeta}>{formatDateTime(r.dataInicial)} → {formatDateTime(r.dataFinal)} • {tempoLigacao(r.dataInicial, r.dataFinal)}</Text><Text style={styles.detailMeta}>Resultado: {String(r.resultadoDescricao ?? '')}</Text><Text style={styles.detailMeta} numberOfLines={2}>{String(r.relato ?? '')}</Text></View>)}
                <View style={styles.detailPager}><Pressable disabled={detailPage===0} onPress={()=>setDetailPage(p=>Math.max(0,p-1))}><Text>Anterior</Text></Pressable><Text>Pág {detailPage+1}</Text><Pressable onPress={()=>setDetailPage(p=>p+1)}><Text>Próxima</Text></Pressable></View>
            </DetailModalMobile>

            <DetailModalMobile visible={modal==='ordem'} title={`Fila pendente - ${modalOperador?.login ?? ''}`} onClose={()=>setModal(null)}>
                <AutoComplete value={modalOperadorOpt} onChange={syncModalOpt} fetchOptions={fetchOperador} placeholder="Selecionar operador" />
                {(ordemQ.data as unknown[] ?? []).length===0 ? <Text style={styles.empty}>{ordemQ.isLoading ? 'Carregando...' : 'Nenhum registro'}</Text> :
                    (ordemQ.data as unknown as Record<string, unknown>[]).map((r,i)=><View key={i} style={styles.detailRow}><Text style={styles.detailLabel}>{String(r.prospectoNome ?? '')}</Text></View>)}
                <View style={styles.detailPager}><Pressable disabled={detailPage===0} onPress={()=>setDetailPage(p=>Math.max(0,p-1))}><Text>Anterior</Text></Pressable><Text>Pág {detailPage+1}</Text><Pressable onPress={()=>setDetailPage(p=>p+1)}><Text>Próxima</Text></Pressable></View>
            </DetailModalMobile>

            <DetailModalMobile visible={modal==='prioritaria' || modal==='prioritariaCoord'} title={`Fila prioritária - ${modalOperador?.login ?? ''}`} onClose={()=>setModal(null)}>
                {modal==='prioritariaCoord' && <AutoComplete value={modalOperadorOpt} onChange={syncModalOpt} fetchOptions={fetchOperador} placeholder="Selecionar operador" />}
                {(prioriQ.data as unknown[] ?? []).length===0 ? <Text style={styles.empty}>{prioriQ.isLoading ? 'Carregando...' : 'Nenhum registro'}</Text> :
                    (prioriQ.data as unknown as Record<string, unknown>[]).map((r,i)=><View key={i} style={styles.detailRow}><Text style={styles.detailLabel}>{String(r.prospectoNome ?? '')} • {String(r.telefoneDiscado ?? '')}</Text><Text style={styles.detailMeta}>{formatDateTime(r.data)} • {tempoLigacao(r.dataInicial, r.dataFinal)}</Text><Text style={styles.detailMeta}>Resultado: {String(r.resultadoDescricao ?? '')}</Text></View>)}
                <View style={styles.detailPager}><Pressable disabled={detailPage===0} onPress={()=>setDetailPage(p=>Math.max(0,p-1))}><Text>Anterior</Text></Pressable><Text>Pág {detailPage+1}</Text><Pressable onPress={()=>setDetailPage(p=>p+1)}><Text>Próxima</Text></Pressable></View>
            </DetailModalMobile>

            <DetailModalMobile visible={modal==='pausa' || modal==='pausaCoord'} title={`Pausas - ${modalOperador?.login ?? ''}`} onClose={()=>setModal(null)}>
                {modal==='pausaCoord' && <AutoComplete value={modalOperadorOpt} onChange={syncModalOpt} fetchOptions={fetchOperador} placeholder="Selecionar operador" />}
                {(pausaQ.data as unknown[] ?? []).length===0 ? <Text style={styles.empty}>{pausaQ.isLoading ? 'Carregando...' : 'Nenhum registro'}</Text> :
                    (pausaQ.data as unknown as Record<string, unknown>[]).map((r,i)=><View key={i} style={styles.detailRow}><Text style={styles.detailLabel}>{String(r.tipoPausaDescricao ?? '')} • {String(r.usuarioLogin ?? '')}</Text><Text style={styles.detailMeta}>{formatDateTime(r.dataInicial)} → {formatDateTime(r.dataFinal)}</Text><Text style={styles.detailMeta}>Estorado: {r.estorado ? 'Sim' : 'Não'} • {String(r.observacao ?? '')}</Text></View>)}
                <View style={styles.detailPager}><Pressable disabled={detailPage===0} onPress={()=>setDetailPage(p=>Math.max(0,p-1))}><Text>Anterior</Text></Pressable><Text>Pág {detailPage+1}</Text><Pressable onPress={()=>setDetailPage(p=>p+1)}><Text>Próxima</Text></Pressable></View>
            </DetailModalMobile>

            <DetailModalMobile visible={modal==='agend'} title={`Agendamentos - ${modalOperador?.login ?? ''}`} onClose={()=>setModal(null)}>
                {(agendQ.data as unknown[] ?? []).length===0 ? <Text style={styles.empty}>{agendQ.isLoading ? 'Carregando...' : 'Nenhum registro'}</Text> :
                    (agendQ.data as unknown as Record<string, unknown>[]).map((r,i)=><View key={i} style={styles.detailRow}><Text style={styles.detailLabel}>{String(r.descricao ?? '')}</Text><Text style={styles.detailMeta}>{formatDateTime(r.data)} • {String(r.statusDescricao ?? '')}</Text><Text style={styles.detailMeta}>{String(r.observacao ?? '')}</Text></View>)}
                <View style={styles.detailPager}><Pressable disabled={detailPage===0} onPress={()=>setDetailPage(p=>Math.max(0,p-1))}><Text>Anterior</Text></Pressable><Text>Pág {detailPage+1}</Text><Pressable onPress={()=>setDetailPage(p=>p+1)}><Text>Próxima</Text></Pressable></View>
            </DetailModalMobile>

            <Modal visible={modal==='trocaPri'} transparent animationType="fade" onRequestClose={()=>setModal(null)}>
                <View style={styles.overlay}><View style={styles.modalBox}>
                    <Text style={styles.modalTitle}>Troca da fila prioritária</Text>
                    <Text style={styles.label}>Do operador</Text><AutoComplete value={selOperador} onChange={setSelOperador} fetchOptions={fetchOperador} placeholder="De" />
                    <Text style={styles.label}>Para operador</Text><AutoComplete value={selOperador2} onChange={setSelOperador2} fetchOptions={fetchOperador} placeholder="Para" />
                    <View style={styles.modalActions}><Pressable style={styles.secondaryBtn} onPress={()=>setModal(null)}><Text style={styles.secondaryText}>Cancelar</Text></Pressable><Pressable style={styles.primaryBtn} onPress={handleTrocaPri}><Text style={styles.primaryText}>Confirmar</Text></Pressable></View>
                </View></View>
            </Modal>

            <Modal visible={modal==='trocaLig'} transparent animationType="fade" onRequestClose={()=>setModal(null)}>
                <View style={styles.overlay}><View style={styles.modalBox}>
                    <Text style={styles.modalTitle}>Redistribuir ligação</Text>
                    <Text style={styles.detailMeta}>Distribui a fila de {selOperador?.label ?? modalOperador?.login} entre demais operadores do coordenador.</Text>
                    <Text style={styles.label}>Do operador</Text><AutoComplete value={selOperador} onChange={setSelOperador} fetchOptions={fetchOperador} placeholder="Operador origem" />
                    <View style={styles.modalActions}><Pressable style={styles.secondaryBtn} onPress={()=>setModal(null)}><Text style={styles.secondaryText}>Cancelar</Text></Pressable><Pressable style={[styles.primaryBtn, {backgroundColor:'#f9a825'}]} onPress={handleRedistribuir}><Text style={styles.primaryText}>Confirmar</Text></Pressable></View>
                </View></View>
            </Modal>

        </View>
    );
}

function DetailModalMobile({ visible, title, children, onClose }: { visible: boolean; title: string; children: React.ReactNode; onClose: () => void }) {
    return (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
            <View style={styles.overlay}><View style={[styles.modalBox, { maxHeight: '85%' }]}>
                <View style={styles.modalHeader}><Text style={styles.modalTitle}>{title}</Text><Pressable onPress={onClose}><Text style={styles.closeText}>✕</Text></Pressable></View>
                <ScrollView style={{ maxHeight: 500 }}>{children}</ScrollView>
            </View></View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    page: { flex: 1, backgroundColor: Colors.bgPrimary, padding: Spacing.md },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: Spacing.xl, backgroundColor: Colors.bgPrimary },
    title: { fontSize: Typography.sizes.xxxl, fontWeight: Typography.weights.bold, color: Colors.textPrimary, marginBottom: Spacing.sm },
    notice: { backgroundColor: Colors.warningBg, borderWidth: 1, borderColor: Colors.goldBg, borderRadius: BorderRadius.lg, padding: Spacing.md, marginBottom: Spacing.sm, color: Colors.goldText },
    errorText: { color: Colors.error, fontSize: Typography.sizes.lg, textAlign: 'center' },
    toolbar: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: Spacing.sm },
    tbBtn: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: BorderRadius.md },
    tbText: { color: '#fff', fontSize: 11, fontWeight: Typography.weights.bold },
    label: { fontSize: 12, color: Colors.textSecondary, fontWeight: Typography.weights.semibold, marginTop: 6, marginBottom: 4 },
    filterBox: { borderWidth: 1, borderColor: Colors.borderLight, borderRadius: BorderRadius.lg, padding: Spacing.md, backgroundColor: '#fafafa', marginTop: Spacing.sm, marginBottom: Spacing.sm },
    input: { borderWidth: 1, borderColor: Colors.borderMedium, borderRadius: BorderRadius.md, padding: 8, backgroundColor: '#fff', marginBottom: 8, fontSize: 13 },
    filterActions: { flexDirection: 'row', gap: 8, marginTop: 4 },
    primaryBtn: { backgroundColor: Colors.primary, borderRadius: BorderRadius.md, paddingHorizontal: 14, paddingVertical: 8 },
    primaryText: { color: '#fff', fontSize: 13, fontWeight: Typography.weights.bold },
    secondaryBtn: { backgroundColor: '#fff', borderWidth: 1, borderColor: Colors.borderMedium, borderRadius: BorderRadius.md, paddingHorizontal: 14, paddingVertical: 8 },
    secondaryText: { color: Colors.textSecondary, fontSize: 13 },
    pageInfo: { fontSize: 11, color: Colors.textLight, marginTop: 6, textAlign: 'right' },
    card: { backgroundColor: '#fff', borderWidth: 1, borderColor: Colors.borderLight, borderRadius: BorderRadius.lg, padding: Spacing.md, marginBottom: 8 },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    cardTitle: { fontSize: 14, fontWeight: Typography.weights.bold, color: Colors.textPrimary },
    cardId: { fontSize: 11, color: Colors.textLight },
    cardMeta: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
    badges: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: 6 },
    badge: { backgroundColor: '#f5f5f5', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 10, fontSize: 11, color: Colors.textSecondary, borderWidth: 1, borderColor: '#e0e0e0' },
    actionsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8 },
    actionBtn: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: BorderRadius.md },
    actionText: { color: '#fff', fontSize: 12, fontWeight: Typography.weights.bold },
    empty: { textAlign: 'center', color: Colors.textLight, marginTop: Spacing.xl, fontSize: 13 },
    paginator: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderColor: Colors.borderLight },
    pageBtn: { backgroundColor: Colors.primary + '15', borderRadius: BorderRadius.md, paddingHorizontal: 10, paddingVertical: 6 },
    disabled: { opacity: 0.4 },
    pageBtnText: { color: Colors.primary, fontSize: 12, fontWeight: Typography.weights.bold },
    overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'center', padding: Spacing.md },
    modalBox: { backgroundColor: '#fff', borderRadius: BorderRadius.xl, padding: Spacing.md },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
    modalTitle: { fontSize: 15, fontWeight: Typography.weights.bold, color: Colors.textPrimary },
    closeText: { fontSize: 18, color: Colors.textLight },
    modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8, marginTop: 12 },
    closeBtn: { backgroundColor: Colors.primary, borderRadius: BorderRadius.md, paddingHorizontal: 14, paddingVertical: 8, alignSelf: 'flex-end', marginTop: 8 },
    closeText2: { color: '#fff', fontWeight: Typography.weights.bold },
    row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4, borderBottomWidth: 1, borderColor: '#f0f0f0' },
    bold: { fontWeight: Typography.weights.bold },
    detailRow: { paddingVertical: 8, borderBottomWidth: 1, borderColor: '#f0f0f0' },
    detailLabel: { fontSize: 13, fontWeight: Typography.weights.bold, color: Colors.textPrimary },
    detailMeta: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
    detailPager: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderColor: '#eee' },
});
