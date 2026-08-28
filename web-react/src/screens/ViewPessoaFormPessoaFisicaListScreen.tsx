import {useEffect, useState} from 'react';
import {useNavigate, useSearchParams} from 'react-router-dom';
import {PermissionGate} from '../permissions';
import {FormLayout, FormTabConfig} from '../FormLayout';
import {MasterDetail} from '../MasterDetail';
import {BooleanField} from '../BooleanField';
import type {ApiItem} from '../types';
import {api} from '../api';
import {UNIDADE_SOURCE, UNIDADE_COLUMNS, UNIDADE_SEARCH} from '../masterDetailSources';
import {EnderecoCampos} from '../EnderecoForm';
import type {Endereco} from '../EnderecoForm';
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

// estilo para campos que ocupam largura total (label 160px + input 1fr) ocupando toda a linha do grid
const fullRow: React.CSSProperties = {
    display: 'grid',
    gridColumn: '1 / -1',
    gridTemplateColumns: '160px 1fr',
    gap: '14px',
    alignItems: 'center',
};
const fullRowTop: React.CSSProperties = {
    display: 'grid',
    gridColumn: '1 / -1',
    gridTemplateColumns: '160px 1fr',
    gap: '14px',
    alignItems: 'start',
};

export default function ViewPessoaFormPessoaFisicaListScreen() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const idParam = searchParams.get('id');

const [pfId, setPfId] = useState<number | undefined>();
    const [pessoaId, setPessoaId] = useState<number | undefined>();
    const [pfOriginal, setPfOriginal] = useState<Record<string, unknown> | null>(null);
    const [pessoaOriginal, setPessoaOriginal] = useState<Record<string, unknown> | null>(null);
    const [unidades, setUnidades] = useState<ApiItem[]>([]);
    const [curriculo, setCurriculo] = useState(false);
    const [enderecos, setEnderecos] = useState<Endereco[]>([]);
    const [salvando, setSalvando] = useState(false);
    const [error, setError] = useState<string | undefined>();
    const [initialValues, setInitialValues] = useState<Record<string, unknown>>({});

    const tabs: FormTabConfig[] = [
        {
            key: 'identificacao',
            label: 'Identificação',
            content: (
                <div className="form-grid">
                    <label className="form-field">
                        <span className="form-label">CPF *</span>
                        <input className="form-input" placeholder="999.999.999-99" value={str(initialValues.cpf)}
                               onChange={(e) => setInitialValues(prev => ({...prev, cpf: e.target.value}))}/>
                    </label>
                    <label className="form-field">
                        <span className="form-label">RG *</span>
                        <input className="form-input" placeholder="RG" value={str(initialValues.rg)}
                               onChange={(e) => setInitialValues(prev => ({...prev, rg: e.target.value}))}/>
                    </label>
                    <label className="form-field" style={fullRow}>
                        <span className="form-label">Nome *</span>
                        <input className="form-input" placeholder="Nome completo" value={str(initialValues.nome)}
                               onChange={(e) => setInitialValues(prev => ({...prev, nome: e.target.value}))}/>
                    </label>
                    <label className="form-field" style={fullRow}>
                        <span className="form-label">E-mail *</span>
                        <input className="form-input" type="email" placeholder="E-mail" value={str(initialValues.email)}
                               onChange={(e) => setInitialValues(prev => ({...prev, email: e.target.value}))}/>
                    </label>
                </div>
            ),
        },
        {
            key: 'informacoesBasicas',
            label: 'Informações Básicas',
            content: (
                <div className="form-grid">
                    <label className="form-field" style={fullRow}>
                        <span className="form-label">Nome Social *</span>
                        <input className="form-input" placeholder="Nome social" value={str(initialValues.nomeSocial)}
                               onChange={(e) => setInitialValues(prev => ({...prev, nomeSocial: e.target.value}))}/>
                    </label>
                    <label className="form-field">
                        <span className="form-label">Data Nascimento *</span>
                        <input className="form-input" type="date" value={str(initialValues.dataNascimento)}
                               onChange={(e) => setInitialValues(prev => ({...prev, dataNascimento: e.target.value}))}/>
                    </label>
                    <label className="form-field" style={fullRow}>
                        <span className="form-label">Cidade Origem *</span>
                        <input className="form-input" placeholder="Cidade de origem" value={str(initialValues.cidadeOrigem)}
                               onChange={(e) => setInitialValues(prev => ({...prev, cidadeOrigem: e.target.value}))}/>
                    </label>
                    <label className="form-field">
                        <span className="form-label">Gênero</span>
                        <select className="form-input form-select" value={str(initialValues.generoId)}
                                onChange={(e) => setInitialValues(prev => ({...prev, generoId: e.target.value}))}>
                            <option value="">-- Selecione --</option>
                            <option value="1">Masculino</option>
                            <option value="2">Feminino</option>
                            <option value="3">Outro</option>
                        </select>
                    </label>
                    <label className="form-field">
                        <span className="form-label">Etnia</span>
                        <select className="form-input form-select" value={str(initialValues.etniaId)}
                                onChange={(e) => setInitialValues(prev => ({...prev, etniaId: e.target.value}))}>
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
                        <select className="form-input form-select" value={str(initialValues.estadoCivilId)}
                                onChange={(e) => setInitialValues(prev => ({...prev, estadoCivilId: e.target.value}))}>
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
                        <select className="form-input form-select" value={str(initialValues.escolaridadeId)}
                                onChange={(e) => setInitialValues(prev => ({...prev, escolaridadeId: e.target.value}))}>
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
                    <label className="form-field" style={fullRow}>
                        <span className="form-label">Nome Referência *</span>
                        <input className="form-input" placeholder="Nome da referência" value={str(initialValues.nomeReferencia)}
                               onChange={(e) => setInitialValues(prev => ({...prev, nomeReferencia: e.target.value}))}/>
                    </label>
                    <label className="form-field">
                        <span className="form-label">Telefone Referência *</span>
                        <input className="form-input" placeholder="(99) 9999-9999" value={str(initialValues.telefoneReferencia)}
                               onChange={(e) => setInitialValues(prev => ({...prev, telefoneReferencia: e.target.value}))}/>
                    </label>
                    <label className="form-field">
                        <span className="form-label">Celular Referência *</span>
                        <input className="form-input" placeholder="(99) 99999-9999" value={str(initialValues.celularReferencia)}
                               onChange={(e) => setInitialValues(prev => ({...prev, celularReferencia: e.target.value}))}/>
                    </label>
                    <label className="form-field" style={fullRow}>
                        <span className="form-label">Nome Referência 2</span>
                        <input className="form-input" placeholder="Nome da referência 2" value={str(initialValues.nomeReferencia2)}
                               onChange={(e) => setInitialValues(prev => ({...prev, nomeReferencia2: e.target.value}))}/>
                    </label>
                    <label className="form-field">
                        <span className="form-label">Telefone Referência 2</span>
                        <input className="form-input" placeholder="(99) 9999-9999" value={str(initialValues.telefoneReferencia2)}
                               onChange={(e) => setInitialValues(prev => ({...prev, telefoneReferencia2: e.target.value}))}/>
                    </label>
                    <label className="form-field">
                        <span className="form-label">Celular Referência 2</span>
                        <input className="form-input" placeholder="(99) 99999-9999" value={str(initialValues.celularReferencia2)}
                               onChange={(e) => setInitialValues(prev => ({...prev, celularReferencia2: e.target.value}))}/>
                    </label>
                    <label className="form-field" style={fullRow}>
                        <span className="form-label">Nome do Pai</span>
                        <input className="form-input" placeholder="Nome do pai" value={str(initialValues.nomePai)}
                               onChange={(e) => setInitialValues(prev => ({...prev, nomePai: e.target.value}))}/>
                    </label>
                    <label className="form-field" style={fullRow}>
                        <span className="form-label">Nome da Mãe *</span>
                        <input className="form-input" placeholder="Nome da mãe" value={str(initialValues.nomeMae)}
                               onChange={(e) => setInitialValues(prev => ({...prev, nomeMae: e.target.value}))}/>
                    </label>
                    <label className="form-field" style={fullRow}>
                        <span className="form-label">Foto</span>
                        <div style={{display: 'flex', gap: '8px', alignItems: 'center'}}>
                            <input type="file" accept="image/*" className="form-input" style={{flex: 1}}/>
                            <button type="button" className="btnblue">Capturar Foto</button>
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
                        <span className="form-label">Telefone Residencial *</span>
                        <input className="form-input" placeholder="(99) 9999-9999" value={str(initialValues.telefoneResidencial)}
                               onChange={(e) => setInitialValues(prev => ({...prev, telefoneResidencial: e.target.value}))}/>
                    </label>
                    <label className="form-field">
                        <span className="form-label">Telefone Comercial</span>
                        <input className="form-input" placeholder="(99) 9999-9999" value={str(initialValues.telefoneComercial)}
                               onChange={(e) => setInitialValues(prev => ({...prev, telefoneComercial: e.target.value}))}/>
                    </label>
                    <label className="form-field">
                        <span className="form-label">Celular *</span>
                        <input className="form-input" placeholder="(99) 99999-9999" value={str(initialValues.celular)}
                               onChange={(e) => setInitialValues(prev => ({...prev, celular: e.target.value}))}/>
                    </label>
                    <label className="form-field" style={fullRow}>
                        <span className="form-label">Facebook</span>
                        <input className="form-input" placeholder="facebook.com/usuario" value={str(initialValues.facebook)}
                               onChange={(e) => setInitialValues(prev => ({...prev, facebook: e.target.value}))}/>
                    </label>
                    <label className="form-field" style={fullRow}>
                        <span className="form-label">Twitter</span>
                        <input className="form-input" placeholder="@usuario" value={str(initialValues.twitter)}
                               onChange={(e) => setInitialValues(prev => ({...prev, twitter: e.target.value}))}/>
                    </label>
                    <label className="form-field" style={fullRow}>
                        <span className="form-label">Google+</span>
                        <input className="form-input" placeholder="plus.google.com/usuario" value={str(initialValues.googlePlus)}
                               onChange={(e) => setInitialValues(prev => ({...prev, googlePlus: e.target.value}))}/>
                    </label>
                    <label className="form-field" style={fullRow}>
                        <span className="form-label">Telegram</span>
                        <input className="form-input" placeholder="@usuario" value={str(initialValues.telegram)}
                               onChange={(e) => setInitialValues(prev => ({...prev, telegram: e.target.value}))}/>
                    </label>
                </div>
            ),
        },
        {
            key: 'endereco',
            label: 'Endereço',
            content: (
                <div className="form-grid">
                    <EnderecoCampos value={enderecos} onChange={setEnderecos}/>
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
                        <BooleanField value={curriculo} onChange={setCurriculo}/>
                    </label>
                    <label className="form-field" style={fullRowTop}>
                        <span className="form-label">Observação</span>
                        <textarea className="form-input" placeholder="Observações" rows={5}
                                  style={{width: '100%', minHeight: '100px'}} value={initialValues.observacao !== undefined ? String(initialValues.observacao) : ''}
                                  onChange={(e) => setInitialValues(prev => ({...prev, observacao: e.target.value}))}/>
                    </label>
                </div>
            ),
        },
    ];

    const {data: allUnidades = []} = useQuery({
        queryKey: [UNIDADE_SOURCE],
        queryFn: async () => (await api.get<ApiItem[]>(UNIDADE_SOURCE)).data,
    });

    useEffect(() => {
        if (!idParam) return;
        let ativo = true;
        (async () => {
            try {
                const pf = (await api.get<Record<string, unknown>>(`/api/basico/pessoa-fisica/${idParam}`)).data;
                let pes: Record<string, unknown> | null = null;
                if (pf.pessoaId) {
                    pes = (await api.get<Record<string, unknown>>(`/api/basico/pessoa/${pf.pessoaId}`)).data;
                }
                if (!ativo) return;
                setPfId(pf.id as number);
                setPfOriginal(pf);
                setPessoaId(pes?.id as number | undefined);
                setPessoaOriginal(pes);

                setInitialValues({
                    cpf: str(pf.cpf),
                    rg: str(pf.rg),
                    nome: str(pf.nome),
                    email: str(pes?.email),
                    nomeSocial: str(pf.nomeSocial),
                    dataNascimento: toDateInput(pf.dataNascimento),
                    cidadeOrigem: str(pf.cidadeOrigem),
                    generoId: pf.generoId !== null && pf.generoId !== undefined ? String(pf.generoId) : '',
                    etniaId: pf.etniaId !== null && pf.etniaId !== undefined ? String(pf.etniaId) : '',
                    estadoCivilId: pf.estadoCivilId !== null && pf.estadoCivilId !== undefined ? String(pf.estadoCivilId) : '',
                    escolaridadeId: pf.escolaridadeId !== null && pf.escolaridadeId !== undefined ? String(pf.escolaridadeId) : '',
                    nomeReferencia: str(pf.nomeReferencia),
                    telefoneReferencia: str(pf.telefoneReferencia),
                    celularReferencia: str(pf.celularReferencia),
                    nomeReferencia2: str(pf.nomeReferencia2),
                    telefoneReferencia2: str(pf.telefoneReferencia2),
                    celularReferencia2: str(pf.celularReferencia2),
                    nomePai: str(pf.nomePai),
                    nomeMae: str(pf.nomeMae),
                    telefoneResidencial: str(pes?.telefone),
                    telefoneComercial: str(pf.telefoneComercial),
                    celular: str(pes?.celular),
                    facebook: str(pf.facebook),
                    twitter: str(pf.twitter),
                    googlePlus: str(pf.googlePlus),
                    telegram: str(pf.telegram),
                    observacao: str(pes?.observacao),
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
            } catch (erro) {
                console.error('Erro ao carregar pessoa física:', erro);
                alert('Erro ao carregar registro.');
            }
        })();
        return () => {
            ativo = false;
        };
    }, [idParam, allUnidades]);

    const voltar = () => navigate('/view/pessoa/listPessoaFisica');

    const salvar = async (voltarDepois: boolean) => {
        const vals = initialValues;
        if (!vals.nome || !vals.cpf) {
            setError('Informe pelo menos Nome e CPF.');
            return;
        }
        setSalvando(true);
        setError(undefined);
        try {
            const enderecoPrincipal = enderecos[0];
            const pfBody: Record<string, unknown> = {
                ...semId(pfOriginal),
                nome: vals.nome,
                cpf: vals.cpf,
                rg: vals.rg,
                nomeSocial: vals.nomeSocial || null,
                dataNascimento: vals.dataNascimento || null,
                cidadeOrigem: vals.cidadeOrigem || null,
                generoId: num(vals.generoId as string),
                etniaId: num(vals.etniaId as string),
                estadoCivilId: num(vals.estadoCivilId as string),
                escolaridadeId: num(vals.escolaridadeId as string),
                nomeReferencia: vals.nomeReferencia || null,
                telefoneReferencia: vals.telefoneReferencia || null,
                celularReferencia: vals.celularReferencia || null,
                nomeReferencia2: vals.nomeReferencia2 || null,
                telefoneReferencia2: vals.telefoneReferencia2 || null,
                celularReferencia2: vals.celularReferencia2 || null,
                nomePai: vals.nomePai || null,
                nomeMae: vals.nomeMae || null,
                telefoneComercial: vals.telefoneComercial || null,
                facebook: vals.facebook || null,
                twitter: vals.twitter || null,
                googlePlus: vals.googlePlus || null,
            };
            delete pfBody.telegram;
            const respostaPf = pfId
                ? await api.put(`/api/basico/pessoa-fisica/${pfId}`, pfBody)
                : await api.post('/api/basico/pessoa-fisica', pfBody);
            const novoPfId = (respostaPf.data as Record<string, unknown>)?.id ?? pfId;

            const pessoaBody: Record<string, unknown> = {
                ...semId(pessoaOriginal),
                email: vals.email || null,
                telefone: vals.telefoneResidencial || null,
                celular: vals.celular || null,
                observacao: vals.observacao || null,
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

    return (
        <PermissionGate permission="READ">
            <main>
                <FormLayout
                    title="Pessoa Física"
                    tabs={tabs}
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
                />
            </main>
        </PermissionGate>
    );
}
