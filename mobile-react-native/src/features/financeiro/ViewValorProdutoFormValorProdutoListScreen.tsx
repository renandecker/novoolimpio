import React, {useEffect, useState} from 'react';
import {ScrollView, StyleSheet, Text, TextInput, View, Pressable, ActivityIndicator} from 'react-native';
import {Alert} from '../../shared/components/SweetAlert';
import {useQuery} from '@tanstack/react-query';
import {api} from '../../shared/services/api';
import type {ApiItem} from '../../shared/types/types';
import {Colors, Spacing, BorderRadius, Typography, Shadows} from '../../shared/styles/theme';
import {CURSO_SOURCE, UNIDADE_SOURCE} from '../../masterDetailSources';

const VALOR_PRODUTO_API = '/api/financeiro/valor-produto';
const FORMA_PAGAMENTO_SOURCE = '/api/financeiro/forma-pagamento';

// ── helpers ──────────────────────────────────────────────────────────
const rec = (item: unknown): Record<string, unknown> =>
    (item && typeof item === 'object' ? item as Record<string, unknown> : {});

const str = (v: unknown): string => (v === null || v === undefined ? '' : String(v));

const parseDecimal = (v: string): number | null => {
    const clean = v.trim();
    if (!clean) return null;
    const normalized = clean.includes(',') ? clean.replace(/\./g, '').replace(',', '.') : clean;
    const n = Number(normalized);
    return Number.isFinite(n) ? n : null;
};

const parseIntOrNull = (v: string): number | null => {
    const clean = v.trim();
    if (!clean) return null;
    const n = Number(clean);
    return Number.isInteger(n) ? n : null;
};

const formatValor = (v: unknown): string => {
    if (v === null || v === undefined || v === '') return '';
    const n = Number(v);
    if (!Number.isFinite(n)) return String(v);
    return n.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'});
};

const itemId = (item: ApiItem): number => Number((item as unknown as Record<string, unknown>).id);

const curriculoLabel = (item: ApiItem): string => {
    const r = rec(item);
    return str(r.id_curso_descricao ?? r.curso_descricao ?? r.curso ?? r.descricao ?? r.sucinto ?? r.sigla ?? `#${str(r.id)}`);
};

const unidadeLabel = (item: ApiItem): string => {
    const r = rec(item);
    return str(r.sucinto ?? r.razaoSocial ?? r.razao_social ?? r.nomeFantasia ?? r.nome_fantasia ?? `#${str(r.id)}`);
};

const formaPagamentoLabel = (item: ApiItem): string => {
    const r = rec(item);
    const vezes = str(r.vezes ?? r.qtd_vezes ?? r.qtdVezes);
    const juros = r.juros ?? r.desconto;
    return `#${str(r.id)} · ${vezes || '?'}x${juros ? ` · ${formatValor(juros)}` : ''}`;
};

// ── small UI atoms ───────────────────────────────────────────────────
function Field({label, required, value, onChange, placeholder, keyboardType}:{
    label:string; required?:boolean; value:string; onChange:(v:string)=>void; placeholder?:string; keyboardType?:any;
}){
    return (
        <View style={s.field}>
            <Text style={s.label}>{label} {required && <Text style={s.req}>*</Text>}</Text>
            <TextInput style={s.input} value={value} onChangeText={onChange} placeholder={placeholder} keyboardType={keyboardType} placeholderTextColor={Colors.textPlaceholder}/>
        </View>
    );
}
function SelectField({label, required, value, onChange, options}:{label:string; required?:boolean; value:string; onChange:(v:string)=>void; options:Array<{value:string,label:string}>}){
    const [open,setOpen]=useState(false);
    const current=options.find(o=>o.value===value);
    return (
        <View style={s.field}>
            <Text style={s.label}>{label} {required && <Text style={s.req}>*</Text>}</Text>
            <View style={s.selectGroup}>
                <Pressable style={s.selectBox} onPress={()=>setOpen(!open)}>
                    <Text style={[s.selectText, !current && {color:Colors.textPlaceholder}]}>{current? current.label : '-- Selecione --'}</Text>
                    <Text style={s.selectArrow}>▾</Text>
                </Pressable>
                {open && (
                    <View style={s.selectDropdown}>
                        <Pressable style={s.selectOption} onPress={()=>{onChange(''); setOpen(false);}}><Text style={s.selectOptionText}>-- Selecione --</Text></Pressable>
                        {options.map(o=>(
                            <Pressable key={o.value} style={[s.selectOption, value===o.value && s.selectOptionActive]} onPress={()=>{onChange(o.value); setOpen(false);}}>
                                <Text style={[s.selectOptionText, value===o.value && s.selectOptionTextActive]}>{o.label}</Text>
                            </Pressable>
                        ))}
                    </View>
                )}
            </View>
        </View>
    );
}
function LinkPicker({label, options, selectedIds, onChange, optionLabel}:{
    label:string; options:ApiItem[]; selectedIds:number[]; onChange:(ids:number[])=>void; optionLabel:(item:ApiItem)=>string;
}){
    const selectedSet = new Set(selectedIds);
    const selectedItems = options.filter((o)=>selectedSet.has(itemId(o)));
    const available = options.filter((o)=>!selectedSet.has(itemId(o)));
    return (
        <View style={s.card}>
            <Text style={s.sectionTitle}>{label}</Text>
            <SelectField label="Adicionar" value="" onChange={(v)=>{ if(v) onChange([...selectedIds, Number(v)]); }}
                options={available.map((o)=>({value:String(itemId(o)), label:optionLabel(o)}))} />
            {selectedItems.length===0
                ? <Text style={s.hint}>Nenhum vínculo selecionado.</Text>
                : (
                    <View style={{gap:8, marginTop:8}}>
                        {selectedItems.map((o)=>(
                            <View key={itemId(o)} style={s.linkRow}>
                                <Text style={s.linkText}>{optionLabel(o)}</Text>
                                <Pressable style={s.linkRemove} onPress={()=>onChange(selectedIds.filter((id)=>id!==itemId(o)))}>
                                    <Text style={s.linkRemoveText}>Remover</Text>
                                </Pressable>
                            </View>
                        ))}
                    </View>
                )}
        </View>
    );
}

// ── main ─────────────────────────────────────────────────────────────
type TabKey = 'valorProduto'|'unidade'|'curso'|'formaPagamento';

export default function ViewValorProdutoFormValorProdutoListScreen({route, navigation}: {route?: any; navigation?: any}){
    const idParam = route?.params?.id ?? route?.params?.entityId;
    const [activeTab,setActiveTab]=useState<TabKey>('valorProduto');

    const [f,setF]=useState<Record<string,string>>({
        vezes:'', juros:'', desconto:'', multa:'', diasSpc:'', diasToleranciaMulta:'',
    });
    const upd=(k:string,v:string)=> setF(p=>({...p,[k]:v}));

    const [unidadeId,setUnidadeId]=useState('');
    const [cursoIds,setCursoIds]=useState<number[]>([]);
    const [formaIds,setFormaIds]=useState<number[]>([]);

    const [carregando,setCarregando]=useState(!!idParam);
    const [salvando,setSalvando]=useState(false);

    const {data: curriculos=[]} = useQuery({queryKey:[CURSO_SOURCE], queryFn:async()=>(await api.get<ApiItem[]>(CURSO_SOURCE)).data ?? []});
    const {data: allUnidades=[]} = useQuery({queryKey:[UNIDADE_SOURCE], queryFn:async()=>(await api.get<ApiItem[]>(UNIDADE_SOURCE)).data ?? []});
    const {data: formas=[]} = useQuery({queryKey:[FORMA_PAGAMENTO_SOURCE], queryFn:async()=>(await api.get<ApiItem[]>(FORMA_PAGAMENTO_SOURCE)).data ?? []});

    const {data: cursosDaUnidade} = useQuery({
        queryKey:['cursos-da-unidade', unidadeId],
        queryFn:async()=>(await api.get<number[]>('/api/educacao/curriculo/buscar-cursos-da-unidade', {params:{unidadeId:Number(unidadeId)}})).data ?? [],
        enabled: !!unidadeId,
    });

    const cursosFiltrados = (()=>{
        if(!unidadeId || !cursosDaUnidade) return curriculos;
        const set = new Set((cursosDaUnidade ?? []).map(Number));
        return curriculos.filter((c)=>set.has(itemId(c)));
    })();

    useEffect(()=>{
        if(!idParam) { setCarregando(false); return; }
        let alive=true;
        (async()=>{
            try{
                const row = rec((await api.get(`${VALOR_PRODUTO_API}/${idParam}`)).data);
                if(!alive) return;
                setF({
                    vezes: row.vezes != null ? String(row.vezes) : '',
                    juros: str(row.juros ?? ''),
                    desconto: str(row.desconto ?? ''),
                    multa: str(row.multa ?? ''),
                    diasSpc: row.diasSpc != null ? String(row.diasSpc) : '',
                    diasToleranciaMulta: row.diasToleranciaMulta != null ? String(row.diasToleranciaMulta) : '',
                });
                try{
                    const [u, c, fp] = await Promise.all([
                        api.get<number[]>(`${VALOR_PRODUTO_API}/${idParam}/unidades`),
                        api.get<number[]>(`${VALOR_PRODUTO_API}/${idParam}/cursos`),
                        api.get<number[]>(`${VALOR_PRODUTO_API}/${idParam}/formas-pagamento`),
                    ]);
                    if(!alive) return;
                    const uIds = (u.data ?? []).map(Number);
                    setUnidadeId(uIds.length ? String(uIds[0]) : '');
                    setCursoIds((c.data ?? []).map(Number));
                    setFormaIds((fp.data ?? []).map(Number));
                }catch{/* vínculos opcionais */}
            }catch(e){ console.error(e); Alert.alert('Erro','Erro ao carregar valor do produto.'); }
            finally{ if(alive) setCarregando(false); }
        })();
        return()=>{alive=false;};
    },[idParam]);

    const voltar=()=>{ if(navigation?.goBack) navigation.goBack(); };

    const salvar=async()=>{
        if(parseIntOrNull(f.vezes)===null || (parseIntOrNull(f.vezes) ?? 0) <= 0){ Alert.alert('Campos obrigatórios','Informe Vezes maior que zero.'); return; }
        setSalvando(true);
        try{
            const body = {
                vezes: parseIntOrNull(f.vezes) ?? 0,
                juros: parseDecimal(f.juros),
                desconto: parseDecimal(f.desconto),
                multa: parseDecimal(f.multa),
                diasSpc: parseIntOrNull(f.diasSpc) ?? 0,
                diasToleranciaMulta: parseIntOrNull(f.diasToleranciaMulta) ?? 0,
            };
            const res = idParam
                ? await api.put(`${VALOR_PRODUTO_API}/${idParam}`, body)
                : await api.post(VALOR_PRODUTO_API, body);
            const novoId = (res.data as Record<string,unknown>)?.id ?? (idParam ? Number(idParam) : undefined);
            if(novoId != null){
                const vid = Number(novoId);
                await api.put(`${VALOR_PRODUTO_API}/${vid}/unidades`, unidadeId ? [Number(unidadeId)] : []);
                await api.put(`${VALOR_PRODUTO_API}/${vid}/cursos`, cursoIds);
                await api.put(`${VALOR_PRODUTO_API}/${vid}/formas-pagamento`, formaIds);
            }
            Alert.alert('Sucesso','Registro salvo com sucesso.');
        }catch(e){ console.error(e); Alert.alert('Erro','Erro ao salvar registro.'); }
        finally{ setSalvando(false); }
    };

    if(carregando){
        return (<View style={s.center}><ActivityIndicator color={Colors.primary} size="large"/></View>);
    }

    return (
        <View style={s.container}>
            <View style={s.header}>
                <Text style={s.headerTitle}>Valor Produto — Cadastro</Text>
                <Text style={s.headerSub}>Valor Produto · Unidade · Curso · Forma Pagamento</Text>
            </View>

            <View style={s.tabsRow}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{gap:6, paddingHorizontal:8}}>
                    {(['valorProduto','unidade','curso','formaPagamento'] as const).map(k=>(
                        <Pressable key={k} onPress={()=>setActiveTab(k)} style={[s.tab, activeTab===k && s.tabActive]}>
                            <Text style={[s.tabText, activeTab===k && s.tabTextActive]}>{k==='valorProduto'?'Valor Produto':k==='unidade'?'Unidade':k==='curso'?'Curso':'Forma Pagamento'}</Text>
                        </Pressable>
                    ))}
                </ScrollView>
            </View>

            <ScrollView style={s.content} contentContainerStyle={{padding:16, paddingBottom:100}} keyboardShouldPersistTaps="handled">
                {activeTab==='valorProduto' && (
                    <View style={s.card}>
                        <Text style={s.sectionTitle}>Dados Gerais</Text>
                        <Field label="Vezes" required value={f.vezes} onChange={v=>upd('vezes',v)} placeholder="0" keyboardType="numeric" />
                        <Field label="Desconto Carnê" value={f.desconto} onChange={v=>upd('desconto',v)} placeholder="0,00" keyboardType="decimal-pad" />
                        <Field label="Juros Carnê" value={f.juros} onChange={v=>upd('juros',v)} placeholder="0,00" keyboardType="decimal-pad" />
                        <Field label="Multa Carnê" value={f.multa} onChange={v=>upd('multa',v)} placeholder="0,00" keyboardType="decimal-pad" />
                        <Field label="Dias SPC" value={f.diasSpc} onChange={v=>upd('diasSpc',v)} placeholder="0" keyboardType="numeric" />
                        <Field label="Dias Tolerância Multa" value={f.diasToleranciaMulta} onChange={v=>upd('diasToleranciaMulta',v)} placeholder="0" keyboardType="numeric" />
                    </View>
                )}

                {activeTab==='unidade' && (
                    <View style={s.card}>
                        <Text style={s.sectionTitle}>Unidade</Text>
                        <SelectField label="Unidade" value={unidadeId} onChange={setUnidadeId}
                            options={allUnidades.map((a)=>({value:String(itemId(a)), label:unidadeLabel(a)}))} />
                    </View>
                )}

                {activeTab==='curso' && (
                    <LinkPicker label="Cursos da Unidade" options={cursosFiltrados} selectedIds={cursoIds} onChange={setCursoIds} optionLabel={curriculoLabel} />
                )}

                {activeTab==='formaPagamento' && (
                    <LinkPicker label="Formas de Pagamento (fin_valor_produto_forma_pagamento)" options={formas} selectedIds={formaIds} onChange={setFormaIds} optionLabel={formaPagamentoLabel} />
                )}
            </ScrollView>

            <View style={s.footer}>
                <Pressable style={[s.btn, s.btnYellow]} onPress={voltar}><Text style={s.btnText}>Voltar</Text></Pressable>
                <Pressable style={[s.btn, s.btnBlue]} onPress={salvar} disabled={salvando}><Text style={s.btnText}>{salvando?'Salvando...':'Salvar'}</Text></Pressable>
            </View>
        </View>
    );
}

const s=StyleSheet.create({
    container:{flex:1, backgroundColor:Colors.bgPrimary},
    center:{flex:1, justifyContent:'center', alignItems:'center', backgroundColor:Colors.bgPrimary},
    header:{padding:Spacing.lg, backgroundColor:Colors.bgSecondary, borderBottomWidth:1, borderBottomColor:Colors.borderLight},
    headerTitle:{fontSize:Typography.sizes.xl, fontWeight:Typography.weights.bold, color:Colors.textPrimary},
    headerSub:{fontSize:Typography.sizes.sm, color:Colors.textMuted, marginTop:4},
    tabsRow:{flexDirection:'row', backgroundColor:Colors.bgSecondary, borderBottomWidth:1, borderBottomColor:Colors.borderLight, paddingVertical:6},
    tab:{paddingVertical:8, paddingHorizontal:14, borderRadius:BorderRadius.lg, backgroundColor:Colors.bgPrimary, borderWidth:1, borderColor:Colors.borderLight},
    tabActive:{backgroundColor:Colors.primary, borderColor:Colors.primary},
    tabText:{fontSize:12, fontWeight:Typography.weights.semibold, color:Colors.textSecondary},
    tabTextActive:{color:Colors.textWhite},
    content:{flex:1},
    card:{backgroundColor:Colors.bgSecondary, borderRadius:BorderRadius.lg, padding:Spacing.lg, gap:Spacing.md, ...Shadows.small},
    sectionTitle:{fontSize:13, fontWeight:Typography.weights.bold, color:Colors.textPrimary, textTransform:'uppercase', letterSpacing:0.5, borderTopWidth:1, borderTopColor:Colors.borderLight, paddingTop:10, marginTop:4},
    field:{flexDirection:'column', gap:Spacing.xs},
    label:{fontSize:Typography.sizes.sm, fontWeight:Typography.weights.semibold, color:Colors.textPrimary},
    req:{color:Colors.error},
    input:{height:44, borderWidth:1, borderColor:Colors.borderMedium, borderRadius:BorderRadius.md, paddingHorizontal:12, fontSize:Typography.sizes.md, color:Colors.textPrimary, backgroundColor:Colors.bgPrimary},
    selectGroup:{gap:Spacing.xs},
    selectBox:{height:44, borderWidth:1, borderColor:Colors.borderMedium, borderRadius:BorderRadius.md, paddingHorizontal:12, flexDirection:'row', alignItems:'center', justifyContent:'space-between', backgroundColor:Colors.bgPrimary},
    selectText:{fontSize:Typography.sizes.md, color:Colors.textPrimary},
    selectArrow:{fontSize:12, color:Colors.textLight},
    selectDropdown:{marginTop:6, borderWidth:1, borderColor:Colors.borderLight, borderRadius:BorderRadius.md, backgroundColor:Colors.bgSecondary, overflow:'hidden'},
    selectOption:{paddingVertical:10, paddingHorizontal:12, borderBottomWidth:1, borderBottomColor:'#f0f0f0'},
    selectOptionActive:{backgroundColor:'#e8f0fe'},
    selectOptionText:{fontSize:13, color:Colors.textPrimary},
    selectOptionTextActive:{color:Colors.primary, fontWeight:Typography.weights.bold},
    hint:{fontSize:11, color:Colors.textLight, fontStyle:'italic'},
    linkRow:{flexDirection:'row', alignItems:'center', justifyContent:'space-between', borderWidth:1, borderColor:Colors.borderLight, borderRadius:BorderRadius.md, padding:10, backgroundColor:'#fafafa', gap:8},
    linkText:{fontSize:12, color:Colors.textPrimary, fontWeight:Typography.weights.semibold, flex:1},
    linkRemove:{backgroundColor:Colors.error, borderRadius:BorderRadius.md, paddingHorizontal:10, paddingVertical:6},
    linkRemoveText:{color:Colors.textWhite, fontSize:11, fontWeight:Typography.weights.bold},
    footer:{flexDirection:'row', justifyContent:'flex-end', gap:10, padding:Spacing.lg, backgroundColor:Colors.bgSecondary, borderTopWidth:1, borderTopColor:Colors.borderLight, ...Shadows.medium},
    btn:{borderRadius:BorderRadius.lg, paddingHorizontal:18, paddingVertical:12, alignItems:'center', minWidth:120, ...Shadows.small},
    btnYellow:{backgroundColor:Colors.btnYellow},
    btnBlue:{backgroundColor:Colors.primary},
    btnText:{color:Colors.textWhite, fontWeight:Typography.weights.bold, fontSize:13},
});
