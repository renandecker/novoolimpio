import React, {useEffect, useState} from 'react';
import {ScrollView, StyleSheet, Text, TextInput, View, Pressable, Alert, ActivityIndicator} from 'react-native';
import {useQuery} from '@tanstack/react-query';
import {api} from '../../shared/services/api';
import type {ApiItem} from '../../shared/types/types';
import {Colors, Spacing, BorderRadius, Typography, Shadows} from '../../shared/styles/theme';
import {CURSO_SOURCE, UNIDADE_SOURCE} from '../../masterDetailSources';

const VALOR_CURSO_API = '/api/financeiro/valor-curso';
const FORMA_PAGAMENTO_SOURCE = '/api/financeiro/forma-pagamento';
const DESCONTO_CURSO_SOURCE = '/api/view/descontoCurso/listDescontoCurso';
const TAXA_CURSO_SOURCE = '/api/view/taxaCurso/listTaxaCurso';

// ── helpers ──────────────────────────────────────────────────────────
const rec = (item: unknown): Record<string, unknown> =>
    (item && typeof item === 'object' ? item as Record<string, unknown> : {});

const str = (v: unknown): string => (v === null || v === undefined ? '' : String(v));

const toDateInput = (v: unknown): string => {
    if (v === null || v === undefined) return '';
    const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(v));
    return m ? `${m[1]}-${m[2]}-${m[3]}` : '';
};

/** "1.234,56" | "1234.56" -> number | null */
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
    const sucinto = str(r.sucinto);
    const razao = str(r.razaoSocial ?? r.razao_social);
    return [sucinto, razao].filter(Boolean).join(' - ') || `#${str(r.id)}`;
};

const formaPagamentoLabel = (item: ApiItem): string => {
    const r = rec(item);
    const vezes = str(r.vezes ?? r.qtd_vezes ?? r.qtdVezes);
    const juros = r.juros ?? r.desconto;
    return `#${str(r.id)} · ${vezes || '?'}x${juros ? ` · ${formatValor(juros)}` : ''}`;
};

const descricaoLabel = (item: ApiItem): string => {
    const r = rec(item);
    const desc = str(r.descricao);
    return desc ? `${desc}${r.valor ? ` · ${formatValor(r.valor)}` : ''}` : `#${str(r.id)}`;
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
    );
}
function Toggle({label, value, onChange}:{label:string; value:boolean; onChange:(v:boolean)=>void}){
    return (
        <Pressable style={s.toggleRow} onPress={()=>onChange(!value)}>
            <View style={[s.toggleTrack, value && s.toggleTrackOn]}><View style={[s.toggleThumb, value && s.toggleThumbOn]}/></View>
            <Text style={s.toggleLabel}>{label}: {value?'Sim':'Não'}</Text>
        </Pressable>
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
type TabKey = 'valorCurso'|'unidade'|'formaPagamento'|'descontos'|'taxas';

export default function ViewValorCursoFormValorCursoListScreen({route, navigation}: {route?: any; navigation?: any}){
    const idParam = route?.params?.id ?? route?.params?.entityId;
    const [activeTab,setActiveTab]=useState<TabKey>('valorCurso');

    const [f,setF]=useState<Record<string,string>>({
        data:'', curriculoId:'', valor:'', juros:'', multa:'', descontoCarne:'',
        valorDescontoAluno:'', diasSpc:'', diasToleranciaMulta:'',
        percDescJurMul:'', percDescValor:'', percValorMinEntrada:'',
        prazoParcEntrada:'', prazoParcSegunda:'', qtdeParcelas:'',
    });
    const upd=(k:string,v:string)=> setF(p=>({...p,[k]:v}));
    const [valorHora,setValorHora]=useState(false);
    const [cobraRematricula,setCobraRematricula]=useState(false);

    const [unidades,setUnidades]=useState<ApiItem[]>([]);
    const [formaIds,setFormaIds]=useState<number[]>([]);
    const [descontoIds,setDescontoIds]=useState<number[]>([]);
    const [taxaIds,setTaxaIds]=useState<number[]>([]);

    const [carregando,setCarregando]=useState(!!idParam);
    const [salvando,setSalvando]=useState(false);

    const {data: curriculos=[]} = useQuery({queryKey:[CURSO_SOURCE], queryFn:async()=>(await api.get<ApiItem[]>(CURSO_SOURCE)).data ?? []});
    const {data: allUnidades=[]} = useQuery({queryKey:[UNIDADE_SOURCE], queryFn:async()=>(await api.get<ApiItem[]>(UNIDADE_SOURCE)).data ?? []});
    const {data: formas=[]} = useQuery({queryKey:[FORMA_PAGAMENTO_SOURCE], queryFn:async()=>(await api.get<ApiItem[]>(FORMA_PAGAMENTO_SOURCE)).data ?? []});
    const {data: descontos=[]} = useQuery({queryKey:[DESCONTO_CURSO_SOURCE], queryFn:async()=>(await api.get<ApiItem[]>(DESCONTO_CURSO_SOURCE)).data ?? []});
    const {data: taxas=[]} = useQuery({queryKey:[TAXA_CURSO_SOURCE], queryFn:async()=>(await api.get<ApiItem[]>(TAXA_CURSO_SOURCE)).data ?? []});

    useEffect(()=>{
        if(!idParam) return;
        let alive=true;
        (async()=>{
            try{
                const row = rec((await api.get(`${VALOR_CURSO_API}/${idParam}`)).data);
                if(!alive) return;
                setF({
                    data: toDateInput(row.data),
                    curriculoId: row.curriculoId != null ? String(row.curriculoId) : '',
                    valor: str(row.valor ?? ''),
                    juros: str(row.juros ?? ''),
                    multa: str(row.multa ?? ''),
                    descontoCarne: str(row.descontoCarne ?? ''),
                    valorDescontoAluno: str(row.valorDescontoAluno ?? ''),
                    diasSpc: str(row.diasSpc ?? ''),
                    diasToleranciaMulta: str(row.diasToleranciaMulta ?? ''),
                    percDescJurMul: str(row.percDescJurMul ?? ''),
                    percDescValor: str(row.percDescValor ?? ''),
                    percValorMinEntrada: str(row.percValorMinEntrada ?? ''),
                    prazoParcEntrada: str(row.prazoParcEntrada ?? ''),
                    prazoParcSegunda: str(row.prazoParcSegunda ?? ''),
                    qtdeParcelas: str(row.qtdeParcelas ?? ''),
                });
                setValorHora(row.valorHora === true);
                setCobraRematricula(row.cobraRematricula === true);
                try{
                    const [u, fp, d, t] = await Promise.all([
                        api.get<number[]>(`${VALOR_CURSO_API}/${idParam}/unidades`),
                        api.get<number[]>(`${VALOR_CURSO_API}/${idParam}/formas-pagamento`),
                        api.get<number[]>(`${VALOR_CURSO_API}/${idParam}/descontos`),
                        api.get<number[]>(`${VALOR_CURSO_API}/${idParam}/taxas`),
                    ]);
                    if(!alive) return;
                    const uIds = new Set((u.data ?? []).map(Number));
                    setUnidades(allUnidades.filter((a)=>uIds.has(itemId(a))));
                    setFormaIds((fp.data ?? []).map(Number));
                    setDescontoIds((d.data ?? []).map(Number));
                    setTaxaIds((t.data ?? []).map(Number));
                }catch{/* vínculos opcionais */}
            }catch(e){ console.error(e); Alert.alert('Erro','Erro ao carregar valor do curso.'); }
            finally{ if(alive) setCarregando(false); }
        })();
        return()=>{alive=false;};
    },[idParam, allUnidades]);

    const voltar=()=>{ if(navigation?.goBack) navigation.goBack(); };

    const salvar=async()=>{
        if(!f.curriculoId || !f.data){ Alert.alert('Campos obrigatórios','Informe Currículo e Data.'); return; }
        if(!valorHora && parseDecimal(f.valor)===null){ Alert.alert('Campos obrigatórios','Informe o Valor do curso (ou marque Valor por Hora).'); return; }
        setSalvando(true);
        try{
            const body = {
                data: f.data || null,
                curriculoId: parseIntOrNull(f.curriculoId),
                valor: parseDecimal(f.valor),
                valorHora,
                juros: parseDecimal(f.juros),
                multa: parseDecimal(f.multa),
                descontoCarne: parseDecimal(f.descontoCarne),
                valorDescontoAluno: parseDecimal(f.valorDescontoAluno),
                diasSpc: parseIntOrNull(f.diasSpc),
                diasToleranciaMulta: parseIntOrNull(f.diasToleranciaMulta),
                percDescJurMul: parseDecimal(f.percDescJurMul),
                percDescValor: parseDecimal(f.percDescValor),
                percValorMinEntrada: parseDecimal(f.percValorMinEntrada),
                prazoParcEntrada: parseIntOrNull(f.prazoParcEntrada),
                prazoParcSegunda: parseIntOrNull(f.prazoParcSegunda),
                qtdeParcelas: parseDecimal(f.qtdeParcelas),
                cobraRematricula,
            };
            const res = idParam
                ? await api.put(`${VALOR_CURSO_API}/${idParam}`, body)
                : await api.post(VALOR_CURSO_API, body);
            const novoId = (res.data as Record<string,unknown>)?.id ?? (idParam ? Number(idParam) : undefined);
            if(novoId != null){
                const vid = Number(novoId);
                await api.put(`${VALOR_CURSO_API}/${vid}/unidades`, unidades.map(itemId));
                await api.put(`${VALOR_CURSO_API}/${vid}/formas-pagamento`, formaIds);
                await api.put(`${VALOR_CURSO_API}/${vid}/descontos`, descontoIds);
                await api.put(`${VALOR_CURSO_API}/${vid}/taxas`, taxaIds);
            }
            Alert.alert('Sucesso','Registro salvo com sucesso.');
        }catch(e){ console.error(e); Alert.alert('Erro','Erro ao salvar registro.'); }
        finally{ setSalvando(false); }
    };

    const unidadeIds = new Set(unidades.map(itemId));

    if(carregando){
        return (<View style={s.center}><ActivityIndicator color={Colors.primary} size="large"/></View>);
    }

    return (
        <View style={s.container}>
            <View style={s.header}>
                <Text style={s.headerTitle}>Valor Curso — Cadastro</Text>
                <Text style={s.headerSub}>Preencha as abas: Valor Curso · Unidade · Forma Pagamento · Descontos · Taxas</Text>
            </View>

            <View style={s.tabsRow}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{gap:6, paddingHorizontal:8}}>
                    {(['valorCurso','unidade','formaPagamento','descontos','taxas'] as const).map(k=>(
                        <Pressable key={k} onPress={()=>setActiveTab(k)} style={[s.tab, activeTab===k && s.tabActive]}>
                            <Text style={[s.tabText, activeTab===k && s.tabTextActive]}>{k==='valorCurso'?'Valor Curso':k==='unidade'?'Unidade':k==='formaPagamento'?'Forma Pagamento':k==='descontos'?'Descontos':'Taxas'}</Text>
                        </Pressable>
                    ))}
                </ScrollView>
            </View>

            <ScrollView style={s.content} contentContainerStyle={{padding:16, paddingBottom:100}} keyboardShouldPersistTaps="handled">
                {activeTab==='valorCurso' && (
                    <View style={s.card}>
                        <Text style={s.sectionTitle}>Dados Gerais</Text>
                        <SelectField label="Currículo" required value={f.curriculoId} onChange={v=>upd('curriculoId',v)}
                            options={curriculos.map((c)=>({value:String(itemId(c)), label:curriculoLabel(c)}))} />
                        <Field label="Data" required value={f.data} onChange={v=>upd('data',v)} placeholder="AAAA-MM-DD" />
                        <Toggle label="Valor por Hora" value={valorHora} onChange={setValorHora}/>
                        <Field label={valorHora ? 'Valor Hora' : 'Valor Curso'} required={!valorHora} value={f.valor} onChange={v=>upd('valor',v)} placeholder="0,00" keyboardType="decimal-pad" />
                        <Text style={s.sectionTitle}>Cobrança</Text>
                        <Field label="Juros (%)" value={f.juros} onChange={v=>upd('juros',v)} placeholder="0,00" keyboardType="decimal-pad" />
                        <Field label="Multa (%)" value={f.multa} onChange={v=>upd('multa',v)} placeholder="0,00" keyboardType="decimal-pad" />
                        <Field label="Desconto Carnê" value={f.descontoCarne} onChange={v=>upd('descontoCarne',v)} placeholder="0,00" keyboardType="decimal-pad" />
                        <Field label="Valor Desconto Aluno" value={f.valorDescontoAluno} onChange={v=>upd('valorDescontoAluno',v)} placeholder="0,00" keyboardType="decimal-pad" />
                        <Field label="Dias SPC" value={f.diasSpc} onChange={v=>upd('diasSpc',v)} placeholder="0" keyboardType="numeric" />
                        <Field label="Dias Tolerância Multa" value={f.diasToleranciaMulta} onChange={v=>upd('diasToleranciaMulta',v)} placeholder="0" keyboardType="numeric" />
                        <Toggle label="Cobra Rematrícula" value={cobraRematricula} onChange={setCobraRematricula}/>
                        <Text style={s.sectionTitle}>Parcelamento</Text>
                        <Field label="% Desc. Juros/Multa" value={f.percDescJurMul} onChange={v=>upd('percDescJurMul',v)} placeholder="0,00" keyboardType="decimal-pad" />
                        <Field label="% Desc. Valor" value={f.percDescValor} onChange={v=>upd('percDescValor',v)} placeholder="0,00" keyboardType="decimal-pad" />
                        <Field label="% Valor Mín. Entrada" value={f.percValorMinEntrada} onChange={v=>upd('percValorMinEntrada',v)} placeholder="0,00" keyboardType="decimal-pad" />
                        <Field label="Prazo Parc. Entrada" value={f.prazoParcEntrada} onChange={v=>upd('prazoParcEntrada',v)} placeholder="0" keyboardType="numeric" />
                        <Field label="Prazo Parc. Segunda" value={f.prazoParcSegunda} onChange={v=>upd('prazoParcSegunda',v)} placeholder="0" keyboardType="numeric" />
                        <Field label="Qtde Parcelas" value={f.qtdeParcelas} onChange={v=>upd('qtdeParcelas',v)} placeholder="0" keyboardType="decimal-pad" />
                    </View>
                )}

                {activeTab==='unidade' && (
                    <View style={s.card}>
                        <Text style={s.sectionTitle}>Unidades</Text>
                        <SelectField label="Adicionar unidade" value="" onChange={(v)=>{
                            if(!v) return;
                            const found = allUnidades.find((a)=>String(itemId(a))===v);
                            if(found && !unidadeIds.has(itemId(found))) setUnidades([...unidades, found]);
                        }} options={allUnidades.filter((a)=>!unidadeIds.has(itemId(a))).map((a)=>({value:String(itemId(a)), label:unidadeLabel(a)}))} />
                        {unidades.length===0
                            ? <Text style={s.hint}>Nenhuma unidade vinculada.</Text>
                            : (
                                <View style={{gap:8, marginTop:8}}>
                                    {unidades.map((u)=>(
                                        <View key={itemId(u)} style={s.linkRow}>
                                            <Text style={s.linkText}>{unidadeLabel(u)}</Text>
                                            <Pressable style={s.linkRemove} onPress={()=>setUnidades(unidades.filter((x)=>itemId(x)!==itemId(u)))}>
                                                <Text style={s.linkRemoveText}>Remover</Text>
                                            </Pressable>
                                        </View>
                                    ))}
                                </View>
                            )}
                    </View>
                )}

                {activeTab==='formaPagamento' && (
                    <LinkPicker label="Formas de Pagamento" options={formas} selectedIds={formaIds} onChange={setFormaIds} optionLabel={formaPagamentoLabel} />
                )}

                {activeTab==='descontos' && (
                    <LinkPicker label="Descontos" options={descontos} selectedIds={descontoIds} onChange={setDescontoIds} optionLabel={descricaoLabel} />
                )}

                {activeTab==='taxas' && (
                    <LinkPicker label="Taxas" options={taxas} selectedIds={taxaIds} onChange={setTaxaIds} optionLabel={descricaoLabel} />
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
    field:{gap:4},
    label:{fontSize:Typography.sizes.sm, fontWeight:Typography.weights.semibold, color:Colors.textPrimary},
    req:{color:Colors.error},
    input:{height:44, borderWidth:1, borderColor:Colors.borderMedium, borderRadius:BorderRadius.md, paddingHorizontal:12, fontSize:Typography.sizes.md, color:Colors.textPrimary, backgroundColor:Colors.bgPrimary},
    selectBox:{height:44, borderWidth:1, borderColor:Colors.borderMedium, borderRadius:BorderRadius.md, paddingHorizontal:12, flexDirection:'row', alignItems:'center', justifyContent:'space-between', backgroundColor:Colors.bgPrimary},
    selectText:{fontSize:Typography.sizes.md, color:Colors.textPrimary},
    selectArrow:{fontSize:12, color:Colors.textLight},
    selectDropdown:{marginTop:6, borderWidth:1, borderColor:Colors.borderLight, borderRadius:BorderRadius.md, backgroundColor:Colors.bgSecondary, overflow:'hidden'},
    selectOption:{paddingVertical:10, paddingHorizontal:12, borderBottomWidth:1, borderBottomColor:'#f0f0f0'},
    selectOptionActive:{backgroundColor:'#e8f0fe'},
    selectOptionText:{fontSize:13, color:Colors.textPrimary},
    selectOptionTextActive:{color:Colors.primary, fontWeight:Typography.weights.bold},
    hint:{fontSize:11, color:Colors.textLight, fontStyle:'italic'},
    toggleRow:{flexDirection:'row', alignItems:'center', gap:10, paddingVertical:6},
    toggleTrack:{width:44, height:26, borderRadius:13, backgroundColor:Colors.toggleOff, padding:2, justifyContent:'center'},
    toggleTrackOn:{backgroundColor:Colors.toggleOn},
    toggleThumb:{width:22, height:22, borderRadius:11, backgroundColor:Colors.toggleThumb, ...Shadows.small},
    toggleThumbOn:{alignSelf:'flex-end'},
    toggleLabel:{fontSize:13, color:Colors.textPrimary, fontWeight:Typography.weights.medium},
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
