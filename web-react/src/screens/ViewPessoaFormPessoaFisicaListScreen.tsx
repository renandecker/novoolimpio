import {useEffect, useState} from 'react';
import {useNavigate, useSearchParams} from 'react-router-dom';
import {PermissionGate} from '../permissions';
import {FormLayout, FormTabConfig} from '../FormLayout';
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

    const tabs: FormTabConfig[] = [
    {
        key: 'identificacao',
        label: 'Identificação',
        fields: [
            {name: 'cpf', label: 'CPF', type: 'mask', mask: '999.999.999-99', required: true},
            {name: 'rg', label: 'RG', required: true},
            {name: 'nome', label: 'Nome', required: true, span: 3},
            {name: 'email', label: 'E-mail', type: 'email', required: true, span: 3},
        ],
    },
    {
        key: 'informacoesBasicas',
        label: 'Informações Básicas',
        fields: [
            {name: 'nomeSocial', label: 'Nome Social', span: 3},
            {name: 'dataNascimento', label: 'Data Nascimento', type: 'date', required: true},
            {name: 'cidadeOrigem', label: 'Cidade Origem', required: true, span: 3},
            {name: 'generoId', label: 'Gênero', type: 'select', options: GENEROS},
            {name: 'etniaId', label: 'Etnia', type: 'select', options: ETNIAS},
            {name: 'estadoCivilId', label: 'Estado Civil', type: 'select', options: ESTADOS_CIVIS, required: true},
            {name: 'escolaridadeId', label: 'Escolaridade', type: 'select', options: ESCOLARIDADES, required: true},
        ],
    },
    {
        key: 'referencias',
        label: 'Referências',
        fields: [
            {name: 'nomeReferencia', label: 'Nome Referência', required: true, span: 3},
            {name: 'telefoneReferencia', label: 'Telefone Referência', type: 'mask', mask: '(99) 9999-9999', required: true},
            {name: 'celularReferencia', label: 'Celular Referência', type: 'mask', mask: '(99) 99999-9999', required: true},
            {name: 'nomeReferencia2', label: 'Nome Referência 2', span: 3},
            {name: 'telefoneReferencia2', label: 'Telefone Referência 2', type: 'mask', mask: '(99) 9999-9999'},
            {name: 'celularReferencia2', label: 'Celular Referência 2', type: 'mask', mask: '(99) 99999-9999'},
            {name: 'nomePai', label: 'Nome do Pai', span: 3},
            {name: 'nomeMae', label: 'Nome da Mãe', required: true, span: 3},
        ],
    },
    {
        key: 'contato',
        label: 'Contato',
        fields: [
            {name: 'telefoneResidencial', label: 'Telefone Residencial', type: 'mask', mask: '(99) 9999-9999'},
            {name: 'telefoneComercial', label: 'Telefone Comercial', type: 'mask', mask: '(99) 9999-9999'},
            {name: 'celular', label: 'Celular', type: 'mask', mask: '(99) 99999-9999'},
            {name: 'facebook', label: 'Facebook', span: 3},
            {name: 'twitter', label: 'Twitter', span: 3},
            {name: 'googlePlus', label: 'Google+', span: 3},
            {name: 'telegram', label: 'Telegram', span: 3},
            {name: 'observacao', label: 'Observação', type: 'textarea', span: 4},
        ],
    },
    {
        key: 'endereco',
        label: 'Endereço',
        content: <EnderecoCampos value={enderecos} onChange={setEnderecos}/>,
    },
    ];

export default function ViewPessoaFormPessoaFisicaListScreen() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const idParam = searchParams.get('id');

    const [pfId, setPfId] = useState<number | undefined>();
    const [pessoaId, setPessoaId] = useState<number | undefined>();
    const [pfOriginal, setPfOriginal] = useState<Record<string, unknown> | null>(null);
    const [pessoaOriginal, setPessoaOriginal] = useState<Record<string, unknown> | null>(null);
    const [unidades, setUnidades] = useState<ApiItem[]>([]);
    const [enderecos, setEnderecos] = useState<Endereco[]>([]);
    const [salvando, setSalvando] = useState(false);
    const [error, setError] = useState<string | undefined>();

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

    const [initialValues, setInitialValues] = useState<Record<string, unknown>>({});

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