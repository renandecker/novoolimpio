import {useEffect, useState} from 'react';
import {useNavigate, useSearchParams} from 'react-router-dom';
import {useQuery} from '@tanstack/react-query';
import {PermissionGate} from '../../shared/services/permissions';
import {Tabs} from '../../shared/components/Tabs';
import {MasterDetail} from '../../shared/components/MasterDetail';
import {BooleanField} from '../../shared/components/BooleanField';
import {Base64FileUpload} from '../../shared/components/Base64FileUpload';
import type {Endereco} from '../../shared/components/EnderecoForm';
import type {ApiItem} from '../../shared/types/index';
import {api} from '../../shared/services/api';
import {
    PERFIL_SOURCE, PERFIL_COLUMNS, PERFIL_SEARCH,
    UNIDADE_SOURCE, UNIDADE_COLUMNS, UNIDADE_SEARCH,
    AGENDA_SOURCE, AGENDA_COLUMNS, AGENDA_SEARCH,
    TURNO_TRABALHO_SOURCE, TURNO_TRABALHO_COLUMNS, TURNO_TRABALHO_SEARCH,
} from '../../shared/services/masterDetailSources';
import {GENEROS, ETNIAS, ESTADOS_CIVIS, ESCOLARIDADES, formatCpf, formatPhone, str, num, semId, toDateInput} from '../../features/auth/cadastroUsuarioTypes';

type Option = {value: string; label: string};
const asOptions = (arr: Array<{id: number; descricao?: string; nome?: string}>): Option[] =>
    (Array.isArray(arr) ? arr : []).map((x) => ({value: String(x.id), label: x.descricao ?? x.nome ?? String(x.id)}));

// ── helpers ──────────────────────────────────────────────────────────
const requiredMark = <span style={{color:'#C90000',marginLeft:4}}>*</span>;

const sectionTitleStyle: React.CSSProperties = {
    fontSize: '13px',
    fontWeight: 700,
    color: '#2f333b',
    marginBottom: '12px',
    marginTop: '16px',
    letterSpacing: '0.5px',
    textTransform: 'uppercase' as const,
};

// ── Documento upload card ────────────────────────────────────────────
function DocCard({label, required, value, onChange}:{label:string; required?:boolean; value:string; onChange:(v:string)=>void}){
    return (
        <div style={{display:'flex', flexDirection:'column', gap:6, border:'1px solid #e0e0e0',borderRadius:6,padding:12,background:'#fafafa'}}>
            <span className="form-label" style={{fontWeight:700,fontSize:12}}>{label} {required && requiredMark}</span>
            <Base64FileUpload value={value} onChange={onChange} accept="image/*,application/pdf" label={label} />
        </div>
    );
}

// ── Componente principal ─────────────────────────────────────────────
export default function ViewUsuarioFormUsuarioListScreen(){
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const idParam = searchParams.get('id');

    // ── form state (Pessoal) ─────────────────────────────────────────
    const [f,setF] = useState<Record<string,string>>({
        login:'', senha:'', cpf:'', rg:'', nome:'', email:'', nomeSocial:'', dataNascimento:'',
        nomePai:'', nomeMae:'', telefoneResidencial:'', celular:'',
        nomeReferencia:'', telefoneReferencia:'', celularReferencia:'',
        nomeReferencia2:'', telefoneReferencia2:'', celularReferencia2:'',
        generoId:'', etniaId:'', estadoCivilId:'', escolaridadeId:'',
    });
    const upd = (k:string,v:string)=> setF(p=>({...p,[k]:v}));

    // ── Endereço ─────────────────────────────────────────────────────
    const [enderecos,setEnderecos]=useState<Endereco[]>([]);

    // ── Documentos (campos) ──────────────────────────────────────────
    const [doc,setDoc]=useState<Record<string,string>>({
        qtdFilhosMenor14:'', ctps:'', serie:'', pis:'', dataEmissaoRg:'', orgaoEmissorRg:'',
        tituloEleitor:'', zona:'', secao:'', carteiraReservista:'',
    });
    const updDoc=(k:string,v:string)=> setDoc(p=>({...p,[k]:v}));
    const [foto3x4,setFoto3x4]=useState('');
    const [ctps1,setCtps1]=useState('');
    const [ctps2,setCtps2]=useState('');
    const [contrato,setContrato]=useState('');
    const [comprovResidencia,setComprovResidencia]=useState('');
    const [docCpf,setDocCpf]=useState('');
    const [docRgFrente,setDocRgFrente]=useState('');
    const [docRgVerso,setDocRgVerso]=useState('');
    const [docTitulo,setDocTitulo]=useState('');
    const [docReservista,setDocReservista]=useState('');

    // ── Trabalho ─────────────────────────────────────────────────────
    const [ativo,setAtivo]=useState(true);
    const [funcaoId,setFuncaoId]=useState('');
    const [dataAdmissao,setDataAdmissao]=useState('');
    const [mensalista,setMensalista]=useState<'M'|'H'>('M');
    const [observacao,setObservacao]=useState('');
    const [turnosTrabalho,setTurnosTrabalho]=useState<ApiItem[]>([]);
    const [funcoes,setFuncoes]=useState<Array<{id:number,descricao:string}>>([]);
    useEffect(()=>{(async()=>{
        try{
            const r = await api.get<any[]>('/api/basico/funcao');
            const arr = Array.isArray(r.data)?r.data: (r.data as any)?.content ?? [];
            setFuncoes(arr.map((x:any)=>({id:x.id, descricao:x.descricao ?? x.nome ?? String(x.id)})));
        }catch{
            try{
                const r2 = await api.get<any[]>('/api/central/funcao');
                const arr2 = Array.isArray(r2.data)?r2.data: (r2.data as any)?.content ?? [];
                setFuncoes(arr2.map((x:any)=>({id:x.id, descricao:x.descricao ?? x.nome ?? String(x.id)})));
            }catch{/* ignore */}
        }
    })();},[]);

    // ── Opções carregadas por API (gênero, etnia, estado civil, escolaridade) ──
    const [generoOptions,setGeneroOptions]=useState<Option[]>(GENEROS);
    const [etniaOptions,setEtniaOptions]=useState<Option[]>(ETNIAS);
    const [estadoCivilOptions,setEstadoCivilOptions]=useState<Option[]>(ESTADOS_CIVIS);
    const [escolaridadeOptions,setEscolaridadeOptions]=useState<Option[]>(ESCOLARIDADES);
    useEffect(()=>{(async()=>{
        try{
            const r = await api.get<any[]>('/api/basico/genero');
            const arr = Array.isArray(r.data)?r.data:(r.data as any)?.content??[];
            if(arr.length) setGeneroOptions(arr.map((x:any)=>({value:String(x.id), label:x.descricao??x.nome??String(x.id)})));
        }catch{/* mantém GENEROS */ }
        try{
            const r = await api.get<any[]>('/api/basico/etnia');
            const arr = Array.isArray(r.data)?r.data:(r.data as any)?.content??[];
            if(arr.length) setEtniaOptions(arr.map((x:any)=>({value:String(x.id), label:x.descricao??x.nome??String(x.id)})));
        }catch{/* mantém ETNIAS */ }
        try{
            const r = await api.get<any[]>('/api/basico/estado-civil');
            const arr = Array.isArray(r.data)?r.data:(r.data as any)?.content??[];
            if(arr.length) setEstadoCivilOptions(arr.map((x:any)=>({value:String(x.id), label:x.descricao??x.nome??String(x.id)})));
        }catch{/* mantém ESTADOS_CIVIS */ }
        try{
            const r = await api.get<any[]>('/api/basico/escolaridade');
            const arr = Array.isArray(r.data)?r.data:(r.data as any)?.content??[];
            if(arr.length) setEscolaridadeOptions(arr.map((x:any)=>({value:String(x.id), label:x.descricao??x.nome??String(x.id)})));
        }catch{/* mantém ESCOLARIDADES */ }
    })();},[]);
    const [acessoSub,setAcessoSub]=useState<'unidade'|'perfil'|'agenda'>('unidade');
    const [unidadesAcesso,setUnidadesAcesso]=useState<ApiItem[]>([]);
    const [unidadeDefaultId,setUnidadeDefaultId]=useState('');
    const [perfis,setPerfis]=useState<ApiItem[]>([]);
    const [agendas,setAgendas]=useState<ApiItem[]>([]);
    // agenda permissões (aplica ao conjunto selecionado – simplificado)
    const [agendaPerm,setAgendaPerm]=useState({agendar:false, alterar:false, fechar:false, iniciar:false, atender:false});

    // ── ids p/ edição ────────────────────────────────────────────────
    const [usuarioId,setUsuarioId]=useState<number|undefined>();
    const [usuarioOriginal,setUsuarioOriginal]=useState<Record<string,unknown>|null>(null);
    const [pessoaId,setPessoaId]=useState<number|undefined>();
    const [pessoaOriginal,setPessoaOriginal]=useState<Record<string,unknown>|null>(null);
    const [pfId,setPfId]=useState<number|undefined>();
    const [pfOriginal,setPfOriginal]=useState<Record<string,unknown>|null>(null);
    const [salvando,setSalvando]=useState(false);
    const [error,setError]=useState<string|undefined>();

    // ── queries p/ preencher MasterDetail existentes ─────────────────
    const {data:allUnidades=[]}=useQuery({queryKey:[UNIDADE_SOURCE], queryFn:async()=>(await api.get<ApiItem[]>(UNIDADE_SOURCE)).data});
    const {data:allPerfis=[]}=useQuery({queryKey:[PERFIL_SOURCE], queryFn:async()=>(await api.get<ApiItem[]>(PERFIL_SOURCE)).data});
    const {data:allAgendas=[]}=useQuery({queryKey:[AGENDA_SOURCE], queryFn:async()=>(await api.get<ApiItem[]>(AGENDA_SOURCE)).data});

    // ── carregar edição ──────────────────────────────────────────────
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
                    login:str(usu.login), senha:'',
                    cpf:str(pf?.cpf), rg:str(pf?.rg), nome:str(pf?.nome), email:str(pes?.email),
                    nomeSocial:str(pf?.nomeSocial), dataNascimento:toDateInput(pf?.dataNascimento),
                    nomePai:str(pf?.nomePai), nomeMae:str(pf?.nomeMae),
                    telefoneResidencial:str(pes?.telefone), celular:str(pes?.celular),
                    nomeReferencia:str(pf?.nomeReferencia), telefoneReferencia:str(pf?.telefoneReferencia), celularReferencia:str(pf?.celularReferencia),
                    nomeReferencia2:str(pf?.nomeReferencia2), telefoneReferencia2:str(pf?.telefoneReferencia2), celularReferencia2:str(pf?.celularReferencia2),
                    generoId:pf?.generoId!=null?String(pf.generoId):'', etniaId:pf?.etniaId!=null?String(pf.etniaId):'',
                    estadoCivilId:pf?.estadoCivilId!=null?String(pf.estadoCivilId):'', escolaridadeId:pf?.escolaridadeId!=null?String(pf.escolaridadeId):'',
                });
                setObservacao(str(pes?.observacao));
                // endereço
                if(pes){
                    const cep=str(pes.cep), complemento=str(pes.complemento), numero=str(pes.numero);
                    const idLog = (pes as any).id_logradouro ?? (pes as any).logradouroId as number|undefined;
                    const enderecosCarregados:Endereco[]=[];
                    if(idLog){
                        try{
                            const logRes=(await api.get<Record<string,unknown>>(`/api/basico/logradouro/${idLog}`)).data;
                            let bairroDesc='',cidadeDesc='';
                            if(logRes.id_bairro){
                                const bRes=(await api.get<Record<string,unknown>>(`/api/basico/bairro/${logRes.id_bairro}`)).data;
                                bairroDesc=str(bRes.descricao);
                                if((bRes as any).cidadeId){
                                    const cRes=(await api.get<Record<string,unknown>>(`/api/basico/cidade/${(bRes as any).cidadeId}`)).data;
                                    cidadeDesc=str((cRes as any).nome ?? cRes.descricao);
                                }
                            }
                            enderecosCarregados.push({id:idLog, cep:str(logRes.cep)||cep, logradouro:str(logRes.descricao), bairro:bairroDesc, cidade:cidadeDesc, numero, complemento});
                        }catch{ if(cep||numero||complemento) enderecosCarregados.push({cep,cidade:'',bairro:'',logradouro:'',numero,complemento});}
                    } else if(cep||numero||complemento) enderecosCarregados.push({cep,cidade:'',bairro:'',logradouro:'',numero,complemento});
                    setEnderecos(enderecosCarregados);
                }
                // m2m – perfis, agendas, unidades
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
            }catch(e){ console.error(e); alert('Erro ao carregar usuário.');}
        })();
        return()=>{alive=false;};
    },[idParam, allPerfis, allAgendas, allUnidades]);

    const voltar=()=> navigate('/view/usuario/listUsuario');

    const salvar=async(voltarDepois:boolean)=>{
        if(!f.login.trim() || !f.nome.trim() || !f.cpf.trim()){ setError('Informe Login, Nome e CPF.'); return; }
        setSalvando(true); setError(undefined);
        try{
            const usuBody:Record<string,unknown>={...semId(usuarioOriginal), login:f.login, senha:f.senha||null, ativo, pessoaId:pessoaId||null};
            const resUsu = usuarioId ? await api.put(`/api/basico/usuario/${usuarioId}`, usuBody) : await api.post('/api/basico/usuario', usuBody);
            const novoUsuId=(resUsu.data as Record<string,unknown>)?.id ?? usuarioId;

            const pfBody:Record<string,unknown>={...semId(pfOriginal), nome:f.nome, cpf:f.cpf, rg:f.rg||null, nomeSocial:f.nomeSocial||null, dataNascimento:f.dataNascimento||null,
                generoId:num(f.generoId), etniaId:num(f.etniaId), estadoCivilId:num(f.estadoCivilId), escolaridadeId:num(f.escolaridadeId),
                nomePai:f.nomePai||null, nomeMae:f.nomeMae||null,
                nomeReferencia:f.nomeReferencia||null, telefoneReferencia:f.telefoneReferencia||null, celularReferencia:f.celularReferencia||null,
                nomeReferencia2:f.nomeReferencia2||null, telefoneReferencia2:f.telefoneReferencia2||null, celularReferencia2:f.celularReferencia2||null,
            };
            const resPf = pfId ? await api.put(`/api/basico/pessoa-fisica/${pfId}`, pfBody) : await api.post('/api/basico/pessoa-fisica', pfBody);
            const novoPfId=(resPf.data as Record<string,unknown>)?.id ?? pfId;

            const pessoaBody:Record<string,unknown>={...semId(pessoaOriginal), email:f.email||null, telefone:f.telefoneResidencial||null, celular:f.celular||null,
                observacao:observacao||null, cep:enderecos[0]?.cep||null, numero:enderecos[0]?.numero||null, complemento:enderecos[0]?.complemento||null };
            let novoPesId=pessoaId;
            if(pessoaId) await api.put(`/api/basico/pessoa/${pessoaId}`, pessoaBody);
            else novoPesId=((await api.post('/api/basico/pessoa', pessoaBody)).data as Record<string,unknown>)?.id as number|undefined;
            if(!pfId && novoPesId && novoPfId) await api.put(`/api/basico/pessoa-fisica/${novoPfId}`, {...pfBody, pessoaId:novoPesId});

            if(novoUsuId){
                if(unidadeDefaultId) try{ await api.put(`/api/basico/usuario/${novoUsuId}`, {unidadeDefaultId: Number(unidadeDefaultId)});}catch{/*ignore*/}
                if(turnosTrabalho.length) try{ await api.put(`/api/basico/usuario/${novoUsuId}/turnos-trabalho`, turnosTrabalho.map(t=> (t as any).id)); }catch{/*ignore*/}
                try{ await api.put(`/api/basico/usuario/${novoUsuId}/perfis`, perfis.map(p => (p as any).id)); }catch{/*ignore*/}
                try{ await api.put(`/api/basico/usuario/${novoUsuId}/agendas`, agendas.map(a => (a as any).id)); }catch{/*ignore*/}
                try{ await api.put(`/api/basico/usuario/${novoUsuId}/unidades`, unidadesAcesso.map(u => (u as any).id)); }catch{/*ignore*/}
            }

            if(voltarDepois) voltar(); else alert('Registro salvo com sucesso.');
        }catch(e){ console.error(e); setError('Erro ao salvar registro.');}
        finally{ setSalvando(false); }
    };

    // ── tab contents ─────────────────────────────────────────────────
    const tabPessoal = (
        <div className="form-grid">
            <label className="form-field"><span className="form-label">Login {requiredMark}</span>
                <input className="form-input" value={f.login} onChange={e=>upd('login',e.target.value)} placeholder="Login" /></label>
            <label className="form-field"><span className="form-label">Senha {requiredMark}</span>
                <input className="form-input" type="password" value={f.senha} onChange={e=>upd('senha',e.target.value)} placeholder="Senha" /></label>

            <label className="form-field"><span className="form-label">CPF {requiredMark}</span>
                <input className="form-input" value={f.cpf} onChange={e=>upd('cpf',formatCpf(e.target.value))} placeholder="999.999.999-99" maxLength={14}/></label>
            <label className="form-field"><span className="form-label">RG</span>
                <input className="form-input" value={f.rg} onChange={e=>upd('rg',e.target.value)} placeholder="RG" /></label>

            <label className="form-field"><span className="form-label">Nome {requiredMark}</span>
                <input className="form-input" value={f.nome} onChange={e=>upd('nome',e.target.value)} placeholder="Nome completo" /></label>
            <label className="form-field"><span className="form-label">E-mail {requiredMark}</span>
                <input className="form-input" type="email" value={f.email} onChange={e=>upd('email',e.target.value)} placeholder="E-mail" /></label>

            <label className="form-field"><span className="form-label">Nome Social {requiredMark}</span>
                <input className="form-input" value={f.nomeSocial} onChange={e=>upd('nomeSocial',e.target.value)} placeholder="Nome social" /></label>
            <label className="form-field"><span className="form-label">Data Nascimento {requiredMark}</span>
                <input className="form-input" type="date" value={f.dataNascimento} onChange={e=>upd('dataNascimento',e.target.value)} /></label>
            <label className="form-field"><span className="form-label">Nome do Pai</span>
                <input className="form-input" value={f.nomePai} onChange={e=>upd('nomePai',e.target.value)} placeholder="Nome do pai" /></label>
            <label className="form-field"><span className="form-label">Nome da Mãe {requiredMark}</span>
                <input className="form-input" value={f.nomeMae} onChange={e=>upd('nomeMae',e.target.value)} placeholder="Nome da mãe" /></label>

            {/* Contato */}
            <div style={{gridColumn:'1 / -1', borderTop:'1px solid #e6e6e6', marginTop:8, paddingTop:12, fontWeight:700, fontSize:13, color:'#2f333b'}}>Contato {requiredMark}</div>
            <label className="form-field"><span className="form-label">Telefone Residencial</span>
                <input className="form-input" value={f.telefoneResidencial} onChange={e=>upd('telefoneResidencial',formatPhone(e.target.value))} placeholder="(99) 9999-9999" /></label>
            <label className="form-field"><span className="form-label">Celular</span>
                <input className="form-input" value={f.celular} onChange={e=>upd('celular',formatPhone(e.target.value))} placeholder="(99) 99999-9999" /></label>
            <div style={{gridColumn:'1 / -1', display:'flex', alignItems:'center', gap:8, color:'#888', fontSize:12, marginTop:-4}}>Preencha Telefone <b>OU</b> Celular</div>

            <label className="form-field"><span className="form-label">Nome Referência {requiredMark}</span>
                <input className="form-input" value={f.nomeReferencia} onChange={e=>upd('nomeReferencia',e.target.value)} placeholder="Nome referência" /></label>
            <label className="form-field"><span className="form-label">Telefone Referência</span>
                <input className="form-input" value={f.telefoneReferencia} onChange={e=>upd('telefoneReferencia',formatPhone(e.target.value))} placeholder="(99) 9999-9999" /></label>

            <label className="form-field"><span className="form-label">Nome Referência 2</span>
                <input className="form-input" value={f.nomeReferencia2} onChange={e=>upd('nomeReferencia2',e.target.value)} placeholder="Nome referência 2" /></label>
            <label className="form-field"><span className="form-label">Telefone Referência 2</span>
                <input className="form-input" value={f.telefoneReferencia2} onChange={e=>upd('telefoneReferencia2',formatPhone(e.target.value))} placeholder="(99) 9999-9999" /></label>

            <label className="form-field"><span className="form-label">Celular Referência</span>
                <input className="form-input" value={f.celularReferencia} onChange={e=>upd('celularReferencia',formatPhone(e.target.value))} placeholder="(99) 99999-9999" /></label>
            <label className="form-field"><span className="form-label">Celular Referência 2</span>
                <input className="form-input" value={f.celularReferencia2} onChange={e=>upd('celularReferencia2',formatPhone(e.target.value))} placeholder="(99) 99999-9999" /></label>

            <label className="form-field"><span className="form-label">Gênero</span>
                <select className="form-input form-select" value={f.generoId} onChange={e=>upd('generoId',e.target.value)}>
                    <option value="">-- Selecione --</option>{generoOptions.map(o=> <option key={o.value} value={o.value}>{o.label}</option>)}
                </select></label>
            <label className="form-field"><span className="form-label">Etnia</span>
                <select className="form-input form-select" value={f.etniaId} onChange={e=>upd('etniaId',e.target.value)}>
                    <option value="">-- Selecione --</option>{etniaOptions.map(o=> <option key={o.value} value={o.value}>{o.label}</option>)}
                </select></label>
            <label className="form-field"><span className="form-label">Estado Civil {requiredMark}</span>
                <select className="form-input form-select" value={f.estadoCivilId} onChange={e=>upd('estadoCivilId',e.target.value)}>
                    <option value="">-- Selecione --</option>{estadoCivilOptions.map(o=> <option key={o.value} value={o.value}>{o.label}</option>)}
                </select></label>
            <label className="form-field"><span className="form-label">Escolaridade {requiredMark}</span>
                <select className="form-input form-select" value={f.escolaridadeId} onChange={e=>upd('escolaridadeId',e.target.value)}>
                    <option value="">-- Selecione --</option>{escolaridadeOptions.map(o=> <option key={o.value} value={o.value}>{o.label}</option>)}
                </select></label>
        </div>
    );

    const tabEndereco = (
        <div className="form-grid">
            <div style={sectionTitleStyle}>Endereço Principal</div>
            <label className="form-field" style={{gridColumn: '1 / -1'}}>
                <span className="form-label">CEP</span>
                <div style={{display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'nowrap', width: '100%'}}>
                    <input
                        className="form-input"
                        placeholder="99.999-999"
                        style={{width: '120px', flexShrink: 0}}
                        maxLength={9}
                        value={enderecos[0]?.cep ?? ''}
                        onChange={(event) => setEnderecos([{...enderecos[0], cep: event.target.value}])}
                    />
                    <button type="button" className="btnyellow" onClick={async () => {
                        const cep = (enderecos[0]?.cep ?? '').replace(/\D/g, '');
                        if (cep.length === 8) {
                            try {
                                const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
                                const data = await res.json();
                                if (!data.erro) {
                                    setEnderecos([{
                                        ...enderecos[0],
                                        cep: data.cep ? `${data.cep.slice(0,5)}-${data.cep.slice(5)}` : '',
                                        cidade: data.localidade ?? '',
                                        bairro: data.bairro ?? '',
                                        logradouro: data.logradouro ?? '',
                                    }]);
                                }
                            } catch {}
                        }
                    }}>
                        Buscar
                    </button>
                </div>
            </label>
            <label className="form-field" style={{gridColumn: '1 / -1'}}>
                <span className="form-label">Cidade</span>
                <input
                    className="form-input"
                    placeholder="Cidade"
                    value={enderecos[0]?.cidade ?? ''}
                    onChange={(event) => setEnderecos([{...enderecos[0], cidade: event.target.value}])}
                />
            </label>
            <label className="form-field" style={{gridColumn: '1 / -1'}}>
                <span className="form-label">Bairro</span>
                <input
                    className="form-input"
                    placeholder="Bairro"
                    value={enderecos[0]?.bairro ?? ''}
                    onChange={(event) => setEnderecos([{...enderecos[0], bairro: event.target.value}])}
                />
            </label>
            <label className="form-field" style={{gridColumn: '1 / -1'}}>
                <span className="form-label">Logradouro</span>
                <input
                    className="form-input"
                    placeholder="Logradouro"
                    value={enderecos[0]?.logradouro ?? ''}
                    onChange={(event) => setEnderecos([{...enderecos[0], logradouro: event.target.value}])}
                />
            </label>
            <label className="form-field" style={{gridColumn: '1 / -1'}}>
                <span className="form-label">Número</span>
                <input
                    className="form-input"
                    type="number"
                    placeholder="Número"
                    value={enderecos[0]?.numero ?? ''}
                    onChange={(event) => setEnderecos([{...enderecos[0], numero: event.target.value}])}
                />
            </label>
            <label className="form-field" style={{gridColumn: '1 / -1'}}>
                <span className="form-label">Complemento</span>
                <textarea
                    className="form-input"
                    placeholder="Complemento"
                    rows={3}
                    style={{minHeight: '80px'}}
                    value={enderecos[0]?.complemento ?? ''}
                    onChange={(event) => setEnderecos([{...enderecos[0], complemento: event.target.value}])}
                />
            </label>
        </div>
    );

    const tabDocumentos = (
        <div className="form-grid">
            <label className="form-field"><span className="form-label">Qtd. filhos &lt; 14 anos</span>
                <input className="form-input" type="number" value={doc.qtdFilhosMenor14} onChange={e=>updDoc('qtdFilhosMenor14',e.target.value)} placeholder="0" /></label>
            <label className="form-field"><span className="form-label">Carteira Reservista</span>
                <input className="form-input" value={doc.carteiraReservista} onChange={e=>updDoc('carteiraReservista',e.target.value)} placeholder="Reservista" /></label>
            <div style={{gridColumn:'1 / -1', height:1, background:'#e6e6e6', margin:'6px 0'}}/>
            <label className="form-field"><span className="form-label">Carteira Trabalho {requiredMark}</span>
                <input className="form-input" value={doc.ctps} onChange={e=>updDoc('ctps',e.target.value)} placeholder="CTPS" /></label>
            <label className="form-field"><span className="form-label">Série {requiredMark}</span>
                <input className="form-input" value={doc.serie} onChange={e=>updDoc('serie',e.target.value)} placeholder="Série" /></label>
            <label className="form-field"><span className="form-label">PIS {requiredMark}</span>
                <input className="form-input" value={doc.pis} onChange={e=>updDoc('pis',e.target.value)} placeholder="999.9999.999-9" /></label>
            <label className="form-field"><span className="form-label">Data Emissão RG</span>
                <input className="form-input" type="date" value={doc.dataEmissaoRg} onChange={e=>updDoc('dataEmissaoRg',e.target.value)} /></label>
            <label className="form-field"><span className="form-label">Órgão Emissor</span>
                <input className="form-input" value={doc.orgaoEmissorRg} onChange={e=>updDoc('orgaoEmissorRg',e.target.value)} placeholder="Órgão" /></label>
            <label className="form-field"><span className="form-label">Título Eleitor</span>
                <input className="form-input" value={doc.tituloEleitor} onChange={e=>updDoc('tituloEleitor',e.target.value)} placeholder="Título" /></label>
            <label className="form-field"><span className="form-label">Zona</span>
                <input className="form-input" value={doc.zona} onChange={e=>updDoc('zona',e.target.value)} placeholder="Zona" /></label>
            <label className="form-field"><span className="form-label">Seção</span>
                <input className="form-input" value={doc.secao} onChange={e=>updDoc('secao',e.target.value)} placeholder="Seção" /></label>

            <div style={{gridColumn:'1 / -1', borderTop:'1px solid #e6e6e6', marginTop:8, paddingTop:12}}>
                <div style={{fontWeight:700, fontSize:13, color:'#2f333b', marginBottom:8}}>Documentos — arquivos com <span style={{color:'#C90000'}}>*</span> são obrigatórios</div>
                <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(220px, 1fr))', gap:12}}>
                    <DocCard label="Foto 3x4 *" required value={foto3x4} onChange={setFoto3x4} />
                    <DocCard label="Carteira Trabalho pág. 1 *" required value={ctps1} onChange={setCtps1} />
                    <DocCard label="Carteira Trabalho pág. 2 *" required value={ctps2} onChange={setCtps2} />
                    <DocCard label="Contrato de Trabalho *" required value={contrato} onChange={setContrato} />
                    <DocCard label="Comprovante Residência *" required value={comprovResidencia} onChange={setComprovResidencia} />
                    <DocCard label="CPF *" required value={docCpf} onChange={setDocCpf} />
                    <DocCard label="RG – Frente" value={docRgFrente} onChange={setDocRgFrente} />
                    <DocCard label="RG – Verso" value={docRgVerso} onChange={setDocRgVerso} />
                    <DocCard label="Título Eleitoral" value={docTitulo} onChange={setDocTitulo} />
                    <DocCard label="Carteira Reservista" value={docReservista} onChange={setDocReservista} />
                </div>
                {doc.qtdFilhosMenor14 && Number(doc.qtdFilhosMenor14)>0 && (
                    <div style={{marginTop:12, padding:10, background:'#fffbe6', border:'1px solid #f0d98a', borderRadius:6, fontSize:12, color:'#6a5d00'}}>
                        Para cada filho menor de 14 informe: <b>Certidão de Nascimento</b> e <b>Carteira de Vacinação</b> na secretaria (anexo físico ou upload via secretaria).
                    </div>
                )}
            </div>
        </div>
    );

    const tabTrabalho = (
        <div className="form-grid">
            {!idParam ? null : (
                <label className="form-field"><span className="form-label">Ativo</span>
                    <BooleanField value={ativo} onChange={setAtivo} /></label>
            )}
            <label className="form-field"><span className="form-label">Data Admissão</span>
                <input className="form-input" type="date" value={dataAdmissao} onChange={e=>setDataAdmissao(e.target.value)} /></label>

            <label className="form-field"><span className="form-label">Função {requiredMark}</span>
                <select className="form-input form-select" value={funcaoId} onChange={e=>setFuncaoId(e.target.value)}>
                    <option value="">-- Selecione --</option>
                    {funcoes.map(fu=> <option key={fu.id} value={String(fu.id)}>{fu.descricao}</option>)}
                </select></label>
            <label className="form-field">
                <span className="form-label">Regime</span>
                <div style={{display:'flex', gap:12}}>
                    <label style={{display:'flex', alignItems:'center', gap:6, fontSize:13}}><input type="radio" checked={mensalista==='M'} onChange={()=>setMensalista('M')} /> Mensalista</label>
                    <label style={{display:'flex', alignItems:'center', gap:6, fontSize:13}}><input type="radio" checked={mensalista==='H'} onChange={()=>setMensalista('H')} /> Horista</label>
                </div>
            </label>

            {mensalista==='M' && (
                <div style={{gridColumn:'1 / -1'}}>
                    <MasterDetail label="Turnos de Trabalho" source={TURNO_TRABALHO_SOURCE} valueKey="id" searchKeys={TURNO_TRABALHO_SEARCH} columns={TURNO_TRABALHO_COLUMNS} items={turnosTrabalho} onChange={setTurnosTrabalho} />
                </div>
            )}

            <label className="form-field"><span className="form-label">Observação</span>
                <textarea className="form-input" rows={3} style={{minHeight:80, gridColumn:'span 3'}} value={observacao} onChange={e=>setObservacao(e.target.value)} placeholder="Observações" /></label>
        </div>
    );

    const acessoSubTabs: Array<{key:'unidade'|'perfil'|'agenda'; label:string; content:React.ReactNode}> = [
        {
            key:'unidade', label:'Unidade',
            content:(
                <div className="form-grid">
                    <div style={{gridColumn: '1 / -1'}}>
                        <MasterDetail
                            label="Unidade"
                            source={UNIDADE_SOURCE}
                            valueKey="id"
                            searchKeys={UNIDADE_SEARCH}
                            columns={UNIDADE_COLUMNS}
                            items={unidadesAcesso}
                            onChange={setUnidadesAcesso}
                        />
                    </div>
                    <label className="form-field" style={{gridColumn:'1 / -1'}}>
                        <span className="form-label">Unidade Padrão {requiredMark}</span>
                        <select className="form-input form-select" value={unidadeDefaultId} onChange={e => setUnidadeDefaultId(e.target.value)}>
                            <option value="">-- Selecione --</option>
                            {unidadesAcesso.map(u => <option key={String((u as any).id)} value={String((u as any).id)}>{(u as any).sucinto ?? (u as any).razaoSocial ?? String((u as any).id)}</option>)}
                        </select>
                    </label>
                </div>
            ),
        },
        {
            key:'perfil', label:'Perfil',
            content:(
                <div className="form-grid">
                    <div style={{gridColumn: '1 / -1'}}>
                        <MasterDetail
                            label="Perfil"
                            source={PERFIL_SOURCE}
                            valueKey="id"
                            searchKeys={PERFIL_SEARCH}
                            columns={PERFIL_COLUMNS}
                            items={perfis}
                            onChange={setPerfis}
                        />
                    </div>
                </div>
            ),
        },
        {
            key:'agenda', label:'Agenda',
            content:(
                <div className="form-grid">
                    <div style={{gridColumn: '1 / -1', marginTop: 12, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 10}}>
                        <label className="form-field"><span className="form-label">Agendar</span><BooleanField value={agendaPerm.agendar} onChange={v => setAgendaPerm(p => ({...p, agendar: v}))} /></label>
                        <label className="form-field"><span className="form-label">Alterar</span><BooleanField value={agendaPerm.alterar} onChange={v => setAgendaPerm(p => ({...p, alterar: v}))} /></label>
                        <label className="form-field"><span className="form-label">Fechar</span><BooleanField value={agendaPerm.fechar} onChange={v => setAgendaPerm(p => ({...p, fechar: v}))} /></label>
                        <label className="form-field"><span className="form-label">Iniciar</span><BooleanField value={agendaPerm.iniciar} onChange={v => setAgendaPerm(p => ({...p, iniciar: v}))} /></label>
                        <label className="form-field"><span className="form-label">Atender</span><BooleanField value={agendaPerm.atender} onChange={v => setAgendaPerm(p => ({...p, atender: v}))} /></label>
                    </div>
                    <div style={{gridColumn: '1 / -1', marginTop: 4, fontSize: 11, color: '#777'}}>Permissões aplicadas às agendas selecionadas (tabela bas_usuario_agenda).</div>
                    <div style={{gridColumn: '1 / -1', marginTop: 8}}>
                        <MasterDetail
                            label="Agenda"
                            source={AGENDA_SOURCE}
                            valueKey="id"
                            searchKeys={AGENDA_SEARCH}
                            columns={AGENDA_COLUMNS}
                            items={agendas}
                            onChange={setAgendas}
                        />
                    </div>
                </div>
            ),
        },
    ];

    const tabAcessos = (
        <div className="form-grid">
            <div style={{gridColumn:'1 / -1', display:'flex', gap:8, borderBottom:'1px solid #e0e0e0', marginBottom:16, paddingBottom:0}}>
                {acessoSubTabs.map(t => (
                    <button
                        key={t.key}
                        type="button"
                        onClick={() => setAcessoSub(t.key)}
                        style={{
                            padding:'8px 16px', border:'1px solid #e0e0e0', borderBottom:'none', borderRadius:'6px 6px 0 0',
                            background: acessoSub===t.key ? '#ffffff' : '#f4f4f4', fontWeight:700, fontSize:'13px',
                            color: acessoSub===t.key ? '#2a5a88' : '#555', cursor:'pointer',
                        }}
                    >
                        {t.label}
                    </button>
                ))}
            </div>
            <div style={{gridColumn:'1 / -1'}}>
                {acessoSubTabs.find(t => t.key === acessoSub)?.content}
            </div>
        </div>
    );

    return (
        <PermissionGate permission="READ">
            <main>
                <div className="page-header">
                    <div className="page-header-breadcrumb">
                        <nav className="breadcrumb" aria-label="Breadcrumb">
                            <div className="breadcrumb-group"><span className="breadcrumb-item breadcrumb-current">Usuário — Cadastro</span></div>
                        </nav>
                    </div>
                </div>

                {error && <div className="form-erro" style={{maxWidth:980, margin:'12px auto', background:'#fff0f0', border:'1px solid #f5c6cb', color:'#a61b29', padding:'10px 14px', borderRadius:6}}>{error}</div>}

                <div style={{maxWidth:980, margin:'0 auto', padding:'0 16px 24px'}}>
                    <div className="div_form" style={{padding:16}}>
                        <Tabs tabs={[
                            {key:'pessoal', label:'Pessoal', content: tabPessoal},
                            {key:'endereco', label:'Endereço', content: tabEndereco},
                            {key:'documentos', label:'Documentos', content: tabDocumentos},
                            {key:'trabalho', label:'Trabalho', content: tabTrabalho},
                            {key:'acessos', label:'Acessos', content: tabAcessos},
                        ]} initial="pessoal" />
                    </div>

                    <div className="form-buttons" style={{display:'flex', gap:8, justifyContent:'flex-end', marginTop:16}}>
                        <button type="button" className="btnyellow" onClick={voltar} disabled={salvando}>Voltar</button>
                        <button type="button" className="btnblue" onClick={()=>void salvar(false)} disabled={salvando}>{salvando?'Salvando...':'Salvar e Continuar'}</button>
                        <button type="button" className="btnstop" onClick={()=>void salvar(true)} disabled={salvando}>{salvando?'Salvando...':'Salvar'}</button>
                    </div>
                </div>
            </main>
        </PermissionGate>
    );
}
