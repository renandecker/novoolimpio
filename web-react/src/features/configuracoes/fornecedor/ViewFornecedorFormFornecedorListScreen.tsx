import {useEffect, useState, useCallback} from 'react';

import {useNavigate, useSearchParams} from 'react-router-dom';

import {PermissionGate} from '../../../shared/services/permissions';

import {Tabs} from '../../../shared/components/Tabs';

import type {TabItem} from '../../../shared/components/Tabs';

import {MasterDetail} from '../../../shared/components/MasterDetail';

import {BooleanField} from '../../../shared/components/BooleanField';

import type {ApiItem} from '../../../shared/types/types.ts';

import {api} from '../../../shared/services/api';

import {UNIDADE_SOURCE, UNIDADE_COLUMNS, UNIDADE_SEARCH} from '../../../shared/services/masterDetailSources';

import {AutoComplete, AutoCompleteOption} from '../../../shared/components/AutoComplete';

import {useQuery} from '@tanstack/react-query';

function formatCep(v: string){ const d=v.replace(/\D/g,'').slice(0,8); if(d.length<=5) return d; return `${d.slice(0,5)}-${d.slice(5)}`; }


interface FormState {

    cnpj: string;

    razaoSocial: string;

    nomeFantasia: string;

    inscricaoMunicipal: string;

    inscricaoEstadual: string;

    email: string;

    fax: string;

    telefone: string;

    celular: string;

    observacao: string;

}


const FORM_VAZIO: FormState = {

    cnpj: '',

    razaoSocial: '',

    nomeFantasia: '',

    inscricaoMunicipal: '',

    inscricaoEstadual: '',

    email: '',

    fax: '',

    telefone: '',

    celular: '',

    observacao: '',

};


const str = (v: unknown): string => (v === null || v === undefined ? '' : String(v));


const semId = (obj: Record<string, unknown> | null): Record<string, unknown> => {

    const copia = {...(obj ?? {})};

    delete copia.id;

    return copia;

};


export default function ViewFornecedorFormFornecedorListScreen() {

    const navigate = useNavigate();

    const [searchParams] = useSearchParams();

    const idParam = searchParams.get('id');


    const [form, setForm] = useState<FormState>(FORM_VAZIO);

    const [pjId, setPjId] = useState<number | undefined>();

    const [pessoaId, setPessoaId] = useState<number | undefined>();

    const [pjOriginal, setPjOriginal] = useState<Record<string, unknown> | null>(null);

    const [pessoaOriginal, setPessoaOriginal] = useState<Record<string, unknown> | null>(null);

    const [fornecedorId, setFornecedorId] = useState<number | undefined>();

    const [fornecedorOriginal, setFornecedorOriginal] = useState<Record<string, unknown> | null>(null);

    // Endereco
    const [cep, setCep] = useState('');
    const [cidadeOpt, setCidadeOpt] = useState<AutoCompleteOption|null>(null);
    const [bairroOpt, setBairroOpt] = useState<AutoCompleteOption|null>(null);
    const [logradouroOpt, setLogradouroOpt] = useState<AutoCompleteOption|null>(null);
    const [numero, setNumero] = useState('');
    const [complemento, setComplemento] = useState('');
    const [logradouroId, setLogradouroId] = useState<number|undefined>();
    const [buscandoCep, setBuscandoCep] = useState(false);
    const [enderecoAviso, setEnderecoAviso] = useState('');

    const [unidades, setUnidades] = useState<ApiItem[]>([]);

    const [curriculo, setCurriculo] = useState(false);

    const [salvando, setSalvando] = useState(false);

    // Autocomplete para selecionar Pessoa Jurídica existente
    const [pjSelecionada, setPjSelecionada] = useState<AutoCompleteOption | null>(null);
    const [criarNovaPj, setCriarNovaPj] = useState(false);

    const {data: allUnidades = []} = useQuery({

        queryKey: [UNIDADE_SOURCE],

        queryFn: async () => (await api.get<ApiItem[]>(UNIDADE_SOURCE)).data,

    });

    // fetchers para endereco
    const fetchCidadesLog = useCallback(async (q:string):Promise<AutoCompleteOption[]> => {
        if(!q) return []; const {data}=await api.get<any[]>(`/api/basico/cidade/autoComplete`,{params:{query:q}}); return data.map((e:any)=>({id:e.id, label:e.cidadeEstado ?? e.nome}));
    }, []);

    const fetchBairros = useCallback(async (q:string):Promise<AutoCompleteOption[]> => {
        const params:any={query:q}; if(cidadeOpt?.id) params.cidadeId=cidadeOpt.id;
        const {data}=await api.get<any[]>(`/api/basico/bairro/auto-complete`,{params}); return data.map((e:any)=>({id:e.id, label:e.descricao}));
    }, [cidadeOpt]);

    const fetchLogradouros = useCallback(async (q:string):Promise<AutoCompleteOption[]> => {
        const params:any={query:q}; if(bairroOpt?.id) params.bairroId=bairroOpt.id;
        const {data}=await api.get<any[]>(`/api/basico/logradouro/auto-complete`,{params}); return data.map((e:any)=>({id:e.id, label:e.descricao}));
    }, [bairroOpt]);

    // Fetch Pessoa Jurídica para autocomplete
    const fetchPessoaJuridica = useCallback(async (query: string): Promise<AutoCompleteOption[]> => {
        if (!query.trim()) return [];
        const {data} = await api.get<Array<Record<string, unknown>>>('/api/view/pessoa-juridica/auto-complete', {
            params: {q: query, limit: 20}
        });
        return data.map(row => ({
            id: Number(row.id),
            label: `${str(row.razaoSocial)} (${str(row.cnpj)})`
        }));
    }, []);

    const fetchPessoaJuridicaById = useCallback(async (id: number): Promise<AutoCompleteOption | null> => {
        try {
            const {data} = await api.get<Record<string, unknown>>(`/api/view/pessoa-juridica/listPessoaJuridica/${id}`);
            return {id: Number(data.id), label: `${str(data.razaoSocial)} (${str(data.cnpj)})`};
        } catch {
            return null;
        }
    }, []);

    const buscarCep = async () => {
        const clean = cep.replace(/\D/g,'');
        if(clean.length!==8){ setEnderecoAviso('CEP deve ter 8 dígitos'); return; }
        setBuscandoCep(true); setEnderecoAviso('');
        try{
            try{
                const {data}=await api.get<any>(`/api/basico/logradouro/buscar-endereco-por-cep`,{params:{cep:clean}});
                if(data?.logradouro){
                    const l=data.logradouro;
                    setLogradouroOpt({id:l.id, label:l.descricao}); setLogradouroId(l.id);
                    if(data.bairro){ setBairroOpt({id:data.bairro.id, label:data.bairro.descricao});}
                    if(data.cidade){ setCidadeOpt({id:data.cidade.id, label:data.cidade.nome});}
                    setCep(formatCep(l.cep ?? clean));
                }
            }catch{
                const resp = await fetch(`https://viacep.com.br/ws/${clean}/json/`).then(r=>r.json());
                if(!resp.erro){
                    setEnderecoAviso('');
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

    useEffect(()=>{ if(cidadeOpt) setLogradouroId(undefined); },[cidadeOpt?.id]);
    useEffect(()=>{ if(bairroOpt) setLogradouroId(undefined); },[bairroOpt?.id]);

    // Carregar dados se estiver editando um fornecedor existente
    useEffect(() => {

        if (!idParam) return;

        let ativo = true;

        (async () => {

            try {

                const fornecedor = (await api.get<Record<string, unknown>>(`/api/basico/fornecedor/${idParam}`)).data;

                if (!ativo) return;

                setFornecedorId(fornecedor.id as number);
                setFornecedorOriginal(fornecedor);

                if (fornecedor.id_pessoa) {
                    const pes = (await api.get<Record<string, unknown>>(`/api/basico/pessoa/${fornecedor.id_pessoa}`)).data;
                    setPessoaId(pes.id as number);
                    setPessoaOriginal(pes);

                    // Verifica se é pessoa jurídica
                    if (pes.id_pessoa_juridica) {
                        const pj = (await api.get<Record<string, unknown>>(`/api/basico/pessoa-juridica/${pes.id_pessoa_juridica}`)).data;
                        setPjId(pj.id as number);
                        setPjOriginal(pj);
                        setPjSelecionada({id: pj.id as number, label: `${str(pj.razaoSocial)} (${str(pj.cnpj)})`});

                        setForm({
                            cnpj: str(pj.cnpj),
                            razaoSocial: str(pj.razaoSocial),
                            nomeFantasia: str(pj.nomeFantasia),
                            inscricaoMunicipal: str(pj.inscricaoMunicipal),
                            inscricaoEstadual: str(pj.inscricaoEstadual),
                            email: str(pes?.email),
                            fax: str(pj.fax),
                            telefone: str(pes?.telefone),
                            celular: str(pes?.celular),
                            observacao: str(pes?.observacao),
                        });

                        // Endereco
                        if (pes) {
                            const cepVal = str(pes.cep);
                            const numVal = str(pes.numero);
                            const compVal = str(pes.complemento);
                            const idLog = (pes.id_logradouro ?? (pes as any).logradouroId) as number|undefined;
                            setNumero(numVal); setComplemento(compVal);
                            if (idLog) {
                                try {
                                    const logRes = (await api.get<Record<string, unknown>>(`/api/basico/logradouro/${idLog}`)).data;
                                    setLogradouroId(logRes.id as number);
                                    setLogradouroOpt({id: logRes.id as number, label: str(logRes.descricao)});
                                    setCep(str(logRes.cep) ? formatCep(str(logRes.cep)) : formatCep(cepVal));
                                    if (logRes.id_bairro) {
                                        const bRes = (await api.get<Record<string, unknown>>(`/api/basico/bairro/${logRes.id_bairro}`)).data;
                                        setBairroOpt({id: bRes.id as number, label: str(bRes.descricao)});
                                        if ((bRes as any).cidadeId) {
                                            const cRes = (await api.get<Record<string, unknown>>(`/api/basico/cidade/${(bRes as any).cidadeId}`)).data;
                                            setCidadeOpt({id: cRes.id as number, label: str((cRes as any).cidadeEstado ?? cRes.nome)});
                                        }
                                    }
                                } catch {
                                    setCep(formatCep(cepVal));
                                }
                            } else if (cepVal) setCep(formatCep(cepVal));
                        }
                    }

                    // Carregar unidades vinculadas à pessoa
                    if (pes?.id) {
                            try {
                                const unidadesIds = (await api.get<number[]>(`/api/basico/pessoa/buscar-unidades-disponiveis`, {params: {pessoaId: pes.id}})).data;
                                if (unidadesIds && unidadesIds.length > 0) {
                                    const unidadesSet = new Set(unidadesIds.map(String));
                                    setUnidades(allUnidades.filter(u => unidadesSet.has(String((u as Record<string, unknown>).id))));
                                }
                            } catch {
                                try {
                                    const unidadesIds = (await api.get<number[]>(`/api/basico/pessoa/buscar-unidades`, {params: {entityId: pes.id}})).data;
                                    if (unidadesIds && unidadesIds.length > 0) {
                                        const unidadesSet = new Set(unidadesIds.map(String));
                                        setUnidades(allUnidades.filter(u => unidadesSet.has(String((u as Record<string, unknown>).id))));
                                    }
                                } catch {
                                    // ignore
                                }
                            }
                        }
                    }

                } catch (erro) {
                console.error('Erro ao carregar fornecedor:', erro);
                alert('Erro ao carregar registro.');
            }

        })();

        return () => {
            ativo = false;
        };

    }, [idParam, allUnidades]);

    // Quando seleciona uma PJ existente no autocomplete
    useEffect(() => {
        if (pjSelecionada && !criarNovaPj) {
            (async () => {
                try {
                    const pj = (await api.get<Record<string, unknown>>(`/api/basico/pessoa-juridica/${pjSelecionada.id}`)).data;
                    let pes: Record<string, unknown> | null = null;
                    if (pj.pessoaId) {
                        pes = (await api.get<Record<string, unknown>>(`/api/basico/pessoa/${pj.pessoaId}`)).data;
                    }
                    setPjId(pj.id as number);
                    setPjOriginal(pj);
                    setPessoaId(pes?.id as number | undefined);
                    setPessoaOriginal(pes);
                    setForm({
                        cnpj: str(pj.cnpj),
                        razaoSocial: str(pj.razaoSocial),
                        nomeFantasia: str(pj.nomeFantasia),
                        inscricaoMunicipal: str(pj.inscricaoMunicipal),
                        inscricaoEstadual: str(pj.inscricaoEstadual),
                        email: str(pes?.email),
                        fax: str(pj.fax),
                        telefone: str(pes?.telefone),
                        celular: str(pes?.celular),
                        observacao: str(pes?.observacao),
                    });
                    // Endereco
                    if (pes) {
                        const cepVal = str(pes.cep);
                        const numVal = str(pes.numero);
                        const compVal = str(pes.complemento);
                        const idLog = (pes.id_logradouro ?? (pes as any).logradouroId) as number|undefined;
                        setNumero(numVal); setComplemento(compVal);
                        if (idLog) {
                            try {
                                const logRes = (await api.get<Record<string, unknown>>(`/api/basico/logradouro/${idLog}`)).data;
                                setLogradouroId(logRes.id as number);
                                setLogradouroOpt({id: logRes.id as number, label: str(logRes.descricao)});
                                setCep(str(logRes.cep) ? formatCep(str(logRes.cep)) : formatCep(cepVal));
                                if (logRes.id_bairro) {
                                    const bRes = (await api.get<Record<string, unknown>>(`/api/basico/bairro/${logRes.id_bairro}`)).data;
                                    setBairroOpt({id: bRes.id as number, label: str(bRes.descricao)});
                                    if ((bRes as any).cidadeId) {
                                        const cRes = (await api.get<Record<string, unknown>>(`/api/basico/cidade/${(bRes as any).cidadeId}`)).data;
                                        setCidadeOpt({id: cRes.id as number, label: str((cRes as any).cidadeEstado ?? cRes.nome)});
                                    }
                                }
                            } catch {
                                setCep(formatCep(cepVal));
                            }
                        } else if (cepVal) setCep(formatCep(cepVal));
                    }
                } catch (erro) {
                    console.error('Erro ao carregar pessoa jurídica:', erro);
                }
            })();
        } else if (!pjSelecionada && !criarNovaPj) {
            // Limpar formulário se deselecionar
            setPjId(undefined);
            setPjOriginal(null);
            setPessoaId(undefined);
            setPessoaOriginal(null);
            setForm(FORM_VAZIO);
            setCep(''); setCidadeOpt(null); setBairroOpt(null); setLogradouroOpt(null); setNumero(''); setComplemento(''); setLogradouroId(undefined);
        }
    }, [pjSelecionada, criarNovaPj]);

    const set = (campo: keyof FormState, valor: string) => setForm((prev) => ({...prev, [campo]: valor}));

    const voltar = () => navigate('/view/fornecedor/listFornecedor');

    const salvar = async (voltarDepois: boolean) => {
        if (!form.razaoSocial.trim() || !form.cnpj.trim()) {
            alert('Informe pelo menos Razão Social e CNPJ.');
            return;
        }

        setSalvando(true);

        try {
            let finalPessoaId = pessoaId;
            let finalPjId: number | undefined = pjId;

            // Se está criando nova PJ, salva PJ e Pessoa primeiro
            if (criarNovaPj) {
                const pjBody: Record<string, unknown> = {
                    ...semId(pjOriginal),
                    cnpj: form.cnpj,
                    razaoSocial: form.razaoSocial,
                    nomeFantasia: form.nomeFantasia || null,
                    inscricaoMunicipal: form.inscricaoMunicipal || null,
                    inscricaoEstadual: form.inscricaoEstadual || null,
                    fax: form.fax || null,
                };

                const respostaPj = pjId
                    ? await api.put(`/api/basico/pessoa-juridica/${pjId}`, pjBody)
                    : await api.post('/api/basico/pessoa-juridica', pjBody);

                finalPjId = ((respostaPj.data as Record<string, unknown>)?.id as number) ?? pjId;

                const pessoaBody: Record<string, unknown> = {
                    ...semId(pessoaOriginal),
                    email: form.email || null,
                    telefone: form.telefone || null,
                    celular: form.celular || null,
                    observacao: form.observacao || null,
                    cep: cep || null,
                    numero: numero || null,
                    complemento: complemento || null,
                    logradouroId: logradouroId || null,
                };

                if (pessoaId) {
                    await api.put(`/api/basico/pessoa/${pessoaId}`, pessoaBody);
                    finalPessoaId = pessoaId;
                } else {
                    finalPessoaId = ((await api.post('/api/basico/pessoa', pessoaBody)).data as Record<string, unknown>)?.id as number | undefined;
                }

                if (!pjId && finalPessoaId && finalPjId) {
                    await api.put(`/api/basico/pessoa-juridica/${finalPjId}`, {...pjBody, pessoaId: finalPessoaId});
                }
            }

            // Agora cria/atualiza o Fornecedor vinculado à pessoa
            if (finalPessoaId) {
                const fornecedorBody: Record<string, unknown> = {
                    ...semId(fornecedorOriginal),
                    id_pessoa: finalPessoaId,
                    ativo: true,
                };

                if (fornecedorId) {
                    await api.put(`/api/basico/fornecedor/${fornecedorId}`, fornecedorBody);
                } else {
                    const respostaFornecedor = await api.post('/api/basico/fornecedor', fornecedorBody);
                    setFornecedorId((respostaFornecedor.data as Record<string, unknown>)?.id as number | undefined);
                }
            }

            if (voltarDepois) {
                voltar();
            } else {
                alert('Registro salvo com sucesso.');
            }

        } catch (erro) {
            console.error('Erro ao salvar:', erro);
            alert('Erro ao salvar registro.');
        } finally {
            setSalvando(false);
        }
    };

    const tabs: TabItem[] = [
        {
            key: 'vinculo',
            label: 'Vínculo Pessoa Jurídica',
            content: (
                <div className="form-grid">
                    <label className="form-field" style={{gridColumn: '1 / -1'}}>
                        <span className="form-label">Pessoa Jurídica *</span>
                        <AutoComplete
                            id="pj-autocomplete"
                            placeholder="Digite para buscar pessoa jurídica..."
                            value={pjSelecionada}
                            onChange={setPjSelecionada}
                            fetchOptions={fetchPessoaJuridica}
                            fetchById={fetchPessoaJuridicaById}
                            minChars={3}
                            disabled={criarNovaPj}
                        />
                    </label>
                    <label className="form-field" style={{gridColumn: '1 / -1'}}>
                        <BooleanField
                            value={criarNovaPj}
                            onChange={setCriarNovaPj}
                            label="Criar nova Pessoa Jurídica"
                        />
                    </label>
                </div>
            ),
        },
        {
            key: 'identificacao',
            label: 'Identificação',
            content: (
                <div className="form-grid">
                    <label className="form-field">
                        <span className="form-label">CNPJ *</span>
                        <input className="form-input" placeholder="99.999.999/9999-99" value={form.cnpj}
                               onChange={(e) => set('cnpj', e.target.value)} disabled={!!pjSelecionada && !criarNovaPj}/>
                    </label>
                    <label className="form-field">
                        <span className="form-label">Inscrição Municipal</span>
                        <input className="form-input" placeholder="Inscrição Municipal"
                               value={form.inscricaoMunicipal} onChange={(e) => set('inscricaoMunicipal', e.target.value)} disabled={!!pjSelecionada && !criarNovaPj}/>
                    </label>
                    <label className="form-field">
                        <span className="form-label">Razão Social *</span>
                        <input className="form-input" placeholder="Razão Social"
                               value={form.razaoSocial} onChange={(e) => set('razaoSocial', e.target.value)} disabled={!!pjSelecionada && !criarNovaPj}/>
                    </label>
                    <label className="form-field">
                        <span className="form-label">Nome Fantasia *</span>
                        <input className="form-input" placeholder="Nome Fantasia"
                               value={form.nomeFantasia} onChange={(e) => set('nomeFantasia', e.target.value)} disabled={!!pjSelecionada && !criarNovaPj}/>
                    </label>
                </div>
            ),
        },
        {
            key: 'informacoesBasicas',
            label: 'Informações Básicas',
            content: (
                <div className="form-grid">
                    <label className="form-field">
                        <span className="form-label">Inscrição Estadual</span>
                        <input className="form-input" placeholder="Inscrição Estadual"
                               value={form.inscricaoEstadual} onChange={(e) => set('inscricaoEstadual', e.target.value)} disabled={!!pjSelecionada && !criarNovaPj}/>
                    </label>
                    <label className="form-field">
                        <span className="form-label">E-mail</span>
                        <input className="form-input" type="email" placeholder="E-mail"
                               value={form.email}
                               onChange={(e) => set('email', e.target.value)} disabled={!!pjSelecionada && !criarNovaPj}/>
                    </label>
                    <label className="form-field">
                        <span className="form-label">Foto / Logo</span>
                        <div style={{gridColumn: 'span 3', display: 'flex', gap: '8px', alignItems: 'center'}}>
                            <input type="file" accept="image/*" className="form-input" style={{flex: 1}}/>
                            <button type="button" className="btnblue">Selecionar Imagem</button>
                            <button type="button" className="btnred">Limpar</button>
                        </div>
                    </label>
                </div>
            ),
        },
        {
            key: 'contatos',
            label: 'Contatos',
            content: (
                <div className="form-grid">
                    <label className="form-field">
                        <span className="form-label">Telefone *</span>
                        <input className="form-input" placeholder="(99) 99999-9999" value={form.telefone}
                               onChange={(e) => set('telefone', e.target.value)} disabled={!!pjSelecionada && !criarNovaPj}/>
                    </label>
                    <label className="form-field">
                        <span className="form-label">Celular *</span>
                        <input className="form-input" placeholder="(99) 99999-9999" value={form.celular}
                               onChange={(e) => set('celular', e.target.value)} disabled={!!pjSelecionada && !criarNovaPj}/>
                    </label>
                    <label className="form-field">
                        <span className="form-label">Fax</span>
                        <input className="form-input" placeholder="(99) 9999-9999" value={form.fax}
                               onChange={(e) => set('fax', e.target.value)} disabled={!!pjSelecionada && !criarNovaPj}/>
                    </label>
                </div>
            ),
        },
        {
            key: 'endereco',
            label: 'Endereço',
            content: (
                <div className="form-grid">
                    <label className="form-field" style={{gridColumn: '1 / -1'}}><span className="form-label">CEP</span>
                        <div style={{display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'nowrap'}}>
                            <input className="form-input" placeholder="99.999-999" style={{width:'120px', flexShrink: 0}} maxLength={9} value={cep} onChange={e=>setCep(formatCep(e.target.value))} disabled={!!pjSelecionada && !criarNovaPj} />
                            <button type="button" className="btnyellow" disabled={buscandoCep || (!!pjSelecionada && !criarNovaPj)} onClick={buscarCep}>{buscandoCep?'Buscando...':'Busca'}</button>
                            <button type="button" className="btngreen" disabled={!!pjSelecionada && !criarNovaPj} onClick={()=>{ setEnderecoAviso('Ajuste - selecione cidade/bairro/logradouro nos campos abaixo'); }}>Ajuste</button>
                            <button type="button" className="btnstop" disabled={!!pjSelecionada && !criarNovaPj} onClick={()=>{ setCep(''); setCidadeOpt(null); setBairroOpt(null); setLogradouroOpt(null); setNumero(''); setComplemento(''); setLogradouroId(undefined);}}>Novo</button>
                        </div>
                        {enderecoAviso && <small style={{color:'#c0392b'}}>{enderecoAviso}</small>}
                    </label>
                    <label className="form-field" style={{gridColumn: '1 / -1'}}>
                        <span className="form-label">Cidade</span>
                        <div>
                            <AutoComplete placeholder="Digite 3 letras..." value={cidadeOpt} onChange={setCidadeOpt} fetchOptions={fetchCidadesLog} disabled={!!pjSelecionada && !criarNovaPj} />
                        </div>
                    </label>
                    <label className="form-field" style={{gridColumn: '1 / -1'}}>
                        <span className="form-label">Bairro</span>
                        <div>
                            <AutoComplete placeholder="Digite 3 letras..." value={bairroOpt} onChange={setBairroOpt} fetchOptions={fetchBairros} disabled={!!pjSelecionada && !criarNovaPj} />
                        </div>
                    </label>
                    <label className="form-field" style={{gridColumn: '1 / -1'}}>
                        <span className="form-label">Logradouro</span>
                        <div>
                            <AutoComplete placeholder="Digite 3 letras..." value={logradouroOpt} onChange={o=>{ setLogradouroOpt(o); if(o) setLogradouroId(o.id);}} fetchOptions={fetchLogradouros} disabled={!!pjSelecionada && !criarNovaPj} />
                        </div>
                    </label>
                    <label className="form-field" style={{gridColumn: '1 / -1'}}><span className="form-label">Número *</span><input className="form-input" placeholder="Número" value={numero} onChange={e=>setNumero(e.target.value)} disabled={!!pjSelecionada && !criarNovaPj}/></label>
                    <label className="form-field" style={{gridColumn: '1 / -1'}}><span className="form-label">Complemento</span><textarea className="form-input" placeholder="Complemento" rows={3} style={{minHeight:'80px'}} value={complemento} onChange={e=>setComplemento(e.target.value)} disabled={!!pjSelecionada && !criarNovaPj}/></label>
                </div>
            ),
        },
        {
            key: 'unidades',
            label: 'Unidades',
            content: (
                <MasterDetail
                    label="Unidade"
                    source={UNIDADE_SOURCE}
                    valueKey="id"
                    searchKeys={UNIDADE_SEARCH}
                    columns={UNIDADE_COLUMNS}
                    items={unidades}
                    onChange={setUnidades}
                />
            ),
        },
        {
            key: 'outros',
            label: 'Outros',
            content: (
                <div className="form-grid">
                    <label className="form-field">
                        <span className="form-label">Currículo / Banco de Talentos</span>
                        <BooleanField value={curriculo} onChange={setCurriculo} disabled={!!pjSelecionada && !criarNovaPj}/>
                    </label>
                    <label className="form-field">
                        <span className="form-label">Observação</span>
                        <textarea className="form-input" placeholder="Observações" rows={5}
                                  style={{gridColumn: 'span 3', minHeight: '100px'}} value={form.observacao}
                                  onChange={(e) => set('observacao', e.target.value)} disabled={!!pjSelecionada && !criarNovaPj}/>
                    </label>
                </div>
            ),
        },
    ];

    const tabsVisiveis = criarNovaPj ? tabs : tabs.filter(t => t.key === 'vinculo');

    return (
        <PermissionGate permission="READ">
            <main>
                <h1>Cadastro de Fornecedor</h1>
                <div className="div_form">
                    
                    <div className="table_form">
                        <Tabs tabs={tabsVisiveis} initial="vinculo"/>
                        <div className="form-buttons">
                            <button type="button" className="btnstop" title="Salvar registro"
                                    disabled={salvando} onClick={() => void salvar(true)}>Gravar
                            </button>
                            <button type="button" className="btnblue" title="Salvar e continuar editando"
                                    disabled={salvando} onClick={() => void salvar(false)}>
                                Salvar e Continuar
                            </button>
                            <button type="button" className="btnyellow" title="Voltar para a lista"
                                    onClick={voltar}>Voltar
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </PermissionGate>
    );
}