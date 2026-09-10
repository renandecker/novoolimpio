import {useEffect, useState} from 'react';

import {useNavigate, useSearchParams} from 'react-router-dom';

import {PermissionGate} from '../../../shared/services/permissions';

import {FormLayout, FormTabConfig} from '../../../shared/components/FormLayout';

import {MasterDetail} from '../../../shared/components/MasterDetail';

import type {ApiItem} from '../../../shared/types/types.ts';

import {api} from '../../../shared/services/api';

import {UNIDADE_SOURCE, UNIDADE_COLUMNS, UNIDADE_SEARCH} from '../../../shared/services/masterDetailSources';

import {AutoComplete, AutoCompleteOption} from '../../../shared/components/AutoComplete';

import {useQuery} from '@tanstack/react-query';



const toDateInput = (v: unknown): string => {

    if (!v) return '';

    const d = new Date(v as string);

    if (isNaN(d.getTime())) return String(v).slice(0, 10);

    const ano = d.getFullYear();

    const mes = String(d.getMonth() + 1).padStart(2, '0');

    const dia = String(d.getDate()).padStart(2, '0');

    return `${ano}-${mes}-${dia}`;

};

const semId = (obj: Record<string, unknown> | null): Record<string, unknown> => {

    const copia = {...(obj ?? {})}; delete copia.id; return copia;

};

const str = (v: unknown): string => (v === null || v === undefined ? '' : String(v));

const num = (v: string): number | null => (v !== '' && !isNaN(Number(v)) ? Number(v) : null);



const fullRow: React.CSSProperties = { display: 'grid', gridColumn: '1 / -1', gridTemplateColumns: '160px 1fr', gap: '14px', alignItems: 'center' };

const fullRowTop: React.CSSProperties = { display: 'grid', gridColumn: '1 / -1', gridTemplateColumns: '160px 1fr', gap: '14px', alignItems: 'start' };



function formatCep(v: string){ const d=v.replace(/\D/g,'').slice(0,8); if(d.length<=5) return d; return `${d.slice(0,5)}-${d.slice(5)}`; }



// Autocomplete fetchers espelhando colunasPessoaFisica.xhtml do extracted_aceso

const fetchCidade = async (query: string): Promise<AutoCompleteOption[]> => {

    const {data} = await api.get<any[]>(`/api/basico/cidade/autoComplete`, {params:{query}});

    return data.map((e:any)=>({id:e.id, label:e.cidadeEstado ?? e.nome ?? e.descricao ?? String(e.id)}));

};

const fetchCidadeById = async (id:number): Promise<AutoCompleteOption|null>=>{ try{ const {data}=await api.get<any>(`/api/basico/cidade/${id}`); return {id:data.id, label:data.cidadeEstado ?? data.nome ?? String(data.id)};}catch{return null;}};

const fetchEstadoCivil = async (query:string):Promise<AutoCompleteOption[]>=>{ const {data}=await api.get<any[]>(`/api/basico/estado-civil/autoComplete`,{params:{query}}); return data.map((e:any)=>({id:e.id, label:e.descricao ?? String(e.id)}));};

const fetchEstadoCivilById = async (id:number):Promise<AutoCompleteOption|null>=>{ try{const {data}=await api.get<any>(`/api/basico/estado-civil/${id}`); return {id:data.id, label:data.descricao ?? String(data.id)};}catch{return null;}};

const fetchEscolaridade = async (q:string):Promise<AutoCompleteOption[]>=>{ const {data}=await api.get<any[]>(`/api/basico/escolaridade/autoComplete`,{params:{query:q}}); return data.map((e:any)=>({id:e.id, label:e.descricao ?? String(e.id)}));};

const fetchEscolaridadeById = async (id:number):Promise<AutoCompleteOption|null>=>{ try{const {data}=await api.get<any>(`/api/basico/escolaridade/${id}`); return {id:data.id, label:data.descricao ?? String(data.id)};}catch{return null;}};

const fetchEtnia = async (q:string):Promise<AutoCompleteOption[]>=>{ const {data}=await api.get<any[]>(`/api/basico/etnia/autoComplete`,{params:{query:q}}); return data.map((e:any)=>({id:e.id, label:e.descricao ?? String(e.id)}));};

const fetchEtniaById = async (id:number):Promise<AutoCompleteOption|null>=>{ try{const {data}=await api.get<any>(`/api/basico/etnia/${id}`); return {id:data.id, label:data.descricao ?? String(data.id)};}catch{return null;}};

const fetchGenero = async (q:string):Promise<AutoCompleteOption[]>=>{ try{const {data}=await api.get<any[]>(`/api/basico/genero`); const filtered=data.filter((e:any)=>!q || (e.descricao??'').toLowerCase().includes(q.toLowerCase())); return filtered.map((e:any)=>({id:e.id, label:e.descricao ?? String(e.id)}));}catch{return [{value:'1',label:'Masculino'} as any,{value:'2',label:'Feminino'} as any];}};

const fetchGeneroById = async (id:number):Promise<AutoCompleteOption|null>=>{ try{const {data}=await api.get<any>(`/api/basico/genero/${id}`); return {id:data.id, label:data.descricao ?? String(data.id)};}catch{return {id, label:String(id)};}};

const fetchSexoOptions = async ():Promise<AutoCompleteOption[]> => [{id:1,label:'Masculino'},{id:2,label:'Feminino'},{id:3,label:'Outro'}];



export default function ViewPessoaFormPessoaFisicaListScreen() {

    const navigate = useNavigate();

    const [searchParams] = useSearchParams();

    const idParam = searchParams.get('id');



    const [pfId, setPfId] = useState<number|undefined>();

    const [pessoaId, setPessoaId] = useState<number|undefined>();

    const [pfOriginal, setPfOriginal] = useState<Record<string, unknown>|null>(null);

    const [pessoaOriginal, setPessoaOriginal] = useState<Record<string, unknown>|null>(null);

    const [unidades, setUnidades] = useState<ApiItem[]>([]);

    const [salvando, setSalvando] = useState(false);

    const [error, setError] = useState<string|undefined>();

    const [initialValues, setInitialValues] = useState<Record<string, unknown>>({});

    // Autocomplete selections - separados do initialValues para exibir label

    const [cidadeOrigemOpt, setCidadeOrigemOpt] = useState<AutoCompleteOption|null>(null);

    const [generoOpt, setGeneroOpt] = useState<AutoCompleteOption|null>(null);

    const [etniaOpt, setEtniaOpt] = useState<AutoCompleteOption|null>(null);

    const [estadoCivilOpt, setEstadoCivilOpt] = useState<AutoCompleteOption|null>(null);

    const [escolaridadeOpt, setEscolaridadeOpt] = useState<AutoCompleteOption|null>(null);

    // Endereco - layout fiel ao colunasPessoaFisica.xhtml (cep + busca/ajuste/novo + cidade/bairro/logradouro/numero/complemento)

    const [cep, setCep] = useState('');

    const [cidadeOpt, setCidadeOpt] = useState<AutoCompleteOption|null>(null);

    const [bairroOpt, setBairroOpt] = useState<AutoCompleteOption|null>(null);

    const [logradouroOpt, setLogradouroOpt] = useState<AutoCompleteOption|null>(null);

    const [numero, setNumero] = useState('');

    const [complemento, setComplemento] = useState('');

    const [logradouroId, setLogradouroId] = useState<number|undefined>();

    const [buscandoCep, setBuscandoCep] = useState(false);

    const [enderecoAviso, setEnderecoAviso] = useState('');



    const {data: allUnidades = []} = useQuery({ queryKey:[UNIDADE_SOURCE], queryFn: async () => (await api.get<ApiItem[]>(UNIDADE_SOURCE)).data });



    // fetchers para endereco

    const fetchCidadesLog = async (q:string):Promise<AutoCompleteOption[]> => {

        if(!q) return []; const {data}=await api.get<any[]>(`/api/basico/cidade/autoComplete`,{params:{query:q}}); return data.map((e:any)=>({id:e.id, label:e.cidadeEstado ?? e.nome}));

    };

    const fetchBairros = async (q:string):Promise<AutoCompleteOption[]> => {

        const params:any={query:q}; if(cidadeOpt?.id) params.cidadeId=cidadeOpt.id;

        const {data}=await api.get<any[]>(`/api/basico/bairro/autoComplete`,{params}); return data.map((e:any)=>({id:e.id, label:e.descricao}));

    };

    const fetchLogradouros = async (q:string):Promise<AutoCompleteOption[]> => {

        const params:any={query:q}; if(bairroOpt?.id) params.bairroId=bairroOpt.id;

        const {data}=await api.get<any[]>(`/api/basico/logradouro/autoComplete`,{params}); return data.map((e:any)=>({id:e.id, label:e.descricao}));

    };



    const buscarCep = async () => {

        const clean = cep.replace(/\D/g,'');

        if(clean.length!==8){ setEnderecoAviso('CEP deve ter 8 dígitos'); return; }

        setBuscandoCep(true); setEnderecoAviso('');

        try{

            // tenta via logradouroController/buscarEndereco primeiro

            try{

                const {data}=await api.get<any>(`/api/basico/logradouro/buscarEndereco`,{params:{cep:clean}});

                if(data?.logradouro){

                    const l=data.logradouro;

                    setLogradouroOpt({id:l.id, label:l.descricao}); setLogradouroId(l.id);

                    if(l.bairro){ const b=await api.get<any>(`/api/basico/bairro/${l.bairro.id ?? l.id_bairro}`); setBairroOpt({id:b.data.id, label:b.data.descricao});}

                    if(data.cidade){ setCidadeOpt({id:data.cidade.id, label:data.cidade.cidadeEstado ?? data.cidade.nome});}

                    setCep(formatCep(l.cep ?? clean));

                }

            }catch{

                // fallback viaCEP

                const resp = await fetch(`https://viacep.com.br/ws/${clean}/json/`).then(r=>r.json());

                if(!resp.erro){

                    setEnderecoAviso('');

                    // tenta achar cidade/bairro/logradouro no backend pelo nome

                    const cidades = await fetchCidadesLog(resp.localidade);

                    const found = cidades.find(c=>c.label.toLowerCase().includes(resp.localidade.toLowerCase()));

                    if(found) setCidadeOpt(found);

                    setBairroOpt(resp.bairro ? {id: -1, label: resp.bairro}: null);

                    setLogradouroOpt(resp.logradouro ? {id: -1, label: resp.logradouro}: null);

                    setCep(formatCep(resp.cep ?? clean));

                } else setEnderecoAviso('CEP não encontrado');

            }

        } finally { setBuscandoCep(false); }

    };



    useEffect(()=>{

        if(!idParam) return;

        let ativo=true;

        (async()=>{

            try{

                const pf = (await api.get<Record<string, unknown>>(`/api/basico/pessoa-fisica/${idParam}`)).data;

                let pes: Record<string, unknown>|null=null;

                if(pf.pessoaId) pes=(await api.get<Record<string, unknown>>(`/api/basico/pessoa/${pf.pessoaId}`)).data;

                if(!ativo) return;

                setPfId(pf.id as number); setPfOriginal(pf); setPessoaId(pes?.id as number|undefined); setPessoaOriginal(pes);

                setInitialValues({

                    cpf: str(pf.cpf), rg: str(pf.rg), nome: str(pf.nome), email: str(pes?.email),

                    nomeSocial: str(pf.nomeSocial), dataNascimento: toDateInput(pf.dataNascimento),

                    cidadeOrigem: str((pf as any).cidadeOrigemId ?? pf.cidadeOrigem),

                    generoId: pf.generoId!=null? String(pf.generoId):'', etniaId: pf.etniaId!=null? String(pf.etniaId):'',

                    estadoCivilId: pf.estadoCivilId!=null? String(pf.estadoCivilId):'', escolaridadeId: pf.escolaridadeId!=null? String(pf.escolaridadeId):'',

                    nomeReferencia: str(pf.nomeReferencia), telefoneReferencia: str(pf.telefoneReferencia), celularReferencia: str(pf.celularReferencia),

                    nomeReferencia2: str(pf.nomeReferencia2), telefoneReferencia2: str(pf.telefoneReferencia2), celularReferencia2: str(pf.celularReferencia2),

                    nomePai: str(pf.nomePai), nomeMae: str(pf.nomeMae),

                    telefoneResidencial: str(pes?.telefone), telefoneComercial: str(pf.telefoneComercial), celular: str(pes?.celular),

                    facebook: str(pf.facebook), twitter: str(pf.twitter), googlePlus: str(pf.googlePlus), telegran: str((pes as any)?.telegran ?? (pf as any)?.telegran),

                    observacao: str(pes?.observacao),

                });

                // autocomplete labels for edit

                if(pf.cidadeOrigemId) fetchCidadeById(Number(pf.cidadeOrigemId)).then(o=>o&&setCidadeOrigemOpt(o));

                else if(pf.cidadeOrigem && typeof pf.cidadeOrigem==='object') setCidadeOrigemOpt({id:(pf.cidadeOrigem as any).id, label:(pf.cidadeOrigem as any).cidadeEstado ?? String((pf.cidadeOrigem as any).nome)});

                if(pf.generoId) fetchGeneroById(Number(pf.generoId)).then(o=>o&&setGeneroOpt(o));

                if(pf.etniaId) fetchEtniaById(Number(pf.etniaId)).then(o=>o&&setEtniaOpt(o));

                if(pf.estadoCivilId) fetchEstadoCivilById(Number(pf.estadoCivilId)).then(o=>o&&setEstadoCivilOpt(o));

                if(pf.escolaridadeId) fetchEscolaridadeById(Number(pf.escolaridadeId)).then(o=>o&&setEscolaridadeOpt(o));



                // Endereco - carrega dados da edição fiel ao colunasPessoaFisica.xhtml (logradouroController)

                if(pes){

                    const cepVal = str(pes.cep);

                    const numVal = str(pes.numero);

                    const compVal = str(pes.complemento);

                    const idLog = (pes.id_logradouro ?? (pes as any).logradouroId) as number|undefined;

                    setNumero(numVal); setComplemento(compVal);

                    if(idLog){

                        try{

                            const logRes=(await api.get<Record<string, unknown>>(`/api/basico/logradouro/${idLog}`)).data;

                            setLogradouroId(logRes.id as number);

                            setLogradouroOpt({id: logRes.id as number, label: str(logRes.descricao)});

                            setCep(str(logRes.cep) ? formatCep(str(logRes.cep)) : formatCep(cepVal));

                            if(logRes.id_bairro){

                                const bRes=(await api.get<Record<string, unknown>>(`/api/basico/bairro/${logRes.id_bairro}`)).data;

                                setBairroOpt({id: bRes.id as number, label: str(bRes.descricao)});

                                if((bRes as any).cidadeId){

                                    const cRes=(await api.get<Record<string, unknown>>(`/api/basico/cidade/${(bRes as any).cidadeId}`)).data;

                                    setCidadeOpt({id: cRes.id as number, label: str((cRes as any).cidadeEstado ?? cRes.nome)});

                                }

                            }

                        }catch{

                            setCep(formatCep(cepVal));

                        }

                    } else if(cepVal) setCep(formatCep(cepVal));

                }

                // Unidades

                if(pes?.id){

                    try{

                        const ids = (await api.get<number[]>(`/api/basico/pessoa/buscar-unidades-disponiveis`,{params:{pessoaId: pes.id}})).data;

                        if(ids?.length){ const setIds=new Set(ids.map(String)); setUnidades(allUnidades.filter(u=> setIds.has(String((u as any).id))));}

                    }catch{

                        try{ const ids=(await api.get<number[]>(`/api/basico/pessoa/buscar-unidades`,{params:{entityId: pes.id}})).data; if(ids?.length){const s=new Set(ids.map(String)); setUnidades(allUnidades.filter(u=> s.has(String((u as any).id))));}}catch{}

                    }

                }

            }catch(e){ console.error(e); alert('Erro ao carregar pessoa física');}

        })();

        return ()=>{ativo=false;};

    },[idParam, allUnidades]);



    // sincroniza selects com initialValues para salvar

    useEffect(()=>{ if(cidadeOrigemOpt) setInitialValues(p=>({...p, cidadeOrigemId: String(cidadeOrigemOpt.id)})); },[cidadeOrigemOpt]);

    useEffect(()=>{ if(generoOpt) setInitialValues(p=>({...p, generoId: String(generoOpt.id)})); },[generoOpt]);

    useEffect(()=>{ if(etniaOpt) setInitialValues(p=>({...p, etniaId: String(etniaOpt.id)})); },[etniaOpt]);

    useEffect(()=>{ if(estadoCivilOpt) setInitialValues(p=>({...p, estadoCivilId: String(estadoCivilOpt.id)})); },[estadoCivilOpt]);

    useEffect(()=>{ if(escolaridadeOpt) setInitialValues(p=>({...p, escolaridadeId: String(escolaridadeOpt.id)})); },[escolaridadeOpt]);

    useEffect(()=>{ if(cidadeOpt) setLogradouroId(undefined); },[cidadeOpt?.id]);

    useEffect(()=>{ if(bairroOpt) setLogradouroId(undefined); },[bairroOpt?.id]);



    const tabs: FormTabConfig[] = [

        {

            key:'identificacao', label:'Identificação',

            content:(

                <div className="form-grid" style={{gridTemplateColumns:'1fr 1fr'}}>

                    <label className="form-field"><span className="form-label">CPF *</span><input className="form-input" placeholder="999.999.999-99" value={str(initialValues.cpf)} onChange={e=>setInitialValues(p=>({...p, cpf:e.target.value}))}/></label>

                    <label className="form-field"><span className="form-label">RG *</span><input className="form-input" placeholder="RG" value={str(initialValues.rg)} onChange={e=>setInitialValues(p=>({...p, rg:e.target.value}))}/></label>

                    <label className="form-field" style={fullRow}><span className="form-label">Nome *</span><input className="form-input" placeholder="Nome completo" style={{width:'100%'}} value={str(initialValues.nome)} onChange={e=>setInitialValues(p=>({...p, nome:e.target.value}))}/></label>

                    <label className="form-field" style={fullRow}><span className="form-label">E-mail *</span><input className="form-input" type="email" placeholder="E-mail" style={{width:'100%'}} value={str(initialValues.email)} onChange={e=>setInitialValues(p=>({...p, email:e.target.value}))}/></label>

                </div>

            )

        },

        {

            key:'informacoesBasicas', label:'Informações Básicas',

            content:(

                <div style={{display:'flex', gap:'24px', flexWrap:'wrap'}}>

                    <div className="form-grid" style={{flex:'1 1 520px', gridTemplateColumns:'1fr 1fr'}}>

                        <label className="form-field" style={fullRow}><span className="form-label">Nome Social *</span><input className="form-input" placeholder="Nome social" value={str(initialValues.nomeSocial)} onChange={e=>setInitialValues(p=>({...p, nomeSocial:e.target.value}))}/></label>

                        <label className="form-field"><span className="form-label">Data Nascimento *</span><input className="form-input" type="date" value={str(initialValues.dataNascimento)} onChange={e=>setInitialValues(p=>({...p, dataNascimento:e.target.value}))}/></label>

                        <label className="form-field" style={fullRow}>

                            <span className="form-label">Cidade Origem *</span>

                            <AutoComplete placeholder="Digite 3 letras..." value={cidadeOrigemOpt} onChange={setCidadeOrigemOpt} fetchOptions={fetchCidade} fetchById={fetchCidadeById} />

                        </label>

                        <label className="form-field" style={fullRow}>

                            <span className="form-label">Gênero</span>

                            <AutoComplete placeholder="Selecione" value={generoOpt} onChange={setGeneroOpt} fetchOptions={fetchGenero} fetchById={fetchGeneroById} />

                        </label>

                        <label className="form-field" style={fullRow}>

                            <span className="form-label">Etnia</span>

                            <AutoComplete placeholder="Selecione" value={etniaOpt} onChange={setEtniaOpt} fetchOptions={fetchEtnia} fetchById={fetchEtniaById} />

                        </label>

                        <label className="form-field" style={fullRow}>

                            <span className="form-label">Estado Civil *</span>

                            <AutoComplete placeholder="Digite 3 letras..." value={estadoCivilOpt} onChange={setEstadoCivilOpt} fetchOptions={fetchEstadoCivil} fetchById={fetchEstadoCivilById} />

                        </label>

                        <label className="form-field" style={fullRow}>

                            <span className="form-label">Escolaridade *</span>

                            <AutoComplete placeholder="Digite 3 letras..." value={escolaridadeOpt} onChange={setEscolaridadeOpt} fetchOptions={fetchEscolaridade} fetchById={fetchEscolaridadeById} />

                        </label>

                        {/* Referências - layout fiel ao xhtml: nome + telefone/celular na mesma linha */}

                        <label className="form-field" style={fullRow}><span className="form-label">Nome Referência *</span><input className="form-input" placeholder="Nome da referência" value={str(initialValues.nomeReferencia)} onChange={e=>setInitialValues(p=>({...p, nomeReferencia:e.target.value}))}/></label>

                        <label className="form-field"><span className="form-label">Telefone Referência</span><input className="form-input" placeholder="99-99999999" value={str(initialValues.telefoneReferencia)} onChange={e=>setInitialValues(p=>({...p, telefoneReferencia:e.target.value}))}/></label>

                        <label className="form-field"><span className="form-label">Celular Referência</span><input className="form-input" placeholder="99-999999999" value={str(initialValues.celularReferencia)} onChange={e=>setInitialValues(p=>({...p, celularReferencia:e.target.value}))}/></label>

                        <label className="form-field" style={fullRow}><span className="form-label">Nome Referência 2</span><input className="form-input" placeholder="Nome da referência 2" value={str(initialValues.nomeReferencia2)} onChange={e=>setInitialValues(p=>({...p, nomeReferencia2:e.target.value}))}/></label>

                        <label className="form-field"><span className="form-label">Telefone Referência 2</span><input className="form-input" placeholder="99-99999999" value={str(initialValues.telefoneReferencia2)} onChange={e=>setInitialValues(p=>({...p, telefoneReferencia2:e.target.value}))}/></label>

                        <label className="form-field"><span className="form-label">Celular Referência 2</span><input className="form-input" placeholder="99-999999999" value={str(initialValues.celularReferencia2)} onChange={e=>setInitialValues(p=>({...p, celularReferencia2:e.target.value}))}/></label>

                        <label className="form-field" style={fullRow}><span className="form-label">Nome do Pai</span><input className="form-input" placeholder="Nome do pai" value={str(initialValues.nomePai)} onChange={e=>setInitialValues(p=>({...p, nomePai:e.target.value}))}/></label>

                        <label className="form-field" style={fullRow}><span className="form-label">Nome da Mãe *</span><input className="form-input" placeholder="Nome da mãe" value={str(initialValues.nomeMae)} onChange={e=>setInitialValues(p=>({...p, nomeMae:e.target.value}))}/></label>

                    </div>

                    <div style={{width:'260px', flex:'0 0 260px'}}>

                        <div style={{border:'1px solid #ddd', borderRadius:'6px', padding:'12px', textAlign:'center'}}>

                            <div style={{fontWeight:600, marginBottom:'8px'}}>Foto</div>

                            <div style={{width:'235px', height:'195px', background:'#f5f5f5', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 12px', border:'1px dashed #ccc'}}> {pfId ? 'Foto carregada' : 'Sem foto'}</div>

                            <input type="file" accept="image/*" className="form-input" style={{marginBottom:'8px'}} />

                            <button type="button" className="btnblue" style={{width:'100%'}}>Capturar foto</button>

                        </div>

                    </div>

                </div>

            )

        },

        {

            key:'contatos', label:'Contatos',

            content:(

                <div className="form-grid" style={{gridTemplateColumns:'1fr 1fr'}}>

                    <label className="form-field"><span className="form-label">Telefone Residencial *</span><input className="form-input" placeholder="99-99999999" value={str(initialValues.telefoneResidencial)} onChange={e=>setInitialValues(p=>({...p, telefoneResidencial:e.target.value}))}/></label>

                    <label className="form-field"><span className="form-label">Telefone Comercial</span><input className="form-input" placeholder="99-99999999" value={str(initialValues.telefoneComercial)} onChange={e=>setInitialValues(p=>({...p, telefoneComercial:e.target.value}))}/></label>

                    <label className="form-field"><span className="form-label">Celular *</span><input className="form-input" placeholder="99-999999999" value={str(initialValues.celular)} onChange={e=>setInitialValues(p=>({...p, celular:e.target.value}))}/></label>

                    <label className="form-field" style={fullRow}><span className="form-label">Facebook</span><input className="form-input" placeholder="facebook.com/usuario" value={str(initialValues.facebook)} onChange={e=>setInitialValues(p=>({...p, facebook:e.target.value}))}/></label>

                    <label className="form-field" style={fullRow}><span className="form-label">Twitter</span><input className="form-input" placeholder="@usuario" value={str(initialValues.twitter)} onChange={e=>setInitialValues(p=>({...p, twitter:e.target.value}))}/></label>

                    <label className="form-field" style={fullRow}><span className="form-label">Google+</span><input className="form-input" placeholder="plus.google.com/usuario" value={str(initialValues.googlePlus)} onChange={e=>setInitialValues(p=>({...p, googlePlus:e.target.value}))}/></label>

                    <label className="form-field" style={fullRow}><span className="form-label">Telegram</span><input className="form-input" placeholder="@usuario" value={str(initialValues.telegran)} onChange={e=>setInitialValues(p=>({...p, telegran:e.target.value}))}/></label>

                </div>

            )

        },

        {

            key:'endereco', label:'Endereço',

            content:(

                <div className="form-grid" style={{gridTemplateColumns:'1fr 1fr'}}>

                    <label className="form-field"><span className="form-label">CEP</span>

                        <div style={{display:'flex', gap:'8px', flexWrap:'wrap'}}>

                            <input className="form-input" placeholder="99.999-999" style={{width:'120px'}} maxLength={9} value={cep} onChange={e=>setCep(formatCep(e.target.value))} />

                            <button type="button" className="btnyellow" disabled={buscandoCep} onClick={buscarCep}>{buscandoCep?'Buscando...':'Busca'}</button>

                            <button type="button" className="btngreen" onClick={()=>{ setEnderecoAviso('Ajuste - selecione cidade/bairro/logradouro nos campos abaixo'); }}>Ajuste</button>

                            <button type="button" className="btnstop" onClick={()=>{ setCep(''); setCidadeOpt(null); setBairroOpt(null); setLogradouroOpt(null); setNumero(''); setComplemento(''); setLogradouroId(undefined);}}>Novo</button>

                        </div>

                        {enderecoAviso && <small style={{color:'#c0392b'}}>{enderecoAviso}</small>}

                    </label>

                    <label className="form-field" style={fullRow}>

                        <span className="form-label">Cidade</span>

                        <AutoComplete placeholder="Digite 3 letras..." value={cidadeOpt} onChange={setCidadeOpt} fetchOptions={fetchCidadesLog} />

                    </label>

                    <label className="form-field" style={fullRow}>

                        <span className="form-label">Bairro</span>

                        <AutoComplete placeholder="Digite 3 letras..." value={bairroOpt} onChange={setBairroOpt} fetchOptions={fetchBairros} />

                    </label>

                    <label className="form-field" style={fullRow}>

                        <span className="form-label">Logradouro</span>

                        <AutoComplete placeholder="Digite 3 letras..." value={logradouroOpt} onChange={o=>{ setLogradouroOpt(o); if(o) setLogradouroId(o.id);}} fetchOptions={fetchLogradouros} />

                    </label>

                    <label className="form-field"><span className="form-label">Número *</span><input className="form-input" placeholder="Número" value={numero} onChange={e=>setNumero(e.target.value)}/></label>

                    <label className="form-field" style={fullRowTop}><span className="form-label">Complemento</span><textarea className="form-input" placeholder="Complemento" rows={3} style={{minHeight:'80px'}} value={complemento} onChange={e=>setComplemento(e.target.value)}/></label>

                </div>

            )

        },



        { key:'unidades', label:'Unidades', content:(<MasterDetail label="Unidade" source={UNIDADE_SOURCE} valueKey="id" searchKeys={UNIDADE_SEARCH} columns={UNIDADE_COLUMNS} items={unidades} onChange={setUnidades} />)},

        {

            key:'outros', label:'Outros',

            content:(

                <div className="form-grid">

                    <label className="form-field" style={fullRowTop}><span className="form-label">Observação</span><textarea className="form-input" placeholder="Observações" rows={5} style={{width:'100%', minHeight:'100px'}} value={str(initialValues.observacao)} onChange={e=>setInitialValues(p=>({...p, observacao:e.target.value}))}/></label>

                </div>

            )

        },

    ];



    const voltar = () => navigate('/view/pessoa/listPessoaFisica');

    const salvar = async (voltarDepois:boolean)=>{

        const vals=initialValues;

        if(!vals.nome || !vals.cpf){ setError('Informe pelo menos Nome e CPF.'); return; }

        setSalvando(true); setError(undefined);

        try{

            const pfBody:Record<string,unknown>={ ...semId(pfOriginal), nome: vals.nome, cpf: vals.cpf, rg: vals.rg, nomeSocial: vals.nomeSocial||null, dataNascimento: vals.dataNascimento||null, cidadeOrigemId: num(vals.cidadeOrigemId as string) ?? (cidadeOrigemOpt?.id ?? null), generoId: num(vals.generoId as string) ?? (generoOpt?.id ?? null), etniaId: num(vals.etniaId as string) ?? (etniaOpt?.id ?? null), estadoCivilId: num(vals.estadoCivilId as string) ?? (estadoCivilOpt?.id ?? null), escolaridadeId: num(vals.escolaridadeId as string) ?? (escolaridadeOpt?.id ?? null), nomeReferencia: vals.nomeReferencia||null, telefoneReferencia: vals.telefoneReferencia||null, celularReferencia: vals.celularReferencia||null, nomeReferencia2: vals.nomeReferencia2||null, telefoneReferencia2: vals.telefoneReferencia2||null, celularReferencia2: vals.celularReferencia2||null, nomePai: vals.nomePai||null, nomeMae: vals.nomeMae||null, telefoneComercial: vals.telefoneComercial||null, facebook: vals.facebook||null, twitter: vals.twitter||null, googlePlus: vals.googlePlus||null };

            const respostaPf = pfId ? await api.put(`/api/basico/pessoa-fisica/${pfId}`, pfBody) : await api.post('/api/basico/pessoa-fisica', pfBody);

            const novoPfId = (respostaPf.data as Record<string,unknown>)?.id ?? pfId;

            const pessoaBody:Record<string,unknown>={ ...semId(pessoaOriginal), email: vals.email||null, telefone: vals.telefoneResidencial||null, celular: vals.celular||null, observacao: vals.observacao||null, cep: cep||null, numero: numero||null, complemento: complemento||null, logradouroId: logradouroId||null, telegran: vals.telegran||null };

            let novoPesId=pessoaId;

            if(pessoaId) await api.put(`/api/basico/pessoa/${pessoaId}`, pessoaBody);

            else novoPesId=((await api.post('/api/basico/pessoa', pessoaBody)).data as Record<string,unknown>)?.id as number|undefined;

            if(!pfId && novoPesId && novoPfId) await api.put(`/api/basico/pessoa-fisica/${novoPfId}`, {...pfBody, pessoaId: novoPesId});

            if(voltarDepois) voltar(); else alert('Registro salvo com sucesso.');

        }catch(e){ console.error(e); setError('Erro ao salvar registro.'); } finally{ setSalvando(false); }

    };



    return (

        <PermissionGate permission="READ">

            <main>

                <FormLayout title="Pessoa Física" tabs={tabs} initialValues={initialValues} onSubmit={()=>salvar(false)} onCancel={voltar} submitLabel="Salvar" cancelLabel="Voltar" saving={salvando} error={error} />

            </main>

        </PermissionGate>

    );

}

