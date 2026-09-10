import {useEffect, useMemo, useState} from 'react';

import {useNavigate, useSearchParams} from 'react-router-dom';

import {useQuery} from '@tanstack/react-query';

import {PermissionGate} from '../../../shared/services/permissions';

import {MasterDetail} from '../../../shared/components/MasterDetail';

import {BooleanField} from '../../../shared/components/BooleanField';

import {Tabs} from '../../../shared/components/Tabs';

import type {ApiItem} from '../../../shared/types/types.ts';

import {api} from '../../../shared/services/api';

import {UNIDADE_SOURCE, UNIDADE_COLUMNS, UNIDADE_SEARCH, AGENDA_SOURCE, AGENDA_COLUMNS, AGENDA_SEARCH} from '../../../shared/services/masterDetailSources';

import {EnderecoCampos} from '../../../shared/components/EnderecoForm';

import type {Endereco} from '../../../shared/components/EnderecoForm';

import type {TipoPessoa} from '../../auth/cadastroUsuarioTypes';

import {

    GENEROS,

    formatCpf,

    formatCnpj,

    formatPhone,

    str,

    num,

    semId,

    toDateInput,

} from '../../auth/cadastroUsuarioTypes';

import '../../../shared/components/AppLayout.css';



interface Funcionario {

    id?: number;

    funcaoId?: number;

    funcao?: {id: number; descricao: string};

    dataAdmissao?: string;

    mensalista?: boolean;

    ctps?: string;

    serie?: string;

    pis?: string;

    tituloEleitor?: string;

    zona?: string;

    secao?: string;

    carteiraReservista?: string;

    qtdFilhosMenor14?: number;

}



interface Perfil {

    id: number;

    descricao: string;

}



interface Agenda {

    id: number;

    descricao: string;

    agendar?: boolean;

    alterar?: boolean;

    fechar?: boolean;

    iniciar?: boolean;

    atender?: boolean;

}



const sectionTitleStyle: React.CSSProperties = {

    fontSize: '14px',

    fontWeight: 700,

    color: '#2f333b',

    marginBottom: '12px',

    letterSpacing: '0.5px',

    textTransform: 'uppercase' as const,

};



const toggleContainerStyle: React.CSSProperties = {

    display: 'flex',

    gap: '8px',

    marginBottom: '16px',

};



const toggleBtnStyle = (active: boolean): React.CSSProperties => ({

    flex: 1,

    padding: '10px 16px',

    border: active ? '2px solid #265a88' : '2px solid #d3d3d3',

    borderRadius: '6px',

    background: active ? 'linear-gradient(180deg, #337ab7, #265a88)' : '#fff',

    color: active ? '#fff' : '#333',

    fontWeight: active ? 700 : 500,

    fontSize: '14px',

    cursor: 'pointer',

    textAlign: 'center' as const,

    transition: 'all 0.2s',

});



export default function CadastroUsuarioScreen() {

    const navigate = useNavigate();

    const [searchParams] = useSearchParams();

    const idParam = searchParams.get('id');



    const [tipoPessoa, setTipoPessoa] = useState<TipoPessoa>('FISICA');

    const [salvando, setSalvando] = useState(false);

    const [error, setError] = useState<string | undefined>();



    const [pfId, setPfId] = useState<number | undefined>();

    const [pjId, setPjId] = useState<number | undefined>();

    const [pessoaId, setPessoaId] = useState<number | undefined>();

    const [pfOriginal, setPfOriginal] = useState<Record<string, unknown> | null>(null);

    const [pjOriginal, setPjOriginal] = useState<Record<string, unknown> | null>(null);

    const [pessoaOriginal, setPessoaOriginal] = useState<Record<string, unknown> | null>(null);



    const [unidades, setUnidades] = useState<ApiItem[]>([]);

    const [curriculo, setCurriculo] = useState(false);

    const [enderecos, setEnderecos] = useState<Endereco[]>([]);

    const [funcionario, setFuncionario] = useState<Funcionario | null>(null);

    const [perfis, setPerfis] = useState<Perfil[]>([]);

    const [agendas, setAgendas] = useState<Agenda[]>([]);



    const [etniaOptions, setEtniaOptions] = useState<Array<{value: string, label: string}>>([]);

    const [estadoCivilOptions, setEstadoCivilOptions] = useState<Array<{value: string, label: string}>>([]);

    const [escolaridadeOptions, setEscolaridadeOptions] = useState<Array<{value: string, label: string}>>([]);

    const [funcaoOptions, setFuncaoOptions] = useState<Array<{value: string, label: string}>>([]);



    useEffect(() => {

        async function fetchOptions() {

            try {

                const etnia = await api.get<Array<{id: number, descricao: string}>>('/api/basico/etnia');

                setEtniaOptions(etnia.data.map(e => ({value: String(e.id), label: e.descricao})));

            } catch (e) {

                console.error('Erro ao carregar etnias:', e);

            }

            try {

                const estadoCivil = await api.get<Array<{id: number, descricao: string}>>('/api/basico/estado-civil');

                setEstadoCivilOptions(estadoCivil.data.map(e => ({value: String(e.id), label: e.descricao})));

            } catch (e) {

                console.error('Erro ao carregar estado civil:', e);

            }

            try {

                const escolaridade = await api.get<Array<{id: number, descricao: string, ordem: number}>>('/api/basico/escolaridade');

                setEscolaridadeOptions(escolaridade.data.map(e => ({value: String(e.id), label: e.descricao})));

            } catch (e) {

                console.error('Erro ao carregar escolaridade:', e);

            }

            try {

                const funcao = await api.get<Array<{id: number, descricao: string}>>('/api/basico/funcao');

                setFuncaoOptions(funcao.data.map(e => ({value: String(e.id), label: e.descricao})));

            } catch (e) {

                console.error('Erro ao carregar funções:', e);

            }

        }

        fetchOptions();

    }, []);



    const [form, setForm] = useState<Record<string, string>>({

        login: '',

        senha: '',

        cpf: '',

        rg: '',

        nome: '',

        email: '',

        nomeSocial: '',

        dataNascimento: '',

        cidadeOrigem: '',

        generoId: '',

        etniaId: '',

        estadoCivilId: '',

        escolaridadeId: '',

        nomePai: '',

        nomeMae: '',

        nomeReferencia: '',

        telefoneReferencia: '',

        celularReferencia: '',

        nomeReferencia2: '',

        telefoneReferencia2: '',

        celularReferencia2: '',

        telefoneResidencial: '',

        telefoneComercial: '',

        celular: '',

        facebook: '',

        twitter: '',

        googlePlus: '',

        telegram: '',

        cnpj: '',

        razaoSocial: '',

        nomeFantasia: '',

        inscricaoMunicipal: '',

        inscricaoEstadual: '',

        fax: '',

        observacao: '',

        // Funcionario fields

        ctps: '',

        serie: '',

        pis: '',

        tituloEleitor: '',

        zona: '',

        secao: '',

        carteiraReservista: '',

        qtdFilhosMenor14: '',

        funcaoId: '',

        dataAdmissao: '',

        mensalista: '',

    });



    const {data: allUnidades = []} = useQuery({

        queryKey: [UNIDADE_SOURCE],

        queryFn: async () => (await api.get<ApiItem[]>(UNIDADE_SOURCE)).data,

    });

    const {data: allAgendas = []} = useQuery({

        queryKey: [AGENDA_SOURCE],

        queryFn: async () => (await api.get<ApiItem[]>(AGENDA_SOURCE)).data,

    });

    // A API de vínculo (/api/basico/usuario/{id}/agendas) retorna só os ids;
    // resolve no catálogo para exibir as colunas booleanas da agenda.
    const agendasResolved = useMemo(() => {
        const catalogo = new Map(
            (allAgendas as unknown as Array<Record<string, unknown>>).map((item) => [String(item.id), item]),
        );
        return agendas.map((a) => {
            const id = String((a as unknown as Record<string, unknown>).id ?? '');
            const encontrado = catalogo.get(id);
            return ((encontrado ?? a) as unknown as Agenda);
        });
    }, [agendas, allAgendas]);



    useEffect(() => {

        if (!idParam) return;

        let ativo = true;

        (async () => {

            try {

                let pf: Record<string, unknown> | null = null;

                let pj: Record<string, unknown> | null = null;

                let pes: Record<string, unknown> | null = null;



                try {

                    pf = (await api.get<Record<string, unknown>>(`/api/basico/pessoa-fisica/${idParam}`)).data;

                    if (pf && pf.pessoaId) {

                        pes = (await api.get<Record<string, unknown>>(`/api/basico/pessoa/${pf.pessoaId}`)).data;

                    }

                    if (!ativo) return;

                    setTipoPessoa('FISICA');

                    setPfId(pf?.id as number);

                    setPfOriginal(pf);

                } catch {

                    try {

                        pj = (await api.get<Record<string, unknown>>(`/api/basico/pessoa-juridica/${idParam}`)).data;

                        if (pj && pj.pessoaId) {

                            pes = (await api.get<Record<string, unknown>>(`/api/basico/pessoa/${pj.pessoaId}`)).data;

                        }

                        if (!ativo) return;

                        setTipoPessoa('JURIDICA');

                        setPjId(pj?.id as number);

                        setPjOriginal(pj);

                    } catch {

                        if (!ativo) return;

                        alert('Registro não encontrado.');

                        return;

                    }

                }



                if (pes) {

                    setPessoaId(pes.id as number | undefined);

                    setPessoaOriginal(pes);

                }



                if (pf) {

                    setForm((prev) => ({

                        ...prev,

                        cpf: str(pf!.cpf),

                        rg: str(pf!.rg),

                        nome: str(pf!.nome),

                        nomeSocial: str(pf!.nomeSocial),

                        dataNascimento: toDateInput(pf!.dataNascimento),

                        cidadeOrigem: str(pf!.cidadeOrigem),

                        generoId: pf!.generoId != null ? String(pf!.generoId) : '',

                        etniaId: pf!.etniaId != null ? String(pf!.etniaId) : '',

                        estadoCivilId: pf!.estadoCivilId != null ? String(pf!.estadoCivilId) : '',

                        escolaridadeId: pf!.escolaridadeId != null ? String(pf!.escolaridadeId) : '',

                        nomeReferencia: str(pf!.nomeReferencia),

                        telefoneReferencia: str(pf!.telefoneReferencia),

                        celularReferencia: str(pf!.celularReferencia),

                        nomeReferencia2: str(pf!.nomeReferencia2),

                        telefoneReferencia2: str(pf!.telefoneReferencia2),

                        celularReferencia2: str(pf!.celularReferencia2),

                        nomePai: str(pf!.nomePai),

                        nomeMae: str(pf!.nomeMae),

                        telefoneComercial: str(pf!.telefoneComercial),

                        facebook: str(pf!.facebook),

                        twitter: str(pf!.twitter),

                        googlePlus: str(pf!.googlePlus),

                    }));

                }



                if (pj) {

                    setForm((prev) => ({

                        ...prev,

                        cnpj: str(pj!.cnpj),

                        razaoSocial: str(pj!.razaoSocial),

                        nomeFantasia: str(pj!.nomeFantasia),

                        inscricaoMunicipal: str(pj!.inscricaoMunicipal),

                        inscricaoEstadual: str(pj!.inscricaoEstadual),

                        fax: str(pj!.fax),

                    }));

                }



                if (pes) {

                    setForm((prev) => ({

                        ...prev,

                        email: str(pes!.email),

                        telefoneResidencial: str(pes!.telefone),

                        celular: str(pes!.celular),

                        observacao: str(pes!.observacao),

                    }));



                    const enderecosCarregados: Endereco[] = [];

                    const cep = str(pes!.cep);

                    const complemento = str(pes!.complemento);

                    const numero = str(pes!.numero);

                    const idLogradouro = (pes!.id_logradouro ?? pes!.logradouroId) as number | null | undefined;



                    if (idLogradouro) {

                        try {

                            const logRes = (await api.get<Record<string, unknown>>(`/api/basico/logradouro/${idLogradouro}`)).data;

                            let bairroDesc = '';

                            let cidadeDesc = '';

                            if (logRes.id_bairro) {

                                const bairroRes = (await api.get<Record<string, unknown>>(`/api/basico/bairro/${logRes.id_bairro}`)).data;

                                bairroDesc = str(bairroRes.descricao);

                                if (bairroRes.cidadeId) {

                                    const cidadeRes = (await api.get<Record<string, unknown>>(`/api/basico/cidade/${bairroRes.cidadeId}`)).data;

                                    cidadeDesc = str(cidadeRes.nome);

                                }

                            }

                            enderecosCarregados.push({

                                id: idLogradouro,

                                cep: str(logRes.cep) || cep,

                                logradouro: str(logRes.descricao),

                                bairro: bairroDesc,

                                cidade: cidadeDesc,

                                numero,

                                complemento,

                            });

                        } catch {

                            if (cep || numero || complemento) {

                                enderecosCarregados.push({cep, cidade: '', bairro: '', logradouro: '', numero, complemento});

                            }

                        }

                    } else if (cep || numero || complemento) {

                        enderecosCarregados.push({cep, cidade: '', bairro: '', logradouro: '', numero, complemento});

                    }

                    setEnderecos(enderecosCarregados);

                }



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



                    // Load funcionario

                    try {

                        const func = (await api.get<Record<string, unknown>>(`/api/basico/funcionario/buscar-por-pessoa/${pes.id}`)).data;

                        if (func) {

                            setFuncionario(func as Funcionario);

                            setForm(prev => ({

                                ...prev,

                                ctps: str(func.ctps),

                                serie: str(func.serie),

                                pis: str(func.pis),

                                tituloEleitor: str(func.tituloEleitor),

                                zona: str(func.zona),

                                secao: str(func.secao),

                                carteiraReservista: str(func.carteiraReservista),

                                qtdFilhosMenor14: func.qtdFilhosMenor14 ? String(func.qtdFilhosMenor14) : '',

                                funcaoId: func.funcaoId ? String(func.funcaoId) : '',

                                dataAdmissao: func.dataAdmissao ? toDateInput(func.dataAdmissao) : '',

                                mensalista: func.mensalista ? 'true' : 'false',

                            }));

                        }

                    } catch (e) {

                        console.error('Erro ao carregar funcionário:', e);

                    }



                    // Load perfis

                    try {

                        const perfisData = (await api.get<Perfil[]>(`/api/basico/usuario/${idParam}/perfis`)).data;

                        setPerfis(perfisData || []);

                    } catch (e) {

                        console.error('Erro ao carregar perfis:', e);

                    }



                    // Load agendas

                    try {

                        const agendasData = (await api.get<Agenda[]>(`/api/basico/usuario/${idParam}/agendas`)).data;

                        // A API retorna apenas os ids; normaliza para objetos para exibição e salvamento.
                        setAgendas((agendasData || []).map((x) => (typeof x === 'number' || typeof x === 'string' ? {id: Number(x), descricao: ''} : x)) as Agenda[]);

                    } catch (e) {

                        console.error('Erro ao carregar agendas:', e);

                    }

                }

            } catch (erro) {

                console.error('Erro ao carregar registro:', erro);

                alert('Erro ao carregar registro.');

            }

        })();

        return () => { ativo = false; };

    }, [idParam, allUnidades]);



    const set = (campo: string, valor: string) => setForm((prev) => ({...prev, [campo]: valor}));



    const voltar = () => navigate(-1);



    const salvar = async (voltarDepois: boolean) => {

        setError(undefined);

        if (tipoPessoa === 'FISICA') {

            if (!form.nome.trim() || !form.cpf.trim()) {

                setError('Informe pelo menos Nome e CPF.');

                return;

            }

        } else {

            if (!form.razaoSocial.trim() || !form.cnpj.trim()) {

                setError('Informe pelo menos Razão Social e CNPJ.');

                return;

            }

        }



        setSalvando(true);

        try {

            const enderecoPrincipal = enderecos[0];



            if (tipoPessoa === 'FISICA') {

                const pfBody: Record<string, unknown> = {

                    ...semId(pfOriginal),

                    nome: form.nome,

                    cpf: form.cpf,

                    rg: form.rg || null,

                    nomeSocial: form.nomeSocial || null,

                    dataNascimento: form.dataNascimento || null,

                    cidadeOrigem: form.cidadeOrigem || null,

                    generoId: num(form.generoId),

                    etniaId: num(form.etniaId),

                    estadoCivilId: num(form.estadoCivilId),

                    escolaridadeId: num(form.escolaridadeId),

                    nomeReferencia: form.nomeReferencia || null,

                    telefoneReferencia: form.telefoneReferencia || null,

                    celularReferencia: form.celularReferencia || null,

                    nomeReferencia2: form.nomeReferencia2 || null,

                    telefoneReferencia2: form.telefoneReferencia2 || null,

                    celularReferencia2: form.celularReferencia2 || null,

                    nomePai: form.nomePai || null,

                    nomeMae: form.nomeMae || null,

                    telefoneComercial: form.telefoneComercial || null,

                    facebook: form.facebook || null,

                    twitter: form.twitter || null,

                    googlePlus: form.googlePlus || null,

                };

                const respostaPf = pfId

                    ? await api.put(`/api/basico/pessoa-fisica/${pfId}`, pfBody)

                    : await api.post('/api/basico/pessoa-fisica', pfBody);

                const novoPfId = (respostaPf.data as Record<string, unknown>)?.id ?? pfId;



                const pessoaBody: Record<string, unknown> = {

                    ...semId(pessoaOriginal),

                    email: form.email || null,

                    telefone: form.telefoneResidencial || null,

                    celular: form.celular || null,

                    observacao: form.observacao || null,

                    cep: enderecoPrincipal?.cep || null,

                    numero: enderecoPrincipal?.numero || null,

                    complemento: enderecoPrincipal?.complemento || null,

                };

                let novoPesId = pessoaId;

                if (pessoaId) {

                    await api.put(`/api/basico/pessoa/${pessoaId}`, pessoaBody);

                } else {

                    novoPesId = ((await api.post('/api/basico/pessoa', pessoaBody)).data as Record<string, unknown>)?.id as number | undefined;

                }

                if (!pfId && novoPesId && novoPfId) {

                    await api.put(`/api/basico/pessoa-fisica/${novoPfId}`, {...pfBody, pessoaId: novoPesId});

                }



                const usuarioId = pfId ?? novoPfId;



                // Save funcionario

                const funcionarioBody: Record<string, unknown> = {

                    ...semId(funcionario),

                    pessoaId: novoPesId,

                    funcaoId: num(form.funcaoId),

                    dataAdmissao: form.dataAdmissao || null,

                    mensalista: form.mensalista === 'true',

                    ctps: form.ctps || null,

                    serie: form.serie || null,

                    pis: form.pis || null,

                    tituloEleitor: form.tituloEleitor || null,

                    zona: form.zona || null,

                    secao: form.secao || null,

                    carteiraReservista: form.carteiraReservista || null,

                    qtdFilhosMenor14: num(form.qtdFilhosMenor14),

                };

                if (funcionario?.id) {

                    await api.put(`/api/basico/funcionario/${funcionario.id}`, funcionarioBody);

                } else if (novoPesId) {

                    await api.post('/api/basico/funcionario', funcionarioBody);

                }



                // Save perfis

                if (usuarioId) {

                    await api.put(`/api/basico/usuario/${usuarioId}/perfis`, perfis.map(p => p.id));

                }



                // Save agendas

                if (usuarioId) {

                    await api.put(`/api/basico/usuario/${usuarioId}/agendas`, agendas.map(a => a.id));

                }



                // Save unidades

                if (usuarioId) {

                    await api.put(`/api/basico/usuario/${usuarioId}/unidades`, unidades.map(u => (u as Record<string, unknown>).id));

                }

            } else {

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

                const novoPjId = (respostaPj.data as Record<string, unknown>)?.id ?? pjId;



                const pessoaBody: Record<string, unknown> = {

                    ...semId(pessoaOriginal),

                    email: form.email || null,

                    telefone: form.telefoneResidencial || null,

                    celular: form.celular || null,

                    observacao: form.observacao || null,

                    cep: enderecoPrincipal?.cep || null,

                    numero: enderecoPrincipal?.numero || null,

                    complemento: enderecoPrincipal?.complemento || null,

                };

                let novoPesId = pessoaId;

                if (pessoaId) {

                    await api.put(`/api/basico/pessoa/${pessoaId}`, pessoaBody);

                } else {

                    novoPesId = ((await api.post('/api/basico/pessoa', pessoaBody)).data as Record<string, unknown>)?.id as number | undefined;

                }

                if (!pjId && novoPesId && novoPjId) {

                    await api.put(`/api/basico/pessoa-juridica/${novoPjId}`, {...pjBody, pessoaId: novoPesId});

                }



                const usuarioId = pjId ?? novoPjId;



                // Save funcionario (if applicable for PJ)

                const funcionarioBody: Record<string, unknown> = {

                    ...semId(funcionario),

                    pessoaId: novoPesId,

                    funcaoId: num(form.funcaoId),

                    dataAdmissao: form.dataAdmissao || null,

                    mensalista: form.mensalista === 'true',

                    ctps: form.ctps || null,

                    serie: form.serie || null,

                    pis: form.pis || null,

                    tituloEleitor: form.tituloEleitor || null,

                    zona: form.zona || null,

                    secao: form.secao || null,

                    carteiraReservista: form.carteiraReservista || null,

                    qtdFilhosMenor14: num(form.qtdFilhosMenor14),

                };

                if (funcionario?.id) {

                    await api.put(`/api/basico/funcionario/${funcionario.id}`, funcionarioBody);

                } else if (novoPesId) {

                    await api.post('/api/basico/funcionario', funcionarioBody);

                }



                // Save perfis

                if (usuarioId) {

                    await api.put(`/api/basico/usuario/${usuarioId}/perfis`, perfis.map(p => p.id));

                }



                // Save agendas

                if (usuarioId) {

                    await api.put(`/api/basico/usuario/${usuarioId}/agendas`, agendas.map(a => a.id));

                }



                // Save unidades

                if (usuarioId) {

                    await api.put(`/api/basico/usuario/${usuarioId}/unidades`, unidades.map(u => (u as Record<string, unknown>).id));

                }

            }



            if (voltarDepois) {

                voltar();

            } else {

                alert('Registro salvo com sucesso.');

            }

        } catch (erro) {

            console.error('Erro ao salvar:', erro);

            setError('Erro ao salvar registro.');

        } finally {

            setSalvando(false);

        }

    };



    const abaPessoal = (

        <div className="form-grid">

            <div style={sectionTitleStyle}>Dados Pessoais</div>

            {tipoPessoa === 'FISICA' ? (

                <>

                    <label className="form-field">

                        <span className="form-label">CPF *</span>

                        <input className="form-input" value={form.cpf}

                            onChange={(e) => set('cpf', formatCpf(e.target.value))}

                            placeholder="999.999.999-99" maxLength={14} />

                    </label>

                    <label className="form-field">

                        <span className="form-label">RG</span>

                        <input className="form-input" value={form.rg}

                            onChange={(e) => set('rg', e.target.value)}

                            placeholder="Registro Geral" />

                    </label>

                    <label className="form-field" style={{gridColumn: 'span 4'}}>

                        <span className="form-label">Nome Completo *</span>

                        <input className="form-input" value={form.nome}

                            onChange={(e) => set('nome', e.target.value)}

                            placeholder="Nome completo" />

                    </label>

                    <label className="form-field" style={{gridColumn: 'span 4'}}>

                        <span className="form-label">Nome Social</span>

                        <input className="form-input" value={form.nomeSocial}

                            onChange={(e) => set('nomeSocial', e.target.value)}

                            placeholder="Nome social" />

                    </label>

                    <label className="form-field">

                        <span className="form-label">Data Nascimento *</span>

                        <input className="form-input" type="date" value={form.dataNascimento}

                            onChange={(e) => set('dataNascimento', e.target.value)} />

                    </label>

                    <label className="form-field">

                        <span className="form-label">Gênero</span>

                        <select className="form-input form-select" value={form.generoId}

                            onChange={(e) => set('generoId', e.target.value)}>

                            <option value="">-- Selecione --</option>

                            {GENEROS.map((g) => <option key={g.value} value={g.value}>{g.label}</option>)}

                        </select>

                    </label>

                    <label className="form-field">

                        <span className="form-label">Etnia</span>

                        <select className="form-input form-select" value={form.etniaId}

                            onChange={(e) => set('etniaId', e.target.value)}>

                            <option value="">-- Selecione --</option>

                            {etniaOptions.map((e) => <option key={e.value} value={e.value}>{e.label}</option>)}

                        </select>

                    </label>

                    <label className="form-field">

                        <span className="form-label">Estado Civil *</span>

                        <select className="form-input form-select" value={form.estadoCivilId}

                            onChange={(e) => set('estadoCivilId', e.target.value)}>

                            <option value="">-- Selecione --</option>

                            {estadoCivilOptions.map((e) => <option key={e.value} value={e.value}>{e.label}</option>)}

                        </select>

                    </label>

                    <label className="form-field">

                        <span className="form-label">Escolaridade *</span>

                        <select className="form-input form-select" value={form.escolaridadeId}

                            onChange={(e) => set('escolaridadeId', e.target.value)}>

                            <option value="">-- Selecione --</option>

                            {escolaridadeOptions.map((e) => <option key={e.value} value={e.value}>{e.label}</option>)}

                        </select>

                    </label>

                    <label className="form-field" style={{gridColumn: 'span 2'}}>

                        <span className="form-label">Nome do Pai</span>

                        <input className="form-input" value={form.nomePai}

                            onChange={(e) => set('nomePai', e.target.value)}

                            placeholder="Nome do pai" />

                    </label>

                    <label className="form-field" style={{gridColumn: 'span 2'}}>

                        <span className="form-label">Nome da Mãe *</span>

                        <input className="form-input" value={form.nomeMae}

                            onChange={(e) => set('nomeMae', e.target.value)}

                            placeholder="Nome da mãe" />

                    </label>

                </>

            ) : (

                <>

                    <label className="form-field">

                        <span className="form-label">CNPJ *</span>

                        <input className="form-input" value={form.cnpj}

                            onChange={(e) => set('cnpj', formatCnpj(e.target.value))}

                            placeholder="99.999.999/9999-99" maxLength={18} />

                    </label>

                    <label className="form-field" style={{gridColumn: 'span 3'}}>

                        <span className="form-label">Razão Social *</span>

                        <input className="form-input" value={form.razaoSocial}

                            onChange={(e) => set('razaoSocial', e.target.value)}

                            placeholder="Razão social" />

                    </label>

                    <label className="form-field" style={{gridColumn: 'span 4'}}>

                        <span className="form-label">Nome Fantasia</span>

                        <input className="form-input" value={form.nomeFantasia}

                            onChange={(e) => set('nomeFantasia', e.target.value)}

                            placeholder="Nome fantasia" />

                    </label>

                    <label className="form-field">

                        <span className="form-label">Inscrição Municipal</span>

                        <input className="form-input" value={form.inscricaoMunicipal}

                            onChange={(e) => set('inscricaoMunicipal', e.target.value)}

                            placeholder="Inscrição municipal" />

                    </label>

                    <label className="form-field">

                        <span className="form-label">Inscrição Estadual</span>

                        <input className="form-input" value={form.inscricaoEstadual}

                            onChange={(e) => set('inscricaoEstadual', e.target.value)}

                            placeholder="Inscrição estadual" />

                    </label>

                </>

            )}



            {tipoPessoa === 'FISICA' && (

                <>

                    <div style={sectionTitleStyle}>Referências</div>

                    <label className="form-field" style={{gridColumn: 'span 2'}}>

                        <span className="form-label">Nome Referência 1 *</span>

                        <input className="form-input" value={form.nomeReferencia}

                            onChange={(e) => set('nomeReferencia', e.target.value)}

                            placeholder="Nome referência" />

                    </label>

                    <label className="form-field">

                        <span className="form-label">Telefone</span>

                        <input className="form-input" value={form.telefoneReferencia}

                            onChange={(e) => set('telefoneReferencia', formatPhone(e.target.value))}

                            placeholder="(99) 9999-9999" />

                    </label>

                    <label className="form-field">

                        <span className="form-label">Celular</span>

                        <input className="form-input" value={form.celularReferencia}

                            onChange={(e) => set('celularReferencia', formatPhone(e.target.value))}

                            placeholder="(99) 99999-9999" />

                    </label>

                    <label className="form-field" style={{gridColumn: 'span 2'}}>

                        <span className="form-label">Nome Referência 2</span>

                        <input className="form-input" value={form.nomeReferencia2}

                            onChange={(e) => set('nomeReferencia2', e.target.value)}

                            placeholder="Nome referência 2" />

                    </label>

                    <label className="form-field">

                        <span className="form-label">Telefone</span>

                        <input className="form-input" value={form.telefoneReferencia2}

                            onChange={(e) => set('telefoneReferencia2', formatPhone(e.target.value))}

                            placeholder="(99) 9999-9999" />

                    </label>

                    <label className="form-field">

                        <span className="form-label">Celular</span>

                        <input className="form-input" value={form.celularReferencia2}

                            onChange={(e) => set('celularReferencia2', formatPhone(e.target.value))}

                            placeholder="(99) 99999-9999" />

                    </label>

                </>

            )}

        </div>

    );



    const abaEndereco = (

        <div className="form-grid">

            <div style={sectionTitleStyle}>Endereço</div>

            <div style={{gridColumn: '1 / -1'}}>

                <EnderecoCampos value={enderecos} onChange={setEnderecos} />

            </div>

        </div>

    );



    const abaContato = (

        <div className="form-grid">

            <div style={sectionTitleStyle}>Contato</div>

            <label className="form-field" style={{gridColumn: 'span 4'}}>

                <span className="form-label">E-mail *</span>

                <input className="form-input" type="email" value={form.email}

                    onChange={(e) => set('email', e.target.value)}

                    placeholder="E-mail" />

            </label>

            <label className="form-field">

                <span className="form-label">Telefone Residencial</span>

                <input className="form-input" value={form.telefoneResidencial}

                    onChange={(e) => set('telefoneResidencial', formatPhone(e.target.value))}

                    placeholder="(99) 9999-9999" />

            </label>

            {tipoPessoa === 'FISICA' && (

                <label className="form-field">

                    <span className="form-label">Telefone Comercial</span>

                    <input className="form-input" value={form.telefoneComercial}

                        onChange={(e) => set('telefoneComercial', formatPhone(e.target.value))}

                        placeholder="(99) 9999-9999" />

                </label>

            )}

            <label className="form-field">

                <span className="form-label">Celular</span>

                <input className="form-input" value={form.celular}

                    onChange={(e) => set('celular', formatPhone(e.target.value))}

                    placeholder="(99) 99999-9999" />

            </label>

            {tipoPessoa === 'JURIDICA' && (

                <label className="form-field">

                    <span className="form-label">Fax</span>

                    <input className="form-input" value={form.fax}

                        onChange={(e) => set('fax', formatPhone(e.target.value))}

                        placeholder="(99) 9999-9999" />

                </label>

            )}



            {tipoPessoa === 'FISICA' && (

                <>

                    <div style={sectionTitleStyle}>Redes Sociais</div>

                    <label className="form-field" style={{gridColumn: 'span 2'}}>

                        <span className="form-label">Facebook</span>

                        <input className="form-input" value={form.facebook}

                            onChange={(e) => set('facebook', e.target.value)}

                            placeholder="Facebook" />

                    </label>

                    <label className="form-field" style={{gridColumn: 'span 2'}}>

                        <span className="form-label">Twitter</span>

                        <input className="form-input" value={form.twitter}

                            onChange={(e) => set('twitter', e.target.value)}

                            placeholder="Twitter" />

                    </label>

                    <label className="form-field" style={{gridColumn: 'span 2'}}>

                        <span className="form-label">Google+</span>

                        <input className="form-input" value={form.googlePlus}

                            onChange={(e) => set('googlePlus', e.target.value)}

                            placeholder="Google+" />

                    </label>

                    <label className="form-field" style={{gridColumn: 'span 2'}}>

                        <span className="form-label">Telegram</span>

                        <input className="form-input" value={form.telegram}

                            onChange={(e) => set('telegram', e.target.value)}

                            placeholder="Telegram" />

                    </label>

                </>

            )}

        </div>

    );



    const abaDocumentos = (

        <div className="form-grid">

            <div style={sectionTitleStyle}>Documentos</div>

            <label className="form-field">

                <span className="form-label">CTPS *</span>

                <input className="form-input" value={form.ctps}

                    onChange={(e) => set('ctps', e.target.value)}

                    placeholder="Carteira de Trabalho" />

            </label>

            <label className="form-field">

                <span className="form-label">Série *</span>

                <input className="form-input" value={form.serie}

                    onChange={(e) => set('serie', e.target.value)}

                    placeholder="Série" />

            </label>

            <label className="form-field">

                <span className="form-label">PIS *</span>

                <input className="form-input" value={form.pis}

                    onChange={(e) => set('pis', e.target.value)}

                    placeholder="999.9999.999-9" />

            </label>

            <label className="form-field">

                <span className="form-label">Título Eleitor</span>

                <input className="form-input" value={form.tituloEleitor}

                    onChange={(e) => set('tituloEleitor', e.target.value)}

                    placeholder="Título de Eleitor" />

            </label>

            <label className="form-field">

                <span className="form-label">Zona</span>

                <input className="form-input" value={form.zona}

                    onChange={(e) => set('zona', e.target.value)}

                    placeholder="Zona Eleitoral" />

            </label>

            <label className="form-field">

                <span className="form-label">Seção</span>

                <input className="form-input" value={form.secao}

                    onChange={(e) => set('secao', e.target.value)}

                    placeholder="Seção Eleitoral" />

            </label>

            <label className="form-field">

                <span className="form-label">Carteira Reservista</span>

                <input className="form-input" value={form.carteiraReservista}

                    onChange={(e) => set('carteiraReservista', e.target.value)}

                    placeholder="Carteira de Reservista" />

            </label>

            <label className="form-field">

                <span className="form-label">Qtd Filhos Menor 14</span>

                <input className="form-input" type="number" value={form.qtdFilhosMenor14}

                    onChange={(e) => set('qtdFilhosMenor14', e.target.value)}

                    placeholder="Quantidade" />

            </label>

            <div style={{gridColumn: '1 / -1', padding: '16px', backgroundColor: '#f5f5f5', borderRadius: '6px', color: '#666', marginTop: '16px'}}>

                <p style={{margin: 0}}>

                    Upload de arquivos (Foto 3x4, CTPS, RG, CPF, Comprovante de Residência, etc.) será adicionado em

                    versões futuras.

                </p>

            </div>

        </div>

    );



    const abaTrabalho = (

        <div className="form-grid">

            <div style={sectionTitleStyle}>Trabalho</div>

            <label className="form-field">

                <span className="form-label">Função *</span>

                <select className="form-input form-select" value={form.funcaoId}

                    onChange={(e) => set('funcaoId', e.target.value)}>

                    <option value="">-- Selecione --</option>

                    {funcaoOptions.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}

                </select>

            </label>

            <label className="form-field">

                <span className="form-label">Data Admissão</span>

                <input className="form-input" type="date" value={form.dataAdmissao}

                    onChange={(e) => set('dataAdmissao', e.target.value)} />

            </label>

            <label className="form-field">

                <span className="form-label">Mensalista</span>

                <select className="form-input form-select" value={form.mensalista}

                    onChange={(e) => set('mensalista', e.target.value)}>

                    <option value="">-- Selecione --</option>

                    <option value="true">Sim</option>

                    <option value="false">Não</option>

                </select>

            </label>

            <label className="form-field" style={{gridColumn: '1 / -1'}}>

                <span className="form-label">Observação</span>

                <textarea className="form-input" placeholder="Observações" rows={4}

                    style={{minHeight: '80px'}}

                    value={form.observacao}

                    onChange={(e) => set('observacao', e.target.value)} />

            </label>

        </div>

    );



    const [acessoSubTab, setAcessoSubTab] = useState<'unidade' | 'perfil' | 'agenda'>('unidade');



    const abaAcessos = (

        <div className="form-grid">

            <div style={{display: 'flex', gap: '8px', marginBottom: '16px', borderBottom: '1px solid #ddd', paddingBottom: '8px'}}>

                <button

                    type="button"

                    className={acessoSubTab === 'unidade' ? 'btnblue' : 'btnyellow'}

                    onClick={() => setAcessoSubTab('unidade')}

                    style={{padding: '8px 16px', border: 'none', borderRadius: '4px', cursor: 'pointer'}}

                >

                    Unidade

                </button>

                <button

                    type="button"

                    className={acessoSubTab === 'perfil' ? 'btnblue' : 'btnyellow'}

                    onClick={() => setAcessoSubTab('perfil')}

                    style={{padding: '8px 16px', border: 'none', borderRadius: '4px', cursor: 'pointer'}}

                >

                    Perfil

                </button>

                <button

                    type="button"

                    className={acessoSubTab === 'agenda' ? 'btnblue' : 'btnyellow'}

                    onClick={() => setAcessoSubTab('agenda')}

                    style={{padding: '8px 16px', border: 'none', borderRadius: '4px', cursor: 'pointer'}}

                >

                    Agenda

                </button>

            </div>



            {acessoSubTab === 'unidade' && (

                <>

                    <div style={sectionTitleStyle}>Acesso ao Sistema</div>

                    <label className="form-field">

                        <span className="form-label">Login *</span>

                        <input className="form-input" value={form.login}

                            onChange={(e) => set('login', e.target.value)}

                            placeholder="Login do usuário" />

                    </label>

                    <label className="form-field">

                        <span className="form-label">Senha</span>

                        <input className="form-input" type="password" value={form.senha}

                            onChange={(e) => set('senha', e.target.value)}

                            placeholder="Senha" />

                    </label>



                    <div style={sectionTitleStyle}>Currículo / Banco de Talentos</div>

                    <label className="form-field">

                        <BooleanField value={curriculo} onChange={setCurriculo} />

                    </label>



                    <div style={sectionTitleStyle}>Unidades</div>

                    <div style={{gridColumn: '1 / -1'}}>

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

                </>

            )}



            {acessoSubTab === 'perfil' && (

                <>

                    <div style={sectionTitleStyle}>Perfis</div>

                    <div style={{gridColumn: '1 / -1'}}>

                        <MasterDetail

                            label="Perfil"

                            source="/api/basico/perfil"

                            valueKey="id"

                            searchKeys={['descricao']}

                            columns={[{key: 'descricao', label: 'Descrição'}]}

                            items={perfis}

                            onChange={setPerfis}

                        />

                    </div>

                </>

            )}

            {acessoSubTab === 'agenda' && (

                <>

                    <div style={sectionTitleStyle}>Agendas</div>

                    <div style={{gridColumn: '1 / -1'}}>

                        <MasterDetail

                            label="Agenda"

                            source={AGENDA_SOURCE}

                            valueKey="id"

                            searchKeys={AGENDA_SEARCH}

                            columns={AGENDA_COLUMNS}

                            items={agendasResolved}

                            onChange={(itens) => setAgendas(itens as unknown as Agenda[])}

                        />

                    </div>

                </>

            )}

        </div>

    );



    const abas = [

        {key: 'pessoal' as const, label: 'Pessoal', content: abaPessoal},

        {key: 'endereco' as const, label: 'Endereço', content: abaEndereco},

        {key: 'contato' as const, label: 'Contato', content: abaContato},

        {key: 'documentos' as const, label: 'Documentos', content: abaDocumentos},

        {key: 'trabalho' as const, label: 'Trabalho', content: abaTrabalho},

        {key: 'acessos' as const, label: 'Acessos', content: abaAcessos},

    ];



    return (

        <PermissionGate permission="READ">

            <main>

                <div className="page-header">

                    <div className="page-header-breadcrumb">

                        <nav className="breadcrumb" aria-label="Breadcrumb">

                            <div className="breadcrumb-group">

                                <span className="breadcrumb-item breadcrumb-current">

                                    Cadastro de Usuário

                                </span>

                            </div>

                        </nav>

                    </div>

                </div>



                {error && <div className="form-erro">{error}</div>}



                <div style={{maxWidth: '900px', margin: '0 auto', padding: '20px'}}>

                    <div style={toggleContainerStyle}>

                        <button

                            type="button"

                            style={toggleBtnStyle(tipoPessoa === 'FISICA')}

                            onClick={() => setTipoPessoa('FISICA')}

                        >

                            Pessoa Física

                        </button>

                        <button

                            type="button"

                            style={toggleBtnStyle(tipoPessoa === 'JURIDICA')}

                            onClick={() => setTipoPessoa('JURIDICA')}

                        >

                            Pessoa Jurídica

                        </button>

                    </div>



                    <Tabs

                        tabs={abas}

                        initial="pessoal"

                    />



                    <div className="form-buttons" style={{marginTop: '16px', display: 'flex', gap: '8px', justifyContent: 'flex-end'}}>

                        <button type="button" className="btnyellow" onClick={voltar} disabled={salvando}>

                            Voltar

                        </button>

                        <button type="button" className="btnstop" onClick={() => void salvar(false)} disabled={salvando}>

                            {salvando ? 'Salvando...' : 'Salvar e Continuar'}

                        </button>

                        <button type="button" className="btnblue" onClick={() => void salvar(true)} disabled={salvando}>

                            {salvando ? 'Salvando...' : 'Salvar'}

                        </button>

                    </div>

                </div>

            </main>

        </PermissionGate>

    );

}

