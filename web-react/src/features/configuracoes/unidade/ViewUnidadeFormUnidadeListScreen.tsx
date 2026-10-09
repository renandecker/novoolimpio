import {useEffect, useState} from 'react';

import {useNavigate, useSearchParams} from 'react-router-dom';

import {PermissionGate} from '../../../shared/services/permissions';

import {FormLayout, FormTabConfig} from '../../../shared/components/FormLayout';

import {MasterDetail} from '../../../shared/components/MasterDetail';

import type {ApiItem} from '../../../shared/types/types.ts';

import {api} from '../../../shared/services/api';

import {TURNO_TRABALHO_SOURCE, TURNO_TRABALHO_COLUMNS, TURNO_TRABALHO_SEARCH} from '../../../shared/services/masterDetailSources';

import {useQuery} from '@tanstack/react-query';



const TIPO_UNIDADE_OPTIONS = [

    {value: '1', label: 'Matriz'},

    {value: '2', label: 'Filial'},

    {value: '3', label: 'Polo'},

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

const bool = (v: unknown): boolean => v === true || v === 'true';

/** Relações podem chegar como objeto ({id}) ou como id cru; extrai o id. */
const relId = (v: unknown): unknown => (v && typeof v === 'object' ? (v as {id?: unknown}).id : v);



export default function ViewUnidadeFormUnidadeListScreen() {

    const navigate = useNavigate();

    const [searchParams] = useSearchParams();

    const idParam = searchParams.get('id');



    const [unidadeId, setUnidadeId] = useState<number | undefined>();

    const [unidadeOriginal, setUnidadeOriginal] = useState<Record<string, unknown> | null>(null);

    const [telefones, setTelefones] = useState<ApiItem[]>([]);

    const [turnosTrabalho, setTurnosTrabalho] = useState<ApiItem[]>([]);

    const [salvando, setSalvando] = useState(false);

    const [error, setError] = useState<string | undefined>();



    const tabs: FormTabConfig[] = [

        {

            key: 'geral',

            label: 'Geral',

            fields: [

                {name: 'id', label: 'ID', type: 'text', readOnly: true},

                {name: 'sucinto', label: 'Sucinto', required: true},

                {name: 'razaoSocial', label: 'Razão Social', required: true, span: 3},

                {name: 'nomeFantasia', label: 'Nome Fantasia', required: true, span: 3},

                {name: 'CNPJ', label: 'CNPJ', type: 'mask', mask: '99.999.999/9999-99', required: true},

                {name: 'inscricaoEstadual', label: 'Inscrição Estadual', required: true},

                {name: 'email', label: 'E-mail', type: 'email', required: true, span: 3},

                {name: 'emailRH', label: 'E-mail RH', type: 'email', span: 3},

                {name: 'tipoUnidade', label: 'Tipo Unidade', type: 'select', options: TIPO_UNIDADE_OPTIONS, required: true},

                {name: 'ativo', label: 'Ativo', type: 'boolean', booleanLabels: {on: 'Ativo', off: 'Inativo'}},

                {name: 'responsavel', label: 'Responsável', type: 'autoComplete', autoCompleteSource: '/api/basico/pessoa-fisica/auto-complete-acao', span: 3},

                {name: 'diretorEnsino', label: 'Diretor de Ensino', span: 3},

                {name: 'coordenador', label: 'Coordenador', span: 3},

                {name: 'registro', label: 'Registro', span: 3},

                {name: 'layout', label: 'Layout', type: 'autoComplete', autoCompleteSource: '/api/educacao/layout', span: 3},

            ],

        },

        {

            key: 'telefones',

            label: 'Telefones',

            content: (

                <MasterDetail

                    label="Telefone"

                    source="/api/basico/telefone"

                    valueKey="id"

                    searchKeys={['numero', 'ddd']}

                    columns={[

                        {key: 'id', label: 'ID'},

                        {key: 'ddd', label: 'DDD'},

                        {key: 'numero', label: 'Número'},

                        {key: 'tipo', label: 'Tipo'},

                    ]}

                    items={telefones}

                    onChange={setTelefones}

                />

            ),

        },

        {

            key: 'endereco',

            label: 'Endereço',

            fields: [

                {name: 'cep', label: 'CEP', type: 'mask', mask: '99.999-999', required: true},

                {name: 'cidade', label: 'Cidade', type: 'autoComplete', autoCompleteSource: '/api/basico/cidade/opcoes', required: true},

                {name: 'bairro', label: 'Bairro', type: 'autoComplete', autoCompleteSource: '/api/basico/bairro/opcoes', required: true},

                {name: 'logradouro', label: 'Logradouro', type: 'autoComplete', autoCompleteSource: '/api/basico/logradouro/auto-complete-logradouro-troca-opcoes', required: true, span: 3},

                {name: 'numero', label: 'Número', type: 'number', required: true},

                {name: 'regiao', label: 'Região', type: 'autoComplete', autoCompleteSource: '/api/basico/regiao', required: true},

                {name: 'pontoReferencia', label: 'Ponto de Referência', span: 3},

                {name: 'area', label: 'Área', span: 3},

            ],

        },

        {

            key: 'turnoTrabalho',

            label: 'Turno Trabalho',

            fields: [

                {name: 'turnoFuncionario', label: 'Modelo de Turno', type: 'autoComplete', autoCompleteSource: '/api/basico/turno-funcionario', span: 3},

            ],

            content: (

                <MasterDetail

                    label="Turno Trabalho"

                    source={TURNO_TRABALHO_SOURCE}

                    valueKey="id"

                    searchKeys={TURNO_TRABALHO_SEARCH}

                    columns={TURNO_TRABALHO_COLUMNS}

                    items={turnosTrabalho}

                    onChange={setTurnosTrabalho}

                />

            ),

        },

    ];



    const {data: allTurnosFuncionario = []} = useQuery({

        queryKey: ['turnoFuncionario'],

        queryFn: async () => (await api.get<ApiItem[]>('/api/central/turno-funcionario')).data,

    });



    useEffect(() => {

        if (!idParam) return;

        let ativo = true;

        (async () => {

            try {

                const unidade = (await api.get<Record<string, unknown>>(`/api/view/unidade/formUnidade/${idParam}`)).data;

                if (!ativo) return;

                setUnidadeId(unidade.id as number);

                setUnidadeOriginal(unidade);



                setInitialValues({

                    id: str(unidade.id),

                    sucinto: str(unidade.sucinto),

                    razaoSocial: str(unidade.razaoSocial),

                    nomeFantasia: str(unidade.nomeFantasia),

                    CNPJ: str(unidade.CNPJ),

                    inscricaoEstadual: str(unidade.inscricaoEstadual),

                    layout: str(relId(unidade.layout)),

                    responsavel: str(relId(unidade.responsavel)),

                    email: str(unidade.email),

                    tipoUnidade: str(relId(unidade.tipoUnidade)),

                    ativo: bool(unidade.ativo),

                    emailRH: str(unidade.emailRH),

                    diretorEnsino: str(unidade.diretorEnsino),

                    coordenador: str(unidade.coordenador),

                    registro: str(unidade.registro),

                    cep: str(unidade.cep),

                    cidade: str(relId(unidade.cidade)),

                    bairro: str(relId(unidade.bairro)),

                    logradouro: str(relId(unidade.logradouro)),

                    numero: str(unidade.numero),

                    regiao: str(relId(unidade.regiao)),

                    pontoReferencia: str(unidade.pontoReferencia),

                    area: str(unidade.area),

                    turnoFuncionario: str(relId(unidade.turnoFuncionario)),

                });



                if (unidade.telefones && Array.isArray(unidade.telefones)) {

                    setTelefones(unidade.telefones);

                }



                if (unidade.listaTurnosTrabalho && Array.isArray(unidade.listaTurnosTrabalho)) {

                    setTurnosTrabalho(unidade.listaTurnosTrabalho);

                }

            } catch (erro) {

                console.error('Erro ao carregar unidade:', erro);

                alert('Erro ao carregar registro.');

            }

        })();

        return () => {

            ativo = false;

        };

    }, [idParam]);



    const [initialValues, setInitialValues] = useState<Record<string, unknown>>({});



    const voltar = () => navigate('/view/unidade/listUnidade');



    const salvar = async (voltarDepois: boolean) => {

        const vals = initialValues;

        if (!vals.sucinto || !vals.razaoSocial || !vals.nomeFantasia || !vals.CNPJ) {

            setError('Informe pelo menos Sucinto, Razão Social, Nome Fantasia e CNPJ.');

            return;

        }

        setSalvando(true);

        setError(undefined);

        try {

            const unidadeBody: Record<string, unknown> = {

                ...semId(unidadeOriginal),

                sucinto: vals.sucinto,

                razaoSocial: vals.razaoSocial,

                nomeFantasia: vals.nomeFantasia,

                CNPJ: vals.CNPJ,

                inscricaoEstadual: vals.inscricaoEstadual || null,

                layoutId: num(vals.layout as string),

                responsavelId: num(vals.responsavel as string),

                email: vals.email || null,

                tipoUnidadeId: num(vals.tipoUnidade as string),

                ativo: vals.ativo === 'true' || vals.ativo === true,

                emailRH: vals.emailRH || null,

                diretorEnsino: vals.diretorEnsino || null,

                coordenador: vals.coordenador || null,

                registro: vals.registro || null,

                cep: vals.cep || null,

                cidadeId: num(vals.cidade as string),

                bairroId: num(vals.bairro as string),

                logradouroId: num(vals.logradouro as string),

                numero: num(vals.numero as string),

                regiaoId: num(vals.regiao as string),

                pontoReferencia: vals.pontoReferencia || null,

                area: vals.area || null,

                turnoFuncionarioId: num(vals.turnoFuncionario as string),

                telefones: telefones.map(t => ({id: t.id})),

                listaTurnosTrabalho: turnosTrabalho.map(t => ({id: t.id})),

            };

            const resposta = unidadeId

                ? await api.put(`/api/basico/unidade/${unidadeId}`, unidadeBody)

                : await api.post('/api/basico/unidade', unidadeBody);

            const novoId = (resposta.data as Record<string, unknown>)?.id ?? unidadeId;

            if (voltarDepois) {

                voltar();

            } else {

                alert('Registro salvo com sucesso.');

                navigate(`/view/unidade/formUnidade?id=${novoId}`);

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

                    title="Unidade"

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

