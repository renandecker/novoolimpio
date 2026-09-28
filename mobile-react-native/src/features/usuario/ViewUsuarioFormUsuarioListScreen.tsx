import React, {useEffect, useState} from 'react';
import {ScrollView, StyleSheet, Text, TextInput, View, Pressable, Image, Platform} from 'react-native';
import {Alert} from '../../shared/components/SweetAlert';
import {useQuery} from '@tanstack/react-query';
import {MasterDetail} from '../MasterDetail';
import {PerfilCombo} from '../shared/components/PerfilCombo';
import {AgendaCombo} from '../shared/components/AgendaCombo';
import type {AutoCompleteOption} from '../shared/components/AutoComplete';
import {Colors, Spacing, BorderRadius, Typography, Shadows} from '../theme';
import {api} from '../api';
import type {ApiItem} from '../types';
import {
    PERFIL_SOURCE, PERFIL_COLUMNS, PERFIL_SEARCH,
    UNIDADE_SOURCE, UNIDADE_COLUMNS, UNIDADE_SEARCH,
    AGENDA_SOURCE, AGENDA_COLUMNS, AGENDA_SEARCH,
    TURNO_TRABALHO_SOURCE, TURNO_TRABALHO_COLUMNS, TURNO_TRABALHO_SEARCH,
} from '../masterDetailSources';
import * as ImagePicker from 'expo-image-picker';

// ── helpers ──────────────────────────────────────────────────────────
const formatCpf=(v:string)=>{ const d=v.replace(/\D/g,'').slice(0,11); if(d.length<=3) return d; if(d.length<=6) return `${d.slice(0,3)}.${d.slice(3)}`; if(d.length<=9) return `${d.slice(0,3)}.${d.slice(3,6)}.${d.slice(6)}`; return `${d.slice(0,3)}.${d.slice(3,6)}.${d.slice(6,9)}-${d.slice(9)}`; };
const formatPhone=(v:string)=>{ const d=v.replace(/\D/g,'').slice(0,11); if(d.length<=2) return d?`(${d}`:''; if(d.length<=6) return `(${d.slice(0,2)}) ${d.slice(2)}`; if(d.length<=10) return `(${d.slice(0,2)}) ${d.slice(2,6)}-${d.slice(6)}`; return `(${d.slice(0,2)}) ${d.slice(2,7)}-${d.slice(7)}`; };
const formatCep=(v:string)=>{ const d=v.replace(/\D/g,'').slice(0,8); if(d.length<=5) return d; return `${d.slice(0,5)}-${d.slice(5)}`; };

const GENEROS=[{value:'1',label:'Masculino'},{value:'2',label:'Feminino'},{value:'3',label:'Outro'}];
const ETNIAS=[{value:'1',label:'Branca'},{value:'2',label:'Preta'},{value:'3',label:'Parda'},{value:'4',label:'Amarela'},{value:'5',label:'Indígena'}];
const ESTADOS_CIVIS=[{value:'1',label:'Solteiro(a)'},{value:'2',label:'Casado(a)'},{value:'3',label:'Divorciado(a)'},{value:'4',label:'Viúvo(a)'},{value:'5',label:'União Estável'}];
const ESCOLARIDADES=[{value:'1',label:'Ensino Fundamental Incompleto'},{value:'2',label:'Ensino Fundamental Completo'},{value:'3',label:'Ensino Médio Incompleto'},{value:'4',label:'Ensino Médio Completo'},{value:'5',label:'Superior Incompleto'},{value:'6',label:'Superior Completo'},{value:'7',label:'Pós-Graduação'}];

type OptionItem={value:string;label:string};

type Endereco={id?:number; cep:string; cidade:string; bairro:string; logradouro:string; numero:string; complemento:string};

async function buscarCepViaCep(cep:string):Promise<Partial<Endereco>|null>{
    const clean=cep.replace(/\D/g,''); if(clean.length!==8) return null;
    try{ const r=await fetch(`https://viacep.com.br/ws/${clean}/json/`); const d=await r.json(); if(d.erro) return null; return {cep:formatCep(d.cep??clean), cidade:d.localidade??'', bairro:d.bairro??'', logradouro:d.logradouro??''}; }catch{ return null; }
}

// ── small UI atoms ───────────────────────────────────────────────────
function Field({label, required, value, onChange, placeholder, keyboardType, secure}:{
    label:string; required?:boolean; value:string; onChange:(v:string)=>void; placeholder?:string; keyboardType?:any; secure?:boolean;
}){
    return (
        <View style={s.field}>
            <Text style={s.label}>{label} {required && <Text style={s.req}>*</Text>}</Text>
            <TextInput style={s.input} value={value} onChangeText={onChange} placeholder={placeholder} keyboardType={keyboardType} secureTextEntry={secure} placeholderTextColor={Colors.textPlaceholder}/>
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
function DocUpload({label, required, value, onChange}:{label:string; required?:boolean; value:string; onChange:(v:string)=>void}){
    const pick=async()=>{
        const perm=await ImagePicker.requestMediaLibraryPermissionsAsync();
        if(!perm.granted){ Alert.alert('Permissão necessária','Permita acesso à galeria.'); return; }
        const res=await ImagePicker.launchImageLibraryAsync({mediaTypes:ImagePicker.MediaTypeOptions.All, allowsEditing:false, quality:0.7, base64:true});
        if(!res.canceled && res.assets[0]?.base64) onChange(`data:${res.assets[0].mimeType??'image/jpeg'};base64,${res.assets[0].base64}`);
        else if(!res.canceled && res.assets[0]?.uri) onChange(res.assets[0].uri);
    };
    const isImage=value.startsWith('data:image') || value.startsWith('http') || value.startsWith('file');
    return (
        <View style={s.docCard}>
            <Text style={s.docLabel}>{label} {required && <Text style={s.req}>*</Text>}</Text>
            {value ? (
                <View style={s.docPreview}>
                    {isImage ? <Image source={{uri:value}} style={s.docImage}/> : <Text style={s.docFileText} numberOfLines={2}>{value.slice(0,60)}…</Text>}
                </View>
            ) : <View style={s.docEmpty}><Text style={s.docEmptyText}>Nenhum arquivo</Text></View>}
            <View style={s.docActions}>
                <Pressable style={s.docBtn} onPress={pick}><Text style={s.docBtnText}>{value?'Trocar':'Selecionar'}</Text></Pressable>
                {value ? <Pressable style={s.docBtnGhost} onPress={()=>onChange('')}><Text style={s.docBtnGhostText}>Remover</Text></Pressable>:null}
            </View>
        </View>
    );
}
function Toggle({label, value, onChange, onText = 'Sim', offText = 'Não'}:{label:string; value:boolean; onChange:(v:boolean)=>void; onText?:string; offText?:string}){
    return (
        <Pressable style={s.toggleRow} onPress={()=>onChange(!value)}>
            <View style={[s.toggleTrack, value && s.toggleTrackOn]}><View style={[s.toggleThumb, value && s.toggleThumbOn]}/></View>
            <Text style={s.toggleLabel}>{label}: {value?onText:offText}</Text>
        </Pressable>
    );
}

// ── main ─────────────────────────────────────────────────────────────
export default function ViewUsuarioFormUsuarioListScreen({route}: {route?: any}){
    const idParam = route?.params?.id ?? route?.params?.entityId;
    const [activeTab,setActiveTab]=useState<'pessoal'|'endereco'|'documentos'|'trabalho'|'acessos'>('pessoal');
    const [acessoSub,setAcessoSub]=useState<'unidade'|'perfil'|'agenda'>('unidade');

    const [f,setF]=useState<Record<string,string>>({
        login:'', senha:'', cpf:'', rg:'', nome:'', email:'', nomeSocial:'', dataNascimento:'',
        nomePai:'', nomeMae:'', telefoneResidencial:'', celular:'',
        nomeReferencia:'', telefoneReferencia:'', celularReferencia:'',
        nomeReferencia2:'', telefoneReferencia2:'', celularReferencia2:'',
        generoId:'', etniaId:'', estadoCivilId:'', escolaridadeId:'',
    });
    const upd=(k:string,v:string)=> setF(p=>({...p,[k]:v}));

    // Endereço - layout fiel ao formPessoaFisica mobile (cep + busca/ajuste/novo + cidade/bairro/logradouro/numero/complemento)
    const [cep,setCep]=useState('');
    const [cidade,setCidade]=useState('');
    const [bairro,setBairro]=useState('');
    const [logradouro,setLogradouro]=useState('');
    const [numero,setNumero]=useState('');
    const [complemento,setComplemento]=useState('');
    const [logradouroId,setLogradouroId]=useState<number|undefined>();
    const [buscandoCep,setBuscandoCep]=useState(false);
    const handleBuscarCep=async()=>{
        const clean=cep.replace(/\D/g,'');
        if(clean.length!==8){ Alert.alert('Aviso','Informe o CEP completo'); return; }
        setBuscandoCep(true);
        try{
            try{
                const {data}=await api.get<any>(`/api/basico/logradouro/buscar-endereco-por-cep`,{params:{cep:clean}});
                if(data?.logradouro){
                    const l=data.logradouro;
                    setLogradouro(String(l?.descricao ?? '')); setLogradouroId(l?.id);
                    if(data?.bairro) setBairro(String((data.bairro as any).descricao ?? ''));
                    if(data?.cidade) setCidade(String((data.cidade as any).nome ?? (data.cidade as any).cidadeEstado ?? ''));
                    setCep(formatCep(String(l?.cep ?? clean)));
                    return;
                }
            }catch{}
            const dados=await buscarCepViaCep(clean);
            if(dados){ if(dados.cidade) setCidade(dados.cidade); if(dados.bairro) setBairro(dados.bairro); if(dados.logradouro) setLogradouro(dados.logradouro); if(dados.cep) setCep(dados.cep); }
            else Alert.alert('CEP não encontrado','Verifique o CEP informado.');
        } finally { setBuscandoCep(false); }
    };
    const handleAjusteCep=()=>{ Alert.alert('Ajuste','Selecione cidade/bairro/logradouro nos campos abaixo'); };
    const handleNovoCep=()=>{ setCep(''); setCidade(''); setBairro(''); setLogradouro(''); setNumero(''); setComplemento(''); setLogradouroId(undefined); };

    const [doc,setDoc]=useState<Record<string,string>>({qtdFilhosMenor14:'', ctps:'', serie:'', pis:'', dataEmissaoRg:'', orgaoEmissorRg:'', tituloEleitor:'', zona:'', secao:'', carteiraReservista:''});
    const updDoc=(k:string,v:string)=> setDoc(p=>({...p,[k]:v}));
    const [foto3x4,setFoto3x4]=useState(''); const [ctps1,setCtps1]=useState(''); const [ctps2,setCtps2]=useState('');
    const [contrato,setContrato]=useState(''); const [compRes,setCompRes]=useState(''); const [docCpf,setDocCpf]=useState('');
    const [rgFrente,setRgFrente]=useState(''); const [rgVerso,setRgVerso]=useState(''); const [docTitulo,setDocTitulo]=useState(''); const [docReserv,setDocReserv]=useState('');

    const [ativo,setAtivo]=useState(true);
    const [funcaoId,setFuncaoId]=useState(''); const [dataAdmissao,setDataAdmissao]=useState('');
    const [mensalista,setMensalista]=useState<'M'|'H'>('M');
    const [observacao,setObservacao]=useState('');
    const [turnos,setTurnos]=useState<ApiItem[]>([]);
    const [funcoes,setFuncoes]=useState<Array<{id:number,label:string}>>([]);
    useEffect(()=>{(async()=>{
        try{ const r=await api.get<any[]>('/api/basico/funcao'); const arr=Array.isArray(r.data)?r.data:(r.data as any)?.content??[]; setFuncoes(arr.map((x:any)=>({id:x.id,label:x.descricao??x.nome??String(x.id)}))); }catch{}
    })();},[]);

    // ── Opções carregadas por API (gênero, etnia, estado civil, escolaridade) ──
    const [generoOptions,setGeneroOptions]=useState<OptionItem[]>(GENEROS);
    const [etniaOptions,setEtniaOptions]=useState<OptionItem[]>(ETNIAS);
    const [estadoCivilOptions,setEstadoCivilOptions]=useState<OptionItem[]>(ESTADOS_CIVIS);
    const [escolaridadeOptions,setEscolaridadeOptions]=useState<OptionItem[]>(ESCOLARIDADES);
    useEffect(()=>{(async()=>{
        try{ const r=await api.get<any[]>('/api/basico/genero'); const arr=Array.isArray(r.data)?r.data:(r.data as any)?.content??[]; if(arr.length) setGeneroOptions(arr.map((x:any)=>({value:String(x.id),label:x.descricao??x.nome??String(x.id)}))); }catch{}
        try{ const r=await api.get<any[]>('/api/basico/etnia'); const arr=Array.isArray(r.data)?r.data:(r.data as any)?.content??[]; if(arr.length) setEtniaOptions(arr.map((x:any)=>({value:String(x.id),label:x.descricao??x.nome??String(x.id)}))); }catch{}
        try{ const r=await api.get<any[]>('/api/basico/estado-civil'); const arr=Array.isArray(r.data)?r.data:(r.data as any)?.content??[]; if(arr.length) setEstadoCivilOptions(arr.map((x:any)=>({value:String(x.id),label:x.descricao??x.nome??String(x.id)}))); }catch{}
        try{ const r=await api.get<any[]>('/api/basico/escolaridade'); const arr=Array.isArray(r.data)?r.data:(r.data as any)?.content??[]; if(arr.length) setEscolaridadeOptions(arr.map((x:any)=>({value:String(x.id),label:x.descricao??x.nome??String(x.id)}))); }catch{}
    })();},[]);

    const [unidadesAcesso,setUnidadesAcesso]=useState<ApiItem[]>([]);
    const [unidadeDefaultId,setUnidadeDefaultId]=useState('');
    const [perfis,setPerfis]=useState<ApiItem[]>([]);
    const [agendas,setAgendas]=useState<ApiItem[]>([]);
    const [perfilSelected,setPerfilSelected]=useState<AutoCompleteOption | null>(null);
    const [agendaSelected,setAgendaSelected]=useState<AutoCompleteOption | null>(null);
    const [agendaPerm,setAgendaPerm]=useState({agendar:false,alterar:false,fechar:false,iniciar:false,atender:false});

    const {data:allUnidades=[]}=useQuery({queryKey:[UNIDADE_SOURCE], queryFn:async()=>(await api.get<ApiItem[]>(UNIDADE_SOURCE)).data});
    const {data:allPerfis=[]}=useQuery({queryKey:[PERFIL_SOURCE], queryFn:async()=>(await api.get<ApiItem[]>(PERFIL_SOURCE)).data});
    const {data:allAgendas=[]}=useQuery({queryKey:[AGENDA_SOURCE], queryFn:async()=>(await api.get<ApiItem[]>(AGENDA_SOURCE)).data});

    const [usuarioId,setUsuarioId]=useState<number|undefined>();
    const [usuarioOriginal,setUsuarioOriginal]=useState<Record<string,unknown>|null>(null);
    const [pessoaId,setPessoaId]=useState<number|undefined>();
    const [pessoaOriginal,setPessoaOriginal]=useState<Record<string,unknown>|null>(null);
    const [pfId,setPfId]=useState<number|undefined>();
    const [pfOriginal,setPfOriginal]=useState<Record<string,unknown>|null>(null);

    useEffect(()=>{
        if(!idParam) return;
        let alive=true;
        (async()=>{
            try{
                const usu = (await api.get<Record<string,unknown>>(`/api/basico/usuario/${idParam}`)).data;
                let pes:Record<string,unknown>|null=null;
                let pf:Record<string,unknown>|null=null;
                if(usu.pessoaId){
                    pes = (await api.get<Record<string,unknown>>(`/api/basico/pessoa/${usu.pessoaId}`)).data;
                    if(pes?.id) try{ pf = (await api.get<Record<string,unknown>>(`/api/basico/pessoa-fisica/por-pessoa/${pes.id}`)).data; }catch{
                        try{ pf = (await api.get<Record<string,unknown>>(`/api/basico/pessoa-fisica/${pes.id}`)).data;}catch{/*ignore*/}
                    }
                }
                if(!alive) return;
                setUsuarioId(usu.id as number);
                setUsuarioOriginal(usu);
                setAtivo(usu.ativo!==false);
                setPessoaId(pes?.id as number|undefined);
                setPessoaOriginal(pes);
                setPfId(pf?.id as number|undefined);
                setPfOriginal(pf);
                setF({
                    login:String(usu.login??''), senha:'',
                    cpf:String(pf?.cpf??''), rg:String(pf?.rg??''), nome:String(pf?.nome??''), email:String(pes?.email??''),
                    nomeSocial:String(pf?.nomeSocial??''), dataNascimento:String(pf?.dataNascimento??'').split('T')[0],
                    nomePai:String(pf?.nomePai??''), nomeMae:String(pf?.nomeMae??''),
                    telefoneResidencial:String(pes?.telefone??''), celular:String(pes?.celular??''),
                    nomeReferencia:String(pf?.nomeReferencia??''), telefoneReferencia:String(pf?.telefoneReferencia??''), celularReferencia:String(pf?.celularReferencia??''),
                    nomeReferencia2:String(pf?.nomeReferencia2??''), telefoneReferencia2:String(pf?.telefoneReferencia2??''), celularReferencia2:String(pf?.celularReferencia2??''),
                    generoId:pf?.generoId!=null?String(pf.generoId):'', etniaId:pf?.etniaId!=null?String(pf.etniaId):'',
                    estadoCivilId:pf?.estadoCivilId!=null?String(pf.estadoCivilId):'', escolaridadeId:pf?.escolaridadeId!=null?String(pf.escolaridadeId):'',
                });
                setObservacao(String(pes?.observacao??''));
                // Endereco - carrega dados da edição fiel ao formPessoaFisica (logradouroController)
                if(pes){
                    const cepVal=String((pes as any)?.cep ?? ''), numVal=String((pes as any)?.numero ?? ''), compVal=String((pes as any)?.complemento ?? '');
                    const idLog=(pes as any)?.id_logradouro ?? (pes as any)?.logradouroId;
                    setNumero(numVal); setComplemento(compVal);
                    if(idLog){
                        try{
                            const logRes=(await api.get<Record<string, unknown>>(`/api/basico/logradouro/${idLog}`)).data;
                            setLogradouroId(logRes.id as number);
                            setLogradouro(String((logRes as any)?.descricao ?? ''));
                            setCep(String((logRes as any)?.cep ?? cepVal) ? formatCep(String((logRes as any)?.cep ?? cepVal)) : formatCep(cepVal));
                            if((logRes as any)?.id_bairro){
                                const bRes=(await api.get<Record<string, unknown>>(`/api/basico/bairro/${(logRes as any).id_bairro}`)).data;
                                setBairro(String((bRes as any)?.descricao ?? ''));
                                if((bRes as any)?.cidadeId){
                                    const cRes=(await api.get<Record<string, unknown>>(`/api/basico/cidade/${(bRes as any).cidadeId}`)).data;
                                    setCidade(String((cRes as any)?.cidadeEstado ?? (cRes as any)?.nome ?? ''));
                                }
                            }
                        }catch{ setCep(cepVal ? formatCep(cepVal) : ''); }
                    } else if(cepVal) setCep(formatCep(cepVal));
                }

                try{
                    const apply = (arr:any[], all:ApiItem[]) => { const ids=new Set(arr.map((x:any)=>String(x.id ?? x))); return all.filter(a=>ids.has(String((a as any).id))); };
                    
                    let perfisArr:any[] = [];
                    try { perfisArr = (await api.get<any[]>(`/api/basico/usuario/${idParam}/perfis`)).data ?? []; } catch {}
                    if(!perfisArr.length && (usu as any).perfis){ perfisArr = (usu as any).perfis; }
                    if(!perfisArr.length){ try{ const pIds = (await api.get<number[]>(`/api/basico/usuario/buscar-usuario-seu-perfil?entityId=${idParam}`)).data??[]; perfisArr = pIds.map(id=>({id})); }catch{} }
                    setPerfis(apply(perfisArr, allPerfis));

                    let agendasArr:any[] = [];
                    try { agendasArr = (await api.get<any[]>(`/api/basico/usuario/${idParam}/agendas`)).data ?? []; } catch {}
                    if(!agendasArr.length && (usu as any).agendas){ agendasArr = (usu as any).agendas; }
                    if(!agendasArr.length){ try{ const aIds = (await api.get<number[]>(`/api/basico/usuario/buscar-agendas-disponiveis?usuarioId=${idParam}`)).data??[]; agendasArr = aIds.map(id=>({id})); }catch{} }
                    setAgendas(apply(agendasArr, allAgendas));

                    let unidadesArr:any[] = [];
                    try { unidadesArr = (await api.get<any[]>(`/api/basico/usuario/${idParam}/unidades`)).data ?? []; } catch {}
                    if(!unidadesArr.length && (usu as any).unidades){ unidadesArr = (usu as any).unidades; }
                    if(!unidadesArr.length && pes?.id){ try{ const uIds = (await api.get<number[]>(`/api/basico/pessoa/buscar-unidades-disponiveis`, {params:{pessoaId: pes.id}})).data??[]; unidadesArr = uIds.map(id=>({id})); }catch{} }
                    if(!unidadesArr.length){ try{ const uIds = (await api.get<number[]>(`/api/basico/usuario/buscar-unidades-disponiveis?usuarioId=${idParam}`)).data??[]; unidadesArr = uIds.map(id=>({id})); }catch{} }
                    setUnidadesAcesso(apply(unidadesArr, allUnidades));

                    if((usu as any).unidadeDefaultId) setUnidadeDefaultId(String((usu as any).unidadeDefaultId));
                }catch(e){ console.error('Erro ao carregar acessos do usuário', e); }
            }catch(e){ console.error(e); Alert.alert('Erro','Erro ao carregar usuário.'); }
        })();
        return()=>{alive=false;};
    },[idParam, allPerfis, allAgendas, allUnidades]);

    const [salvando,setSalvando]=useState(false);

    const salvar=async()=>{
        if(!f.login.trim() || !f.nome.trim() || !f.cpf.trim()){ Alert.alert('Campos obrigatórios','Informe Login, Nome e CPF.'); return; }
        setSalvando(true);
        try{
            const usuBody:Record<string,unknown>={...(usuarioOriginal||{}), login:f.login, senha:f.senha||null, ativo, pessoaId:pessoaId||null};
            const resUsu = usuarioId ? await api.put(`/api/basico/usuario/${usuarioId}`, usuBody) : await api.post('/api/basico/usuario', usuBody);
            const novoUsuId=(resUsu.data as Record<string,unknown>)?.id ?? usuarioId;

            const pfBody:Record<string,unknown>={...(pfOriginal||{}), nome:f.nome, cpf:f.cpf, rg:f.rg||null, nomeSocial:f.nomeSocial||null, dataNascimento:f.dataNascimento||null,
                generoId:f.generoId?Number(f.generoId):null, etniaId:f.etniaId?Number(f.etniaId):null, estadoCivilId:f.estadoCivilId?Number(f.estadoCivilId):null, escolaridadeId:f.escolaridadeId?Number(f.escolaridadeId):null,
                nomePai:f.nomePai||null, nomeMae:f.nomeMae||null,
                nomeReferencia:f.nomeReferencia||null, telefoneReferencia:f.telefoneReferencia||null, celularReferencia:f.celularReferencia||null,
                nomeReferencia2:f.nomeReferencia2||null, telefoneReferencia2:f.telefoneReferencia2||null, celularReferencia2:f.celularReferencia2||null,
            };
            const resPf = pfId ? await api.put(`/api/basico/pessoa-fisica/${pfId}`, pfBody) : await api.post('/api/basico/pessoa-fisica', pfBody);
            const novoPfId=(resPf.data as Record<string,unknown>)?.id ?? pfId;

            const pessoaBody:Record<string,unknown>={...(pessoaOriginal||{}), email:f.email||null, telefone:f.telefoneResidencial||null, celular:f.celular||null,
                observacao:observacao||null, cep:cep||null, numero:numero||null, complemento:complemento||null, logradouroId:logradouroId||null };
            let novoPesId=pessoaId;
            if(pessoaId) await api.put(`/api/basico/pessoa/${pessoaId}`, pessoaBody);
            else novoPesId=((await api.post('/api/basico/pessoa', pessoaBody)).data as Record<string,unknown>)?.id as number|undefined;
            if(!pfId && novoPesId && novoPfId) await api.put(`/api/basico/pessoa-fisica/${novoPfId}`, {...pfBody, pessoaId:novoPesId});

            if(novoUsuId){
                if(unidadeDefaultId) try{ await api.put(`/api/basico/usuario/${novoUsuId}`, {unidadeDefaultId: Number(unidadeDefaultId)});}catch{/*ignore*/}
                try{ await api.put(`/api/basico/usuario/${novoUsuId}/perfis`, perfis.map(p => (p as any).id)); }catch{/*ignore*/}
                try{ await api.put(`/api/basico/usuario/${novoUsuId}/agendas`, agendas.map(a => (a as any).id)); }catch{/*ignore*/}
                try{ await api.put(`/api/basico/usuario/${novoUsuId}/unidades`, unidadesAcesso.map(u => (u as any).id)); }catch{/*ignore*/}
            }

            Alert.alert('Sucesso','Usuário salvo com sucesso.');
        }catch(e:any){ Alert.alert('Erro','Erro ao salvar.'); }
        finally{ setSalvando(false); }
    };

    return (
        <View style={s.container}>
            <View style={s.header}>
                <Text style={s.headerTitle}>Usuário — Cadastro</Text>
                <Text style={s.headerSub}>Preencha as 5 abas: Pessoal · Endereço · Documentos · Trabalho · Acessos</Text>
            </View>

            {/* tabs */}
            <View style={s.tabsRow}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{gap:6, paddingHorizontal:8}}>
                    {(['pessoal','endereco','documentos','trabalho','acessos'] as const).map(k=>(
                        <Pressable key={k} onPress={()=>setActiveTab(k)} style={[s.tab, activeTab===k && s.tabActive]}>
                            <Text style={[s.tabText, activeTab===k && s.tabTextActive]}>{k==='pessoal'?'Pessoal':k==='endereco'?'Endereço':k==='documentos'?'Documentos':k==='trabalho'?'Trabalho':'Acessos'}</Text>
                        </Pressable>
                    ))}
                </ScrollView>
            </View>

            <ScrollView style={s.content} contentContainerStyle={{padding:16, paddingBottom:100}} keyboardShouldPersistTaps="handled">
                {activeTab==='pessoal' && (
                    <View style={s.card}>
                        <Text style={s.sectionTitle}>Acesso</Text>
                        <View style={s.formRow}>
                            <View style={s.fieldHalf}><Field label="Login" required value={f.login} onChange={v=>upd('login',v)} placeholder="Login" /></View>
                            <View style={s.fieldHalf}><Field label="Senha" required value={f.senha} onChange={v=>upd('senha',v)} placeholder="Senha" secure /></View>
                        </View>
                        <Text style={s.sectionTitle}>Dados Pessoais</Text>
                        <View style={s.formRow}>
                            <View style={s.fieldHalf}><Field label="CPF" required value={f.cpf} onChange={v=>upd('cpf',formatCpf(v))} placeholder="999.999.999-99" keyboardType="numeric" /></View>
                            <View style={s.fieldHalf}><Field label="RG" value={f.rg} onChange={v=>upd('rg',v)} placeholder="RG" /></View>
                        </View>
                        <View style={s.formRow}>
                            <View style={s.fieldHalf}><Field label="Nome" required value={f.nome} onChange={v=>upd('nome',v)} placeholder="Nome completo" /></View>
                            <View style={s.fieldHalf}><Field label="E-mail" required value={f.email} onChange={v=>upd('email',v)} placeholder="E-mail" keyboardType="email-address" /></View>
                        </View>
                        <View style={s.formRow}>
                            <View style={s.fieldHalf}><Field label="Nome Social" required value={f.nomeSocial} onChange={v=>upd('nomeSocial',v)} placeholder="Nome social" /></View>
                            <View style={s.fieldHalf}><Field label="Data Nascimento" required value={f.dataNascimento} onChange={v=>upd('dataNascimento',v)} placeholder="AAAA-MM-DD" /></View>
                        </View>
                        <View style={s.formRow}>
                            <View style={s.fieldHalf}><Field label="Nome do Pai" value={f.nomePai} onChange={v=>upd('nomePai',v)} placeholder="Nome do pai" /></View>
                            <View style={s.fieldHalf}><Field label="Nome da Mãe" required value={f.nomeMae} onChange={v=>upd('nomeMae',v)} placeholder="Nome da mãe" /></View>
                        </View>
                        <Text style={s.sectionTitle}>Contato</Text>
                        <View style={s.formRow}>
                            <View style={s.fieldHalf}><Field label="Telefone Residencial" value={f.telefoneResidencial} onChange={v=>upd('telefoneResidencial',formatPhone(v))} placeholder="(99) 9999-9999" keyboardType="phone-pad" /></View>
                            <View style={s.fieldHalf}><Field label="Celular" value={f.celular} onChange={v=>upd('celular',formatPhone(v))} placeholder="(99) 99999-9999" keyboardType="phone-pad" /></View>
                        </View>
                        <View style={s.formRow}>
                            <View style={s.fieldHalf}><Field label="Nome Referência" required value={f.nomeReferencia} onChange={v=>upd('nomeReferencia',v)} placeholder="Nome referência" /></View>
                            <View style={s.fieldHalf}><Field label="Telefone Referência" value={f.telefoneReferencia} onChange={v=>upd('telefoneReferencia',formatPhone(v))} placeholder="(99) 9999-9999" keyboardType="phone-pad" /></View>
                        </View>
                        <View style={s.formRow}>
                            <View style={s.fieldHalf}><Field label="Celular Referência" value={f.celularReferencia} onChange={v=>upd('celularReferencia',formatPhone(v))} placeholder="(99) 99999-9999" keyboardType="phone-pad" /></View>
                            <View style={s.fieldHalf}><Field label="Nome Referência 2" value={f.nomeReferencia2} onChange={v=>upd('nomeReferencia2',v)} placeholder="Nome referência 2" /></View>
                        </View>
                        <View style={s.formRow}>
                            <View style={s.fieldHalf}><Field label="Telefone Referência 2" value={f.telefoneReferencia2} onChange={v=>upd('telefoneReferencia2',formatPhone(v))} placeholder="(99) 9999-9999" keyboardType="phone-pad" /></View>
                            <View style={s.fieldHalf}><Field label="Celular Referência 2" value={f.celularReferencia2} onChange={v=>upd('celularReferencia2',formatPhone(v))} placeholder="(99) 99999-9999" keyboardType="phone-pad" /></View>
                        </View>
                        <View style={s.formRow}>
                            <View style={s.fieldHalf}><SelectField label="Gênero" value={f.generoId} onChange={v=>upd('generoId',v)} options={generoOptions} /></View>
                            <View style={s.fieldHalf}><SelectField label="Etnia" value={f.etniaId} onChange={v=>upd('etniaId',v)} options={etniaOptions} /></View>
                        </View>
                        <View style={s.formRow}>
                            <View style={s.fieldHalf}><SelectField label="Estado Civil" required value={f.estadoCivilId} onChange={v=>upd('estadoCivilId',v)} options={estadoCivilOptions} /></View>
                            <View style={s.fieldHalf}><SelectField label="Escolaridade" required value={f.escolaridadeId} onChange={v=>upd('escolaridadeId',v)} options={escolaridadeOptions} /></View>
                        </View>
                    </View>
                )}

                {activeTab==='endereco' && (
                    <View style={s.card}>
                        <Text style={s.sectionTitle}>Endereço</Text>
                        <View style={s.fieldFull}>
                            <Text style={s.label}>CEP</Text>
                            <View style={{flexDirection:'row', gap:8, alignItems:'center'}}>
                                <TextInput style={[s.input, {flex:1}]} value={cep} onChangeText={v=>setCep(formatCep(v))} placeholder="99.999-999" placeholderTextColor={Colors.textPlaceholder} keyboardType="numeric" maxLength={9}/>
                                <Pressable style={[s.btnSmall, s.btnYellow]} onPress={handleBuscarCep} disabled={buscandoCep}><Text style={s.btnSmallText}>{buscandoCep?'...':'Busca'}</Text></Pressable>
                                <Pressable style={[s.btnSmall, s.btnGreen]} onPress={handleAjusteCep}><Text style={s.btnSmallText}>Ajuste</Text></Pressable>
                                <Pressable style={[s.btnSmall, s.btnRed]} onPress={handleNovoCep}><Text style={s.btnSmallText}>Novo</Text></Pressable>
                            </View>
                        </View>
                        <View style={s.fieldFull}><Field label="Cidade" required value={cidade} onChange={setCidade} placeholder="Digite 3 letras..." /></View>
                        <View style={s.fieldFull}><Field label="Bairro" required value={bairro} onChange={setBairro} placeholder="Digite 3 letras..." /></View>
                        <View style={s.fieldFull}><Field label="Logradouro" required value={logradouro} onChange={setLogradouro} placeholder="Digite 3 letras..." /></View>
                        <View style={s.fieldFull}><Field label="Número" required value={numero} onChange={setNumero} placeholder="Número" keyboardType="numeric" /></View>
                        <View style={s.fieldFull}><Text style={s.label}>Complemento</Text><TextInput style={[s.input,{height:80, textAlignVertical:'top'}]} value={complemento} onChangeText={setComplemento} placeholder="Complemento" multiline placeholderTextColor={Colors.textPlaceholder}/></View>
                    </View>
                )}

                {activeTab==='documentos' && (
                    <View style={s.card}>
                        <Text style={s.sectionTitle}>Dados do Documento</Text>
                        <View style={s.formRow}>
                            <View style={s.fieldHalf}><Field label="Qtd. filhos < 14 anos" value={doc.qtdFilhosMenor14} onChange={v=>updDoc('qtdFilhosMenor14',v)} placeholder="0" keyboardType="numeric" /></View>
                            <View style={s.fieldHalf}><Field label="Carteira de Trabalho *" value={doc.ctps} onChange={v=>updDoc('ctps',v)} placeholder="CTPS" /></View>
                        </View>
                        <View style={s.formRow}>
                            <View style={s.fieldHalf}><Field label="Série *" value={doc.serie} onChange={v=>updDoc('serie',v)} placeholder="Série" /></View>
                            <View style={s.fieldHalf}><Field label="PIS *" value={doc.pis} onChange={v=>updDoc('pis',v)} placeholder="999.9999.999-9" keyboardType="numeric" /></View>
                        </View>
                        <View style={s.formRow}>
                            <View style={s.fieldHalf}><Field label="Data Emissão RG" value={doc.dataEmissaoRg} onChange={v=>updDoc('dataEmissaoRg',v)} placeholder="AAAA-MM-DD" /></View>
                            <View style={s.fieldHalf}><Field label="Órgão Emissor" value={doc.orgaoEmissorRg} onChange={v=>updDoc('orgaoEmissorRg',v)} placeholder="Órgão" /></View>
                        </View>
                        <View style={s.formRow}>
                            <View style={s.fieldHalf}><Field label="Título Eleitor" value={doc.tituloEleitor} onChange={v=>updDoc('tituloEleitor',v)} placeholder="Título" /></View>
                            <View style={s.fieldHalf}><Field label="Zona" value={doc.zona} onChange={v=>updDoc('zona',v)} placeholder="Zona" /></View>
                        </View>
                        <View style={s.formRow}>
                            <View style={s.fieldHalf}><Field label="Seção" value={doc.secao} onChange={v=>updDoc('secao',v)} placeholder="Seção" /></View>
                            <View style={s.fieldHalf}><Field label="Carteira Reservista" value={doc.carteiraReservista} onChange={v=>updDoc('carteiraReservista',v)} placeholder="Reservista" /></View>
                        </View>
                        <Text style={[s.sectionTitle,{marginTop:16}]}>Arquivos — itens com * são obrigatórios</Text>
                        <View style={{gap:10}}>
                            <DocUpload label="Foto 3x4 *" required value={foto3x4} onChange={setFoto3x4}/>
                            <DocUpload label="CTPS pág. 1 *" required value={ctps1} onChange={setCtps1}/>
                            <DocUpload label="CTPS pág. 2 *" required value={ctps2} onChange={setCtps2}/>
                            <DocUpload label="Contrato de Trabalho *" required value={contrato} onChange={setContrato}/>
                            <DocUpload label="Comprovante Residência *" required value={compRes} onChange={setCompRes}/>
                            <DocUpload label="CPF *" required value={docCpf} onChange={setDocCpf}/>
                            <DocUpload label="RG – Frente" value={rgFrente} onChange={setRgFrente}/>
                            <DocUpload label="RG – Verso" value={rgVerso} onChange={setRgVerso}/>
                            <DocUpload label="Título Eleitoral" value={docTitulo} onChange={setDocTitulo}/>
                            <DocUpload label="Carteira Reservista" value={docReserv} onChange={setDocReserv}/>
                        </View>
                    </View>
                )}

                {activeTab==='trabalho' && (
                    <View style={s.card}>
                        <Text style={s.sectionTitle}>Trabalho</Text>
                        <Toggle label="Ativo" value={ativo} onChange={setAtivo} onText="Ativo" offText="Inativo"/>
                        <View style={s.formRow}>
                            <View style={s.fieldHalf}><SelectField label="Função *" value={funcaoId} onChange={setFuncaoId} options={funcoes.map(f=>({value:String(f.id), label:f.label}))} /></View>
                            <View style={s.fieldHalf}><Field label="Data Admissão" value={dataAdmissao} onChange={setDataAdmissao} placeholder="AAAA-MM-DD" /></View>
                        </View>
                        <View style={s.field}>
                            <Text style={s.label}>Regime</Text>
                            <View style={{flexDirection:'row', gap:10, flex:1}}>
                                <Pressable onPress={()=>setMensalista('M')} style={[s.radio, mensalista==='M'&&s.radioActive]}><Text style={[s.radioText, mensalista==='M'&&s.radioTextActive]}>Mensalista</Text></Pressable>
                                <Pressable onPress={()=>setMensalista('H')} style={[s.radio, mensalista==='H'&&s.radioActive]}><Text style={[s.radioText, mensalista==='H'&&s.radioTextActive]}>Horista</Text></Pressable>
                            </View>
                        </View>
                        {mensalista==='M' && (
                            <View style={{marginTop:8}}>
                                <MasterDetail label="Turnos de Trabalho" source={TURNO_TRABALHO_SOURCE} valueKey="id" searchKeys={TURNO_TRABALHO_SEARCH} columns={TURNO_TRABALHO_COLUMNS} items={turnos} onChange={setTurnos}/>
                            </View>
                        )}
                        <View style={s.field}><Text style={s.label}>Observação</Text><TextInput style={[s.input,{height:80, textAlignVertical:'top'}]} value={observacao} onChangeText={setObservacao} placeholder="Observações" multiline placeholderTextColor={Colors.textPlaceholder}/></View>
                    </View>
                )}

                {activeTab==='acessos' && (
                    <View style={s.card}>
                        <Text style={s.sectionTitle}>Acessos</Text>
                        <View style={s.subTabs}>
                            {(['unidade','perfil','agenda'] as const).map(k=>(
                                <Pressable key={k} onPress={()=>setAcessoSub(k)} style={[s.subTab, acessoSub===k && s.subTabActive]}>
                                    <Text style={[s.subTabText, acessoSub===k && s.subTabTextActive]}>{k==='unidade'?'Unidade':k==='perfil'?'Perfil':'Agenda'}</Text>
                                </Pressable>
                            ))}
                        </View>
                        {acessoSub==='unidade' && (
                            <View>
                                <MasterDetail label="Unidade" source={UNIDADE_SOURCE} valueKey="id" searchKeys={UNIDADE_SEARCH} columns={UNIDADE_COLUMNS} items={unidadesAcesso} onChange={setUnidadesAcesso}/>
                                <SelectField label="Unidade Padrão *" value={unidadeDefaultId} onChange={setUnidadeDefaultId} options={unidadesAcesso.map(u=>({value:String((u as any).id), label:(u as any).sucinto??(u as any).razaoSocial??String((u as any).id)}))} />
                            </View>
                        )}
                        {acessoSub==='perfil' && (
                            <PerfilCombo
                                label="Perfil"
                                value={perfilSelected}
                                onChange={setPerfilSelected}
                                onAdd={(opt) => {
                                    if (opt) {
                                        setPerfis([...perfis, {id: opt.id, descricao: opt.label} as ApiItem]);
                                        setPerfilSelected(null);
                                    }
                                }}
                            />
                        )}
                        {acessoSub==='agenda' && (
                            <View style={{gap: 12}}>
                                <AgendaCombo
                                    label="Agenda"
                                    value={agendaSelected}
                                    onChange={setAgendaSelected}
                                    onAdd={(opt) => {
                                        if (opt) {
                                            setAgendas([...agendas, {id: opt.id, descricao: opt.label} as ApiItem]);
                                            setAgendaSelected(null);
                                        }
                                    }}
                                />
                                <View style={{marginBottom:12, gap:8}}>
                                    <Toggle label="Agendar" value={agendaPerm.agendar} onChange={v=>setAgendaPerm(p=>({...p,agendar:v}))}/>
                                    <Toggle label="Alterar" value={agendaPerm.alterar} onChange={v=>setAgendaPerm(p=>({...p,alterar:v}))}/>
                                    <Toggle label="Fechar" value={agendaPerm.fechar} onChange={v=>setAgendaPerm(p=>({...p,fechar:v}))}/>
                                    <Toggle label="Iniciar" value={agendaPerm.iniciar} onChange={v=>setAgendaPerm(p=>({...p,iniciar:v}))}/>
                                    <Toggle label="Atender" value={agendaPerm.atender} onChange={v=>setAgendaPerm(p=>({...p,atender:v}))}/>
                                </View>
                                <Text style={[s.hint, {marginBottom:8}]}>Permissões aplicadas às agendas selecionadas (bas_usuario_agenda).</Text>
                            </View>
                        )}
                    </View>
                )}
            </ScrollView>

            <View style={s.footer}>
                <Pressable style={[s.btn, s.btnYellow]} onPress={()=> Alert.alert('Voltar','Voltar para listagem')}><Text style={s.btnText}>Voltar</Text></Pressable>
                <Pressable style={[s.btn, s.btnBlue]} onPress={salvar} disabled={salvando}><Text style={s.btnText}>{salvando?'Salvando...':'Salvar'}</Text></Pressable>
            </View>
        </View>
    );
}

const s=StyleSheet.create({
    container:{flex:1, backgroundColor:Colors.bgPrimary},
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
    formRow:{flexDirection:'row', flexWrap:'wrap', gap:Spacing.md},
    fieldHalf:{width:'47%'},
    fieldFull:{width:'100%'},
    label:{fontSize:Typography.sizes.sm, fontWeight:Typography.weights.semibold, color:Colors.textPrimary},
    req:{color:Colors.error},
    input:{flex:1, height:44, borderWidth:1, borderColor:Colors.borderMedium, borderRadius:BorderRadius.md, paddingHorizontal:12, fontSize:Typography.sizes.md, color:Colors.textPrimary, backgroundColor:Colors.bgPrimary},
    selectGroup:{flex:1, gap:Spacing.xs},
    selectBox:{height:44, borderWidth:1, borderColor:Colors.borderMedium, borderRadius:BorderRadius.md, paddingHorizontal:12, flexDirection:'row', alignItems:'center', justifyContent:'space-between', backgroundColor:Colors.bgPrimary},
    selectText:{fontSize:Typography.sizes.md, color:Colors.textPrimary},
    selectArrow:{fontSize:12, color:Colors.textLight},
    selectDropdown:{marginTop:6, borderWidth:1, borderColor:Colors.borderLight, borderRadius:BorderRadius.md, backgroundColor:Colors.bgSecondary, overflow:'hidden'},
    selectOption:{paddingVertical:10, paddingHorizontal:12, borderBottomWidth:1, borderBottomColor:'#f0f0f0'},
    selectOptionActive:{backgroundColor:'#e8f0fe'},
    selectOptionText:{fontSize:13, color:Colors.textPrimary},
    selectOptionTextActive:{color:Colors.primary, fontWeight:Typography.weights.bold},
    hint:{fontSize:11, color:Colors.textLight, fontStyle:'italic'},
    btnSmall:{borderRadius:BorderRadius.md, paddingHorizontal:14, paddingVertical:10, alignItems:'center'},
    btnYellow:{backgroundColor:Colors.btnYellow},
    btnSmallText:{color:Colors.textWhite, fontWeight:Typography.weights.bold, fontSize:12},
    btn:{borderRadius:BorderRadius.lg, paddingHorizontal:18, paddingVertical:12, alignItems:'center', minWidth:120, ...Shadows.small},
    btnGreen:{backgroundColor:Colors.btnGreen},
    btnRed:{backgroundColor:Colors.error},
    btnBlue:{backgroundColor:Colors.primary},
    btnText:{color:Colors.textWhite, fontWeight:Typography.weights.bold, fontSize:13},
    addrCard:{borderWidth:1, borderColor:Colors.borderLight, borderRadius:BorderRadius.md, padding:10, backgroundColor:'#fafafa'},
    addrText:{fontSize:12, color:Colors.textPrimary, fontWeight:Typography.weights.semibold},
    addrSub:{fontSize:11, color:Colors.textMuted, marginTop:2},
    addrRemove:{marginTop:6, alignSelf:'flex-start', backgroundColor:Colors.error, borderRadius:BorderRadius.md, paddingHorizontal:10, paddingVertical:6},
    addrRemoveText:{color:Colors.textWhite, fontSize:11, fontWeight:Typography.weights.bold},
    docCard:{borderWidth:1, borderColor:Colors.borderLight, borderRadius:BorderRadius.md, padding:10, backgroundColor:'#fafafa', gap:8},
    docLabel:{fontSize:12, fontWeight:Typography.weights.bold, color:Colors.textPrimary},
    docPreview:{height:120, borderRadius:BorderRadius.md, backgroundColor:Colors.bgPrimary, overflow:'hidden', justifyContent:'center', alignItems:'center', borderWidth:1, borderColor:Colors.borderLight},
    docImage:{width:'100%', height:'100%'},
    docFileText:{fontSize:10, color:Colors.textMuted, padding:8},
    docEmpty:{height:80, borderRadius:BorderRadius.md, backgroundColor:Colors.bgPrimary, justifyContent:'center', alignItems:'center', borderWidth:1, borderStyle:'dashed', borderColor:Colors.borderMedium},
    docEmptyText:{fontSize:12, color:Colors.textLight},
    docActions:{flexDirection:'row', gap:8},
    docBtn:{flex:1, backgroundColor:Colors.primary, borderRadius:BorderRadius.md, paddingVertical:10, alignItems:'center'},
    docBtnText:{color:Colors.textWhite, fontWeight:Typography.weights.bold, fontSize:12},
    docBtnGhost:{flex:1, backgroundColor:Colors.bgPrimary, borderWidth:1, borderColor:Colors.error, borderRadius:BorderRadius.md, paddingVertical:10, alignItems:'center'},
    docBtnGhostText:{color:Colors.error, fontWeight:Typography.weights.bold, fontSize:12},
    toggleRow:{flexDirection:'row', alignItems:'center', gap:10, paddingVertical:6},
    toggleTrack:{width:44, height:26, borderRadius:13, backgroundColor:Colors.toggleOff, padding:2, justifyContent:'center'},
    toggleTrackOn:{backgroundColor:Colors.toggleOn},
    toggleThumb:{width:22, height:22, borderRadius:11, backgroundColor:Colors.toggleThumb, ...Shadows.small},
    toggleThumbOn:{alignSelf:'flex-end'},
    toggleLabel:{fontSize:13, color:Colors.textPrimary, fontWeight:Typography.weights.medium},
    radio:{flex:1, borderWidth:1, borderColor:Colors.borderMedium, borderRadius:BorderRadius.md, paddingVertical:10, alignItems:'center', backgroundColor:Colors.bgPrimary},
    radioActive:{backgroundColor:Colors.primary, borderColor:Colors.primary},
    radioText:{fontSize:13, color:Colors.textSecondary, fontWeight:Typography.weights.medium},
    radioTextActive:{color:Colors.textWhite},
    subTabs:{flexDirection:'row', gap:6, marginBottom:12},
    subTab:{flex:1, paddingVertical:8, borderRadius:BorderRadius.md, backgroundColor:Colors.bgPrimary, borderWidth:1, borderColor:Colors.borderLight, alignItems:'center'},
    subTabActive:{backgroundColor:Colors.primary, borderColor:Colors.primary},
    subTabText:{fontSize:12, fontWeight:Typography.weights.bold, color:Colors.textSecondary},
    subTabTextActive:{color:Colors.textWhite},
    footer:{flexDirection:'row', justifyContent:'flex-end', gap:10, padding:Spacing.lg, backgroundColor:Colors.bgSecondary, borderTopWidth:1, borderTopColor:Colors.borderLight, ...Shadows.medium},
});
