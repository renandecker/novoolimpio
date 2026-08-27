import {useEffect, useState} from 'react';
import {useNavigate, useSearchParams} from 'react-router-dom';
import {PermissionGate} from '../permissions';
import {FormLayout, FormTabConfig} from '../FormLayout';
import {MasterDetail} from '../MasterDetail';
import type {ApiItem} from '../types';
import {api} from '../api';
import {EnderecoCampos} from '../EnderecoForm';
import type {Endereco} from '../EnderecoForm';
import {
    PERFIL_SOURCE,
    PERFIL_COLUMNS,
    PERFIL_SEARCH,
    UNIDADE_SOURCE,
    UNIDADE_COLUMNS,
    UNIDADE_SEARCH,
    AGENDA_SOURCE,
    AGENDA_COLUMNS,
    AGENDA_SEARCH,
    TURNO_TRABALHO_SOURCE,
    TURNO_TRABALHO_COLUMNS,
    TURNO_TRABALHO_SEARCH,
} from '../masterDetailSources';
import {useQuery} from '@tanstack/react-query';

const GENEROS = [
    {value: '1', label: 'Masculino'},
    {value: '2', label: 'Feminino'},
    {value: '3', label: 'Outro'},
];

const ETNIAS = [
    {value: '1', label: 'Branca'},
    {value: '2', label: 'Preta'},
    {value: '3', label: 'Parda'},
    {value: '4', label: 'Amarela'},
    {value: '5', label: 'Indígena'},
];

const ESTADOS_CIVIS = [
    {value: '1', label: 'Solteiro(a)'},
    {value: '2', label: 'Casado(a)'},
    {value: '3', label: 'Divorciado(a)'},
    {value: '4', label: 'Viúvo(a)'},
    {value: '5', label: 'União Estável'},
];

const ESCOLARIDADES = [
    {value: '1', label: 'Ensino Fundamental Incompleto'},
    {value: '2', label: 'Ensino Fundamental Completo'},
    {value: '3', label: 'Ensino Médio Incompleto'},
    {value: '4', label: 'Ensino Médio Completo'},
    {value: '5', label: 'Superior Incompleto'},
    {value: '6', label: 'Superior Completo'},
    {value: '7', label: 'Pós-Graduação'},
];

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
    const copia = {...(obj ?? {})};
    delete copia.id;
    return copia;
};

const str = (v: unknown): string => (v === null || v === undefined ? '' : String(v));
const num = (v: string): number | null => (v !== '' && !isNaN(Number(v)) ? Number(v) : null);

const usuarioTabs: FormTabConfig[] = [
    {
        key: 'dadosPessoais',
        label: 'Dados Pessoais',
        fields: [
            {name: 'login', label: 'Login', required: true},
            {name: 'senha', label: 'Senha', type: 'mask', mask: '****'},
            {name: 'cpf', label: 'CPF', type: 'mask', mask: '999.999.999-99', required: true},
            {name: 'rg', label: 'RG', required: true},
            {name: 'nome', label: 'Nome', required: true, span: 3},
            {name: 'email', label: 'E-mail', type: 'email', required: true, span: 3},
            {name: 'nomeSocial', label: 'Nome Social', span: 3},
            {name: 'dataNascimento', label: 'Data Nascimento', type: 'date', required: true},
            {name: 'generoId', label: 'Gênero', type: 'select', options: GENEROS},
            {name: 'etniaId', label: 'Etnia', type: 'select', options: ETNIAS},
            {name: 'estadoCivilId', label: 'Estado Civil', type: 'select', options: ESTADOS_CIVIS, required: true},
            {name: 'escolaridadeId', label: 'Escolaridade', type: 'select', options: ESCOLARIDADES, required: true},
            {name: 'nomePai', label: 'Nome do Pai', span: 3},
            {name: 'nomeMae', label: 'Nome da Mãe', required: true, span: 3},
        ],
    },
    {
        key: 'contato',
        label: 'Contato',
        fields: [
            {name: 'telefoneResidencial', label: 'Telefone Residencial', type: 'mask', mask: '(99) 9999-9999'},
            {name: 'celular', label: 'Celular', type: 'mask', mask: '(99) 99999-9999'},
            {name: 'nomeReferencia', label: 'Nome Referência', required: true, span: 3},
            {name: 'telefoneReferencia', label: 'Telefone Referência', type: 'mask', mask: '(99) 9999-9999', required: true},
            {name: 'celularReferencia', label: 'Celular Referência', type: 'mask', mask: '(99) 99999-9999', required: true},
            {name: 'nomeReferencia2', label: 'Nome Referência 2', span: 3},
            {name: 'telefoneReferencia2', label: 'Telefone Referência 2', type: 'mask', mask: '(99) 9999-9999'},
            {name: 'celularReferencia2', label: 'Celular Referência 2', type: 'mask', mask: '(99) 99999-9999'},
        ],
    },
];

export default function ViewUsuarioFormUsuarioListScreen() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const idParam = searchParams.get('id');

    const [ativo, setAtivo] = useState(true);
    const [relatorio, setRelatorio] = useState(false);
    const [mensalista, setMensalista] = useState<'M' | 'H'>('M');
    const [perfis, setPerfis] = useState<ApiItem[]>([]);
    const [agendas, setAgendas] = useState<ApiItem[]>([]);
    const [unidadesAcesso, setUnidadesAcesso] = useState<ApiItem[]>([]);
    const [turnos, setTurnos] = useState<ApiItem[]>([]);
    const [salvando, setSalvando] = useState(false);
    const [error, setError] = useState<string | undefined>();

    const [usuarioId, setUsuarioId] = useState<number | undefined>();
    const [usuarioOriginal, setUsuarioOriginal] = useState<Record<string, unknown> | null>(null);
    const [pfId, setPfId] = useState<number | undefined>();
    const [pessoaId, setPessoaId] = useState<number | undefined>();
    const [pfOriginal, setPfOriginal] = useState<Record<string, unknown> | null>(null);
    const [pessoaOriginal, setPessoaOriginal] = useState<Record<string, unknown> | null>(null);
    const [initialValues, setInitialValues] = useState<Record<string, unknown>>({});
    const [enderecos, setEnderecos] = useState<Endereco[]>([]);

    const {data: allUnidades = []} = useQuery({
        queryKey: [UNIDADE_SOURCE],
        queryFn: async () => (await api.get<ApiItem[]>(UNIDADE_SOURCE)).data,
    });
    const {data: allPerfis = []} = useQuery({
        queryKey: [PERFIL_SOURCE],
        queryFn: async () => (await api.get<ApiItem[]>(PERFIL_SOURCE)).data,
    });
    const {data: allAgendas = []} = useQuery({
        queryKey: [AGENDA_SOURCE],
        queryFn: async () => (await api.get<ApiItem[]>(AGENDA_SOURCE)).data,
    });
    const {data: allTurnos = []} = useQuery({
        queryKey: [TURNO_TRABALHO_SOURCE],
        queryFn: async () => (await api.get<ApiItem[]>(TURNO_TRABALHO_SOURCE)).data,
    });

    useEffect(() => {
        if (!idParam) return;
        let ativoReq = true;
        (async () => {
            try {
                const usu = (await api.get<Record<string, unknown>>(`/api/basico/usuario/${idParam}`)).data;
                let pes: Record<string, unknown> | null = null;
                let pf: Record<string, unknown> | null = null;
                if (usu.pessoaId) {
                    pes = (await api.get<Record<string, unknown>>(`/api/basico/pessoa/${usu.pessoaId}`)).data;
                    if (pes?.id) {
                        pf = (await api.get<Record<string, unknown>>(`/api/basico/pessoa-fisica/por-pessoa/${pes.id}`)).data;
                    }
                }
                if (!ativoReq) return;
                setUsuarioId(usu.id as number);
                setUsuarioOriginal(usu);
                setAtivo(usu.ativo !== false);
                setPessoaId(pes?.id as number | undefined);
                setPessoaOriginal(pes);
                setPfId(pf?.id as number | undefined);
                setPfOriginal(pf);
                setInitialValues({
                    login: str(usu.login),
                    senha: '',
                    cpf: str(pf?.cpf),
                    rg: str(pf?.rg),
                    nome: str(pf?.nome),
                    email: str(pes?.email),
                    nomeSocial: str(pf?.nomeSocial),
                    dataNascimento: toDateInput(pf?.dataNascimento),
                    generoId: pf?.generoId !== null && pf?.generoId !== undefined ? String(pf.generoId) : '',
                    etniaId: pf?.etniaId !== null && pf?.etniaId !== undefined ? String(pf.etniaId) : '',
                    estadoCivilId: pf?.estadoCivilId !== null && pf?.estadoCivilId !== undefined ? String(pf.estadoCivilId) : '',
                    escolaridadeId: pf?.escolaridadeId !== null && pf?.escolaridadeId !== undefined ? String(pf.escolaridadeId) : '',
                    nomePai: str(pf?.nomePai),
                    nomeMae: str(pf?.nomeMae),
                    telefoneResidencial: str(pes?.telefone),
                    celular: str(pes?.celular),
                    nomeReferencia: str(pf?.nomeReferencia),
                    telefoneReferencia: str(pf?.telefoneReferencia),
                    celularReferencia: str(pf?.celularReferencia),
                    nomeReferencia2: str(pf?.nomeReferencia2),
                    telefoneReferencia2: str(pf?.telefoneReferencia2),
                    celularReferencia2: str(pf?.celularReferencia2),
                });

                if (pes) {
                    const enderecosCarregados: Endereco[] = [];
                    const cep = str(pes.cep);
                    const complemento = str(pes.complemento);
                    const numero = str(pes.numero);
                    const idLogradouro = (pes.id_logradouro ?? pes.logradouroId) as number | null | undefined;

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

                if (usu.perfis) {
                    const perfisIds = new Set((usu.perfis as any[]).map((p: any) => String(p.id)));
                    setPerfis(allPerfis.filter(p => perfisIds.has(String(p.id))));
                }
                if (usu.agendas) {
                    const agendasIds = new Set((usu.agendas as any[]).map((a: any) => String(a.id)));
                    setAgendas(allAgendas.filter(a => agendasIds.has(String(a.id))));
                }
                if (usu.unidades) {
                    const unidadesIds = new Set((usu.unidades as any[]).map((u: any) => String(u.id)));
                    setUnidadesAcesso(allUnidades.filter(u => unidadesIds.has(String(u.id))));
                }
            } catch (erro) {
                console.error('Erro ao carregar usuário:', erro);
                alert('Erro ao carregar registro.');
            }
        })();
        return () => { ativoReq = false; };
    }, [idParam, allUnidades, allPerfis, allAgendas]);

    const voltar = () => navigate('/view/usuario/listUsuario');

    const salvar = async (voltarDepois: boolean) => {
        const vals = initialValues;
        if (!vals.login || !vals.nome || !vals.cpf) {
            setError('Informe Login, Nome e CPF.');
            return;
        }
        setSalvando(true);
        setError(undefined);
        try {
            const usuBody: Record<string, unknown> = {
                ...semId(usuarioOriginal),
                login: vals.login,
                senha: vals.senha || null,
                ativo,
                relatorio,
                mensalista,
                pessoaId: pessoaId || null,
            };
            const respostaUsu = usuarioId
                ? await api.put(`/api/basico/usuario/${usuarioId}`, usuBody)
                : await api.post('/api/basico/usuario', usuBody);
            const novoUsuId = (respostaUsu.data as Record<string, unknown>)?.id ?? usuarioId;

            const pfBody: Record<string, unknown> = {
                ...semId(pfOriginal),
                nome: vals.nome,
                cpf: vals.cpf,
                rg: vals.rg,
                nomeSocial: vals.nomeSocial || null,
                dataNascimento: vals.dataNascimento || null,
                generoId: num(vals.generoId as string),
                etniaId: num(vals.etniaId as string),
                estadoCivilId: num(vals.estadoCivilId as string),
                escolaridadeId: num(vals.escolaridadeId as string),
                nomePai: vals.nomePai || null,
                nomeMae: vals.nomeMae || null,
                nomeReferencia: vals.nomeReferencia || null,
                telefoneReferencia: vals.telefoneReferencia || null,
                celularReferencia: vals.celularReferencia || null,
                nomeReferencia2: vals.nomeReferencia2 || null,
                telefoneReferencia2: vals.telefoneReferencia2 || null,
                celularReferencia2: vals.celularReferencia2 || null,
            };
            const respostaPf = pfId
                ? await api.put(`/api/basico/pessoa-fisica/${pfId}`, pfBody)
                : await api.post('/api/basico/pessoa-fisica', pfBody);
            const novoPfId = (respostaPf.data as Record<string, unknown>)?.id ?? pfId;

            const pessoaBody: Record<string, unknown> = {
                ...semId(pessoaOriginal),
                email: vals.email || null,
                telefone: vals.telefoneResidencial || null,
                celular: vals.celular || null,
                cep: enderecos[0]?.cep || null,
                numero: enderecos[0]?.numero || null,
                complemento: enderecos[0]?.complemento || null,
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

            if (novoUsuId) {
                await api.put(`/api/basico/usuario/${novoUsuId}/perfis`, perfis.map(p => p.id));
                await api.put(`/api/basico/usuario/${novoUsuId}/agendas`, agendas.map(a => a.id));
                await api.put(`/api/basico/usuario/${novoUsuId}/unidades`, unidadesAcesso.map(u => u.id));
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

    const extraTabs = [
        {
            key: 'pessoal',
            label: 'Pessoal',
            content: (
                <div className="form-grid">
                    <label className="form-field">
                        <span className="form-label">CPF *</span>
                        <input className="form-input" placeholder="999.999.999-99" value={initialValues.cpf ?? ''}
                               onChange={(e) => setInitialValues({...initialValues, cpf: e.target.value})}/>
                    </label>
                    <label className="form-field">
                        <span className="form-label">RG *</span>
                        <input className="form-input" placeholder="RG" value={initialValues.rg ?? ''}
                               onChange={(e) => setInitialValues({...initialValues, rg: e.target.value})}/>
                    </label>
                    <label className="form-field">
                        <span className="form-label">Nome *</span>
                        <input className="form-input" placeholder="Nome completo" style={{gridColumn: 'span 3'}}
                               value={initialValues.nome ?? ''} onChange={(e) => setInitialValues({...initialValues, nome: e.target.value})}/>
                    </label>
                    <label className="form-field">
                        <span className="form-label">E-mail *</span>
                        <input className="form-input" type="email" placeholder="E-mail"
                               style={{gridColumn: 'span 3'}} value={initialValues.email ?? ''}
                               onChange={(e) => setInitialValues({...initialValues, email: e.target.value})}/>
                    </label>
                    <label className="form-field">
                        <span className="form-label">Nome Social</span>
                        <input className="form-input" placeholder="Nome social" style={{gridColumn: 'span 3'}}
                               value={initialValues.nomeSocial ?? ''} onChange={(e) => setInitialValues({...initialValues, nomeSocial: e.target.value})}/>
                    </label>
                    <label className="form-field">
                        <span className="form-label">Data Nascimento *</span>
                        <input className="form-input" type="date" value={initialValues.dataNascimento ?? ''}
                               onChange={(e) => setInitialValues({...initialValues, dataNascimento: e.target.value})}/>
                    </label>
                    <label className="form-field">
                        <span className="form-label">Nome do Pai</span>
                        <input className="form-input" placeholder="Nome do pai" style={{gridColumn: 'span 3'}}
                               value={initialValues.nomePai ?? ''} onChange={(e) => setInitialValues({...initialValues, nomePai: e.target.value})}/>
                    </label>
                    <label className="form-field">
                        <span className="form-label">Nome da Mãe *</span>
                        <input className="form-input" placeholder="Nome da mãe" style={{gridColumn: 'span 3'}}
                               value={initialValues.nomeMae ?? ''} onChange={(e) => setInitialValues({...initialValues, nomeMae: e.target.value})}/>
                    </label>
                    <label className="form-field">
                        <span className="form-label">Telefone Residencial *</span>
                        <input className="form-input" placeholder="(99) 9999-9999"
                               value={initialValues.telefoneResidencial ?? ''} onChange={(e) => setInitialValues({...initialValues, telefoneResidencial: e.target.value})}/>
                    </label>
                    <label className="form-field">
                        <span className="form-label">Celular *</span>
                        <input className="form-input" placeholder="(99) 99999-9999" value={initialValues.celular ?? ''}
                               onChange={(e) => setInitialValues({...initialValues, celular: e.target.value})}/>
                    </label>
                    <label className="form-field">
                        <span className="form-label">Nome Referência *</span>
                        <input className="form-input" placeholder="Nome da referência"
                               style={{gridColumn: 'span 3'}} value={initialValues.nomeReferencia ?? ''}
                               onChange={(e) => setInitialValues({...initialValues, nomeReferencia: e.target.value})}/>
                    </label>
                    <label className="form-field">
                        <span className="form-label">Telefone Referência</span>
                        <input className="form-input" placeholder="(99) 9999-9999"
                               value={initialValues.telefoneReferencia ?? ''} onChange={(e) => setInitialValues({...initialValues, telefoneReferencia: e.target.value})}/>
                    </label>
                    <label className="form-field">
                        <span className="form-label">Celular Referência</span>
                        <input className="form-input" placeholder="(99) 99999-9999"
                               value={initialValues.celularReferencia ?? ''} onChange={(e) => setInitialValues({...initialValues, celularReferencia: e.target.value})}/>
                    </label>
                    <label className="form-field">
                        <span className="form-label">Nome Referência 2</span>
                        <input className="form-input" placeholder="Nome da referência 2"
                               style={{gridColumn: 'span 3'}} value={initialValues.nomeReferencia2 ?? ''}
                               onChange={(e) => setInitialValues({...initialValues, nomeReferencia2: e.target.value})}/>
                    </label>
                    <label className="form-field">
                        <span className="form-label">Telefone Referência 2</span>
                        <input className="form-input" placeholder="(99) 9999-9999"
                               value={initialValues.telefoneReferencia2 ?? ''} onChange={(e) => setInitialValues({...initialValues, telefoneReferencia2: e.target.value})}/>
                    </label>
                    <label className="form-field">
                        <span className="form-label">Celular Referência 2</span>
                        <input className="form-input" placeholder="(99) 99999-9999"
                               value={initialValues.celularReferencia2 ?? ''} onChange={(e) => setInitialValues({...initialValues, celularReferencia2: e.target.value})}/>
                    </label>
                    <label className="form-field">
                        <span className="form-label">Sexo *</span>
                        <select className="form-input form-select" value={initialValues.generoId ?? ''}
                                onChange={(e) => setInitialValues({...initialValues, generoId: e.target.value})}>
                            <option value="">-- Selecione --</option>
                            <option value="1">Masculino</option>
                            <option value="2">Feminino</option>
                            <option value="3">Outro</option>
                        </select>
                    </label>
                    <label className="form-field">
                        <span className="form-label">Etnia</span>
                        <select className="form-input form-select" value={initialValues.etniaId ?? ''}
                                onChange={(e) => setInitialValues({...initialValues, etniaId: e.target.value})}>
                            <option value="">-- Selecione --</option>
                            <option value="1">Branca</option>
                            <option value="2">Preta</option>
                            <option value="3">Parda</option>
                            <option value="4">Amarela</option>
                            <option value="5">Indígena</option>
                        </select>
                    </label>
                    <label className="form-field">
                        <span className="form-label">Estado Civil *</span>
                        <select className="form-input form-select" value={initialValues.estadoCivilId ?? ''}
                                onChange={(e) => setInitialValues({...initialValues, estadoCivilId: e.target.value})}>
                            <option value="">-- Selecione --</option>
                            <option value="1">Solteiro(a)</option>
                            <option value="2">Casado(a)</option>
                            <option value="3">Divorciado(a)</option>
                            <option value="4">Viúvo(a)</option>
                            <option value="5">União Estável</option>
                        </select>
                    </label>
                    <label className="form-field">
                        <span className="form-label">Escolaridade *</span>
                        <select className="form-input form-select" value={initialValues.escolaridadeId ?? ''}
                                onChange={(e) => setInitialValues({...initialValues, escolaridadeId: e.target.value})}>
                            <option value="">-- Selecione --</option>
                            <option value="1">Ensino Fundamental Incompleto</option>
                            <option value="2">Ensino Fundamental Completo</option>
                            <option value="3">Ensino Médio Incompleto</option>
                            <option value="4">Ensino Médio Completo</option>
                            <option value="5">Superior Incompleto</option>
                            <option value="6">Superior Completo</option>
                            <option value="7">Pós-Graduação</option>
                        </select>
                    </label>
                </div>
            ),
        },
        {
            key: 'endereco',
            label: 'Endereço',
            content: <EnderecoCampos value={enderecos} onChange={setEnderecos}/>,
        },
        {
            key: 'perfis',
            label: 'Perfis',
            content: (
                <MasterDetail
                    label="Perfil"
                    source={PERFIL_SOURCE}
                    valueKey="id"
                    searchKeys={PERFIL_SEARCH}
                    columns={PERFIL_COLUMNS}
                    items={perfis}
                    onChange={setPerfis}
                />
            ),
        },
        {
            key: 'agendas',
            label: 'Agendas',
            content: (
                <MasterDetail
                    label="Agenda"
                    source={AGENDA_SOURCE}
                    valueKey="id"
                    searchKeys={AGENDA_SEARCH}
                    columns={AGENDA_COLUMNS}
                    items={agendas}
                    onChange={setAgendas}
                />
            ),
        },
        {
            key: 'unidadesAcesso',
            label: 'Unidades de Acesso',
            content: (
                <MasterDetail
                    label="Unidade"
                    source={UNIDADE_SOURCE}
                    valueKey="id"
                    searchKeys={UNIDADE_SEARCH}
                    columns={UNIDADE_COLUMNS}
                    items={unidadesAcesso}
                    onChange={setUnidadesAcesso}
                />
            ),
        },
    ];

    return (
        <PermissionGate permission="READ">
            <main>
                <FormLayout
                    title="Usuário"
                    tabs={usuarioTabs}
                    initialValues={initialValues}
                    onSubmit={(vals) => {
                        setInitialValues(vals);
                        salvar(false);
                    }}
                    onCancel={voltar}
                    submitLabel="Salvar"
                    cancelLabel="Voltar"
                    saving={salvando}
                    error={error}
                >
                    <div style={{marginTop: '20px'}}>
                    </div>
                </FormLayout>
            </main>
        </PermissionGate>
    );
}