import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import {useQuery} from '@tanstack/react-query';
import {api} from '../api';
import {PermissionGate} from '../permissions';
import {AutoComplete, type AutoCompleteOption} from '../AutoComplete';
import {Wizard, useWizardData, type WizardStep} from '../Wizard';
import './MatriculaWizard.css';

type Opcao = {id: number; label: string};

interface PessoaRow {
    id: number;
    nome?: string;
    cpf?: string;
    cnpj?: string;
    nomeFantasia?: string;
    razaoSocial?: string;
    pessoaFisica?: {nome?: string; cpf?: string; dataNascimento?: string; idade?: number; escolaridade?: {id: number; descricao?: string}};
    pessoaJuridica?: {nomeFantasia?: string; cnpj?: string};
}

interface CurriculoRow {
    id: number;
    descricao?: string;
    sucinto?: string;
    sigla?: string;
    cargaHoraria?: number;
    tipoCurso?: {id: number; descricao?: string};
    escolaridade?: {id: number; descricao?: string};
    idadeMinima?: number;
    idadeMaxima?: number;
    possuiRematricula?: boolean;
}

interface UnidadeRow {
    id: number;
    sucinto?: string;
    razaoSocial?: string;
    nomeFantasia?: string;
}

interface OferecimentoGrupoRow {
    id: number;
    unidadeId?: number;
    grupoId?: number;
    grupo?: {id: number; nome?: string};
    unidade?: {id: number; sucinto?: string};
    horario?: string;
    selected?: boolean;
}

interface OferecimentoWrapperRow {
    id: number;
    grupoId?: number;
    componenteCurricularId?: number;
    componenteCurricular?: {id: number; descricao?: string; sucinto?: string; cargaHoraria?: number};
    status?: string;
    unidadeId?: number;
    unidade?: {id: number; sucinto?: string};
    salaId?: number;
    sala?: {id: number; numero?: number};
    professorId?: number;
    professor?: {pessoa?: {pessoaFisica?: {nome?: string}; pessoaJuridica?: {nomeFantasia?: string}}};
    dataInicio?: string;
    dataFim?: string;
    inscritos?: number;
    vagas?: number;
    selected?: boolean;
    disabledComponenteCurricular?: boolean;
    disabledConflitoDia?: boolean;
    disabledRequisito?: boolean;
    motivo?: string;
}

interface FormaPagamentoRow {
    id: number;
    vezes?: number;
    juros?: number;
    desconto?: number;
    multa?: number;
}

interface ParcelaRow {
    parcela: number;
    valor: number;
    dataVencimento: string;
    descricao?: string;
}

interface TaxaRow {
    id: number;
    descricao?: string;
    valor?: number;
}

interface MaterialRow {
    id: number;
    controleEstoqueId?: number;
    controleEstoque?: {
        id: number;
        produto?: {id: number; identificador?: string; valor?: number; imagem?: string};
    };
    quantidadeCurso?: number;
    quantidadeCompra?: number;
    quantidadeEstoque?: number;
    quantidadeSolicitado?: number;
    quantidade?: number;
}

interface MaterialEscolarMatriculaRow {
    controleEstoque?: {
        id: number;
        produto?: {id: number; identificador?: string; valor?: number; imagem?: string};
    };
    quantidadeCurso?: number;
    quantidadeCompra?: number;
    quantidadeEstoque?: number;
    quantidadeSolicitado?: number;
    quantidade?: number;
}

interface VendaProdutoRow {
    tipoFormaPagamento?: string;
    formaPagamentoId?: number;
    parcelas?: ParcelaRow[];
}

interface CriterioRow {
    tipoMatricula?: 'GRUPO' | 'LIVRE';
    qtdTurmaAbertas?: number;
    dataInicio?: string;
    dataFim?: string;
    periodo?: number;
}

interface MatriculaData {
    entity: {
        contratoId?: number;
        pessoaId?: number;
        responsavelId?: number;
        pessoaFisica?: boolean;
        curriculoId?: number;
        unidadeId?: number;
        testemunha1Id?: number;
        testemunha2Id?: number;
        valorCurso?: number;
        formaPagamentoId?: number;
        dataPrimeiraParcela?: string;
        dataParcela?: string;
        taxaCursoId?: number;
        descontoCursoId?: number;
    };
    ofertasSelecionadas: OferecimentoWrapperRow[];
    gruposSelecionados: OferecimentoGrupoRow[];
    materialEscolar: MaterialEscolarMatriculaRow[];
    controleEstoqueList: MaterialRow[];
    valores: {
        formaPagamentoId?: number;
        dataPrimeiraParcela?: string;
        dataParcela?: string;
        parcelas: ParcelaRow[];
        taxas: TaxaRow[];
        bonificacao?: number;
        ajustarParcelas?: boolean;
        valorMinimoParcela?: number;
        valorTotalParcela?: number;
        descontoBolsa?: boolean;
    };
    criterio: CriterioRow | null;
    oferecimentosSelecionado: OferecimentoWrapperRow[];
    tipoMatricula: number;
    maioridade: boolean;
    financeiro: boolean;
    aluno: boolean;
    dados: boolean;
    autorizacaotaxa: boolean;
    autorizacaodesconto: boolean;
    autorizacaoforma: boolean;
    descontoBolsa: boolean;
    verificaMatriculaFinalizada: boolean;
}

const initialData: MatriculaData = {
    entity: {
        pessoaFisica: true,
    },
    ofertasSelecionadas: [],
    gruposSelecionados: [],
    materialEscolar: [],
    controleEstoqueList: [],
    valores: {
        parcelas: [],
        taxas: [],
        ajustarParcelas: false,
        descontoBolsa: false,
    },
    criterio: null,
    oferecimentosSelecionado: [],
    tipoMatricula: 0,
    maioridade: false,
    financeiro: false,
    aluno: false,
    dados: false,
    autorizacaotaxa: true,
    autorizacaodesconto: true,
    autorizacaoforma: true,
    descontoBolsa: false,
    verificaMatriculaFinalizada: false,
};

const TABS = [
    {key: 'tabContrato', label: 'Contrato'},
    {key: 'tabMatricula', label: 'Matrícula'},
    {key: 'tabMaterial', label: 'Material'},
    {key: 'tabValores', label: 'Valores'},
];

const isoDate = (value: unknown): string => {
    if (!value) return '';
    const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(value));
    return match ? `${match[1]}-${match[2]}-${match[3]}` : '';
};

const brDate = (value: string): string => {
    if (!value) return '';
    const [ano, mes, dia] = value.split('-');
    return dia && mes && ano ? `${dia}/${mes}/${ano}` : value;
};

const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('pt-BR', {style: 'currency', currency: 'BRL'}).format(value);
};

const toOptions = (rows: Array<Record<string, unknown>> | undefined, labelKeys: string[]): Opcao[] =>
    (rows ?? []).map((row) => {
        let label = '';
        for (const key of labelKeys) {
            const value = row[key];
            if (value !== null && value !== undefined && String(value).trim() !== '') {
                label = String(value);
                break;
            }
        }
        return {id: Number(row.id), label: label || `#${row.id}`};
    });

export default function ViewMatriculaWizardScreen() {
    const {id} = useParams<{id?: string}>();
    const navigate = useNavigate();
    const emEdicao = !!id;

    const {data, setData, updateField, updateFields} = useWizardData<MatriculaData>(initialData);
    const [activeTab, setActiveTab] = useState(0);
    const [mensagem, setMensagem] = useState<string | null>(null);
    const [erro, setErro] = useState<string | null>(null);
    const [salvando, setSalvando] = useState(false);
    const hidratadoRef = useRef(false);

    const updateEntityField = useCallback(<K extends keyof MatriculaData['entity']>(key: K, value: MatriculaData['entity'][K]) => {
        setData(prev => ({...prev, entity: {...prev.entity, [key]: value}}));
    }, []);

    const updateValoresField = useCallback(<K extends keyof MatriculaData['valores']>(key: K, value: MatriculaData['valores'][K]) => {
        setData(prev => ({...prev, valores: {...prev.valores, [key]: value}}));
    }, []);

    const pessoasQuery = useQuery({
        queryKey: ['matricula-pessoas'],
        queryFn: async () => (await api.get<PessoaRow[]>('/api/view/pessoa-fisica/listPessoaFisica')).data,
    });

    const pessoasJuridicasQuery = useQuery({
        queryKey: ['matricula-pessoas-juridicas'],
        queryFn: async () => (await api.get<PessoaRow[]>('/api/view/pessoa-juridica/listPessoaJuridica')).data,
    });

    const curriculosQuery = useQuery({
        queryKey: ['matricula-curriculos'],
        queryFn: async () => (await api.get<CurriculoRow[]>('/api/view/curriculo/listCurriculo')).data,
    });

    const unidadesQuery = useQuery({
        queryKey: ['matricula-unidades'],
        queryFn: async () => (await api.get<UnidadeRow[]>('/api/view/unidade/listUnidade')).data,
    });

    const formasPagamentoQuery = useQuery({
        queryKey: ['matricula-formas-pagamento'],
        queryFn: async () => (await api.get<FormaPagamentoRow[]>('/api/educacao/forma-pagamento')).data,
    });

    const gruposQuery = useQuery({
        queryKey: ['matricula-grupos', data.entity.unidadeId, data.entity.curriculoId],
        queryFn: async () => {
            if (!data.entity.unidadeId || !data.entity.curriculoId) return [];
            const {data: rows} = await api.get<OferecimentoGrupoRow[]>('/api/educacao/oferecimento-grupo', {
                params: {unidadeId: data.entity.unidadeId, curriculoId: data.entity.curriculoId}
            });
            return rows.data;
        },
        enabled: !!data.entity.unidadeId && !!data.entity.curriculoId,
    });

    const oferecimentosQuery = useQuery({
        queryKey: ['matricula-oferecimentos', data.entity.unidadeId, data.entity.curriculoId],
        queryFn: async () => {
            if (!data.entity.unidadeId || !data.entity.curriculoId) return [];
            const {data: rows} = await api.get<OferecimentoWrapperRow[]>('/api/educacao/oferecimento-componente-curricular', {
                params: {unidadeId: data.entity.unidadeId, curriculoId: data.entity.curriculoId}
            });
            return rows.data;
        },
        enabled: !!data.entity.unidadeId && !!data.entity.curriculoId,
    });

    const controleEstoqueQuery = useQuery({
        queryKey: ['matricula-controle-estoque', data.entity.unidadeId],
        queryFn: async () => {
            if (!data.entity.unidadeId) return [];
            const {data: rows} = await api.get<MaterialRow[]>('/api/estoque/controle-estoque', {
                params: {unidadeId: data.entity.unidadeId}
            });
            return rows.data;
        },
        enabled: !!data.entity.unidadeId,
    });

    const materialEscolarCursoQuery = useQuery({
        queryKey: ['matricula-material-curso', data.entity.curriculoId],
        queryFn: async () => {
            if (!data.entity.curriculoId) return [];
            const {data: rows} = await api.get<MaterialEscolarMatriculaRow[]>('/api/educacao/material-escolar-curso', {
                params: {curriculoId: data.entity.curriculoId}
            });
            return rows.data;
        },
        enabled: !!data.entity.curriculoId,
    });

    const criteriosQuery = useQuery({
        queryKey: ['matricula-criterios', data.entity.unidadeId, data.entity.curriculoId],
        queryFn: async () => {
            if (!data.entity.unidadeId || !data.entity.curriculoId) return null;
            const ids = (await api.get<number[]>('/api/educacao/criterio/buscar-criterio', {
                params: {unidadeId: data.entity.unidadeId, curriculoId: data.entity.curriculoId}
            })).data;
            if (ids && ids.length > 0) {
                const criterio = (await api.get<CriterioRow>(`/api/educacao/criterio/${ids[0]}`)).data;
                return criterio;
            }
            return null;
        },
        enabled: !!data.entity.unidadeId && !!data.entity.curriculoId,
    });

    const fetchPessoaFisica = useCallback(async (query: string): Promise<AutoCompleteOption[]> => {
        if (query.length < 3) return [];
        const {data: rows} = await api.get<Array<Record<string, unknown>>>('/api/view/pessoa-fisica/auto-complete', {params: {q: query, limit: 20}});
        return toOptions(rows, ['nome', 'cpf']);
    }, []);

    const fetchPessoaJuridica = useCallback(async (query: string): Promise<AutoCompleteOption[]> => {
        if (query.length < 3) return [];
        const {data: rows} = await api.get<Array<Record<string, unknown>>>('/api/view/pessoa-juridica/auto-complete', {params: {q: query, limit: 20}});
        return toOptions(rows, ['nomeFantasia', 'cnpj', 'razaoSocial']);
    }, []);

    const buscarParcelas = useCallback(async () => {
        if (!data.entity.formaPagamentoId || !data.entity.valorCurso) return;
        try {
            const {data: parcelas} = await api.get<ParcelaRow[]>('/api/educacao/parcela/calcular', {
                params: {formaPagamentoId: data.entity.formaPagamentoId, valorCurso: data.entity.valorCurso}
            });
            updateValoresField('parcelas', parcelas.data ?? []);
            if (parcelas.data && parcelas.data.length > 0) {
                updateEntityField('dataPrimeiraParcela', isoDate(parcelas.data[0].dataVencimento));
            }
        } catch (e) {
            setErro('Erro ao calcular parcelas');
        }
    }, [data.entity.formaPagamentoId, data.entity.valorCurso, updateValoresField, updateEntityField]);

    useEffect(() => {
        buscarParcelas();
    }, [buscarParcelas]);

    const validateStep = async (targetIndex: number): Promise<boolean> => {
        const current = data;
        setMensagem(null);

        if (targetIndex >= 1) {
            if (!current.entity.pessoaId) { setMensagem('Selecione o aluno'); return false; }
            if (!current.entity.curriculoId) { setMensagem('Selecione o curso'); return false; }
            if (!current.entity.unidadeId) { setMensagem('Selecione a unidade'); return false; }
            if (current.tipoMatricula !== 0) {
                if (!current.entity.responsavelId) { setMensagem('Selecione o contratante'); return false; }
                if (!current.entity.testemunha1Id) { setMensagem('Informe a primeira testemunha'); return false; }
                if (!current.entity.testemunha2Id) { setMensagem('Informe a segunda testemunha'); return false; }
                if (current.entity.testemunha1Id === current.entity.testemunha2Id) {
                    setMensagem('Testemunhas não podem ser a mesma pessoa'); return false;
                }
            }
            if (!current.entity.valorCurso) { setMensagem('Valor do curso não definido'); return false; }
            if (!current.criterio) { setMensagem('Critérios não foram aplicados'); return false; }
        }

        if (targetIndex >= 2) {
            if (current.criterio?.tipoMatricula === 'GRUPO') {
                const hasGrupo = current.gruposSelecionados.some(g => g.selected);
                if (!hasGrupo) { setMensagem('Selecione pelo menos um grupo'); return false; }
            } else {
                const hasOferta = current.oferecimentosSelecionado.some(o => o.selected);
                if (!hasOferta) { setMensagem('Selecione pelo menos um oferecimento'); return false; }
            }
        }

        if (targetIndex >= 3) {
        }

        if (targetIndex >= 4) {
            if (!current.entity.formaPagamentoId) { setMensagem('Selecione a forma de pagamento'); return false; }
            if (!current.entity.dataPrimeiraParcela) { setMensagem('Defina a data da primeira parcela'); return false; }
            if (!current.valores.parcelas || current.valores.parcelas.length === 0) { setMensagem('Configure as parcelas'); return false; }
        }

        return true;
    };

    const handleStepChange = async (newIndex: number) => {
        const direction = newIndex > activeTab ? 'next' : 'back';
        if (direction === 'next') {
            for (let i = activeTab; i < newIndex; i++) {
                if (!(await validateStep(i + 1))) return;
            }
        }
        setActiveTab(newIndex);
    };

    const handleNext = async () => {
        if (activeTab >= TABS.length - 1) {
            if (await validateStep(activeTab + 1)) {
                await handleSave();
            }
            return;
        }
        if (await validateStep(activeTab + 1)) {
            setActiveTab(prev => prev + 1);
        }
    };

    const handleBack = () => {
        if (activeTab === 0) {
            navigate('/view/matricula/list');
            return;
        }
        setActiveTab(prev => prev - 1);
    };

    const handleSave = async () => {
        setErro(null);
        setMensagem(null);
        setSalvando(true);
        try {
            const payload = {
                ...data.entity,
                ofertasSelecionadas: data.oferecimentosSelecionado.filter(o => o.selected).map(o => o.id),
                gruposSelecionados: data.gruposSelecionados.filter(g => g.selected).map(g => g.id),
                materialEscolar: data.materialEscolar.filter(m => (m.quantidade ?? 0) > 0).map(m => ({
                    controleEstoqueId: m.controleEstoqueId,
                    quantidade: m.quantidade,
                })),
                valores: {
                    formaPagamentoId: data.entity.formaPagamentoId,
                    dataPrimeiraParcela: data.entity.dataPrimeiraParcela,
                    dataParcela: data.entity.dataParcela,
                    parcelas: data.valores.parcelas,
                    taxas: data.valores.taxas,
                    bonificacao: data.valores.bonificacao,
                },
                tipoMatricula: data.tipoMatricula,
            };

            await api.post('/api/educacao/matricula', payload);
            setMensagem('Matrícula realizada com sucesso!');
            setData(prev => ({...prev, verificaMatriculaFinalizada: true}));
        } catch (e: any) {
            setErro(e?.response?.data?.message ?? e?.response?.data?.error ?? 'Erro ao salvar a matrícula.');
        } finally {
            setSalvando(false);
        }
    };

    const renderTabContrato = () => (
        <section className="tab-content">
            <p className="step-description">
                {emEdicao ? 'Edite os dados do contrato de matrícula.' : 'Informe os dados do aluno, curso, contratante e testemunhas.'}
            </p>

            <div className="field-row">
                <AutoComplete
                    id="mat-aluno"
                    label="Aluno *"
                    placeholder="Digite para buscar o aluno..."
                    value={data.entity.pessoaId ? {id: data.entity.pessoaId, label: ''} : null}
                    onChange={(opt) => {
                        if (opt) {
                            updateEntityField('pessoaId', opt.id);
                        }
                    }}
                    fetchOptions={fetchPessoaFisica}
                    minChars={3}
                />
            </div>

            <div className="field-row">
                <div className="field-group">
                    <label htmlFor="mat-curso">Curso *</label>
                    <select
                        id="mat-curso"
                        className="form-input form-select"
                        value={data.entity.curriculoId ?? ''}
                        onChange={(e) => updateEntityField('curriculoId', Number(e.target.value) || null)}
                    >
                        <option value="">Selecione</option>
                        {(curriculosQuery.data ?? []).map((c) => (
                            <option key={c.id} value={c.id}>{c.descricao || c.sucinto || `Curso #${c.id}`}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="field-row">
                <div className="field-group">
                    <label>Tipo Contratante</label>
                    <div className="radio-group">
                        <label className="radio-label">
                            <input
                                type="radio"
                                checked={data.entity.pessoaFisica}
                                onChange={() => updateEntityField('pessoaFisica', true)}
                            />
                            Pessoa Física
                        </label>
                        <label className="radio-label">
                            <input
                                type="radio"
                                checked={!data.entity.pessoaFisica}
                                onChange={() => updateEntityField('pessoaFisica', false)}
                            />
                            Pessoa Jurídica
                        </label>
                    </div>
                </div>
            </div>

            <div className="field-row">
                {data.entity.pessoaFisica ? (
                    <AutoComplete
                        id="mat-responsavel-pf"
                        label="Contratante (PF) *"
                        placeholder="Digite para buscar..."
                        value={data.entity.responsavelId ? {id: data.entity.responsavelId, label: ''} : null}
                        onChange={(opt) => opt && updateEntityField('responsavelId', opt.id)}
                        fetchOptions={fetchPessoaFisica}
                        minChars={3}
                    />
                ) : (
                    <AutoComplete
                        id="mat-responsavel-pj"
                        label="Contratante (PJ) *"
                        placeholder="Digite para buscar..."
                        value={data.entity.responsavelId ? {id: data.entity.responsavelId, label: ''} : null}
                        onChange={(opt) => opt && updateEntityField('responsavelId', opt.id)}
                        fetchOptions={fetchPessoaJuridica}
                        minChars={3}
                    />
                )}
            </div>

            <div className="field-row">
                <div className="field-group">
                    <label htmlFor="mat-unidade">Unidade *</label>
                    <select
                        id="mat-unidade"
                        className="form-input form-select"
                        value={data.entity.unidadeId ?? ''}
                        onChange={(e) => {
                            const unidadeId = Number(e.target.value) || null;
                            updateEntityField('unidadeId', unidadeId);
                        }}
                    >
                        <option value="">Selecione</option>
                        {(unidadesQuery.data ?? []).filter(u => u.fl_ativo !== false).map((u) => (
                            <option key={u.id} value={u.id}>{u.sucinto || u.nomeFantasia || u.razaoSocial || `Unidade #${u.id}`}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="field-row">
                <AutoComplete
                    id="mat-testemunha1"
                    label="Primeira Testemunha *"
                    placeholder="Digite para buscar..."
                    value={data.entity.testemunha1Id ? {id: data.entity.testemunha1Id, label: ''} : null}
                    onChange={(opt) => opt && updateEntityField('testemunha1Id', opt.id)}
                    fetchOptions={fetchPessoaFisica}
                    minChars={3}
                />
                <AutoComplete
                    id="mat-testemunha2"
                    label="Segunda Testemunha *"
                    placeholder="Digite para buscar..."
                    value={data.entity.testemunha2Id ? {id: data.entity.testemunha2Id, label: ''} : null}
                    onChange={(opt) => opt && updateEntityField('testemunha2Id', opt.id)}
                    fetchOptions={fetchPessoaFisica}
                    minChars={3}
                />
            </div>

            {data.entity.curriculoId && data.criterio && (
                <div className="field-row">
                    <div className="field-group">
                        <label>Critério do Curso</label>
                        <div className="ofc-hint">
                            Turmas máximas abertas: {data.criterio.qtdTurmaAbertas ?? 'Não definido'}<br />
                            Período: {data.criterio.periodo ?? 'Não definido'}<br />
                            {data.criterio.dataInicio && `Início válido a partir de: ${brDate(data.criterio.dataInicio)}`}<br />
                            {data.criterio.dataFim && `Término até: ${brDate(data.criterio.dataFim)}`}
                        </div>
                    </div>
                </div>
            )}
        </section>
    );

    const renderTabMatricula = () => {
        const tipoLivre = data.criterio?.tipoMatricula === 'LIVRE';
        return (
            <section className="tab-content">
                <p className="step-description">
                    {tipoLivre
                        ? 'Selecione os componentes curriculares (ofertas) para a matrícula.'
                        : 'Selecione os grupos para a matrícula.'}
                </p>

                {tipoLivre ? (
                    <div className="oferecimentos-livre">
                        <div className="accordion">
                            {(oferecimentosQuery.data ?? []).reduce((acc, of) => {
                                const grupoId = of.grupoId ?? 0;
                                if (!acc[grupoId]) acc[grupoId] = {grupo: of.grupo, items: []};
                                acc[grupoId].items.push(of);
                                return acc;
                            }, {} as Record<number, {grupo?: OferecimentoWrapperRow['grupo']; items: OferecimentoWrapperRow[]}>)
                            && Object.entries((oferecimentosQuery.data ?? []).reduce((acc, of) => {
                                const grupoId = of.grupoId ?? 0;
                                if (!acc[grupoId]) acc[grupoId] = {grupo: of.grupo, items: []};
                                acc[grupoId].items.push(of);
                                return acc;
                            }, {} as Record<number, {grupo?: OferecimentoWrapperRow['grupo']; items: OferecimentoWrapperRow[]}>)).map(([grupoId, grupoData]) => (
                                <div key={grupoId} className="accordion-item">
                                    <button
                                        type="button"
                                        className="accordion-header"
                                        onClick={() => setData(prev => ({
                                            ...prev,
                                            oferecimentosSelecionado: prev.oferecimentosSelecionado.map(o =>
                                                o.grupoId === Number(grupoId) ? {...o, selected: !o.selected} : o
                                            )
                                        }))}
                                    >
                                        <span>{grupoData.grupo?.nome || `Grupo #${grupoId}`}</span>
                                        <span className="accordion-toggle">▼</span>
                                    </button>
                                    <div className="accordion-content">
                                        <table className="ofc-table">
                                            <thead>
                                            <tr>
                                                <th style={{width: 40}}><input type="checkbox" onChange={(e) => setData(prev => ({
                                                    ...prev,
                                                    oferecimentosSelecionado: prev.oferecimentosSelecionado.map(o =>
                                                        o.grupoId === Number(grupoId) ? {...o, selected: e.target.checked} : o
                                                    )
                                                }))} /></th>
                                                <th>Status</th>
                                                <th>Turma</th>
                                                <th>Inscritos/Vagas</th>
                                                <th>Componente Curricular</th>
                                                <th>Sala</th>
                                                <th>Unidade</th>
                                                <th>Data Início</th>
                                            </tr>
                                            </thead>
                                            <tbody>
                                            {grupoData.items.map((of) => (
                                                <tr key={of.id} className={of.motivo ? 'has-motivo' : ''}>
                                                    <td>
                                                        <input
                                                            type="checkbox"
                                                            checked={of.selected}
                                                            disabled={of.disabledComponenteCurricular || of.disabledConflitoDia || of.disabledRequisito}
                                                            onChange={(e) => setData(prev => ({
                                                ...prev,
                                                oferecimentosSelecionado: prev.oferecimentosSelecionado.map(o =>
                                                    o.id === of.id ? {...o, selected: e.target.checked} : o
                                                )
                                            }))}
                                                        />
                                                    </td>
                                                    <td><span className={`status-${of.status}`}>{of.status}</span></td>
                                                    <td>{of.id}</td>
                                                    <td>{of.inscritos} / {of.vagas}</td>
                                                    <td>{of.componenteCurricular?.descricao || `#${of.componenteCurricularId}`}</td>
                                                    <td>{of.sala?.numero}</td>
                                                    <td>{of.unidade?.sucinto}</td>
                                                    <td>{of.dataInicio ? brDate(of.dataInicio) : ''} até {of.dataFim ? brDate(of.dataFim) : ''}</td>
                                                </tr>
                                            ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="oferecimentos-grupo">
                        {(gruposQuery.data ?? []).map((grupo) => (
                            <div key={grupo.id} className="grupo-card">
                                <div className="grupo-header">
                                    <h4>{grupo.grupo?.nome || `Grupo #${grupo.grupoId}`}</h4>
                                    <span>{grupo.horario}</span>
                                </div>
                                <div className="grupo-actions">
                                    <label className="checkbox-label">
                                        <input
                                            type="checkbox"
                                            checked={grupo.selected}
                                            onChange={(e) => setData(prev => ({
                                                ...prev,
                                                gruposSelecionados: prev.gruposSelecionados.map(g =>
                                                    g.id === grupo.id ? {...g, selected: e.target.checked} : g
                                                )
                                            }))}
                                        />
                                        {grupo.selected ? 'Desmarcar' : 'Marcar'}
                                    </label>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>
        );
    };

    const renderTabMaterial = () => (
        <section className="tab-content">
            <p className="step-description">
                Selecione os materiais escolares e suas quantidades.
            </p>

            <div className="material-disponivel">
                <h4>Produtos Disponíveis</h4>
                <table className="ofc-table">
                    <thead>
                    <tr>
                        <th>Foto</th>
                        <th>ID</th>
                        <th>Nome</th>
                        <th>Valor</th>
                        <th></th>
                    </tr>
                    </thead>
                    <tbody>
                    {(controleEstoqueQuery.data ?? []).map((item) => (
                        <tr key={item.id}>
                            <td>
                                {item.controleEstoque?.produto?.imagem && (
                                    <img src={`${window.location.origin}/app-resources/${item.controleEstoque.produto.imagem}`} style={{maxHeight: 32, maxWidth: 32}} />
                                )}
                            </td>
                            <td>{item.controleEstoque?.produto?.id}</td>
                            <td>{item.controleEstoque?.produto?.identificador}</td>
                            <td>{item.controleEstoque?.produto?.valor ? formatCurrency(item.controleEstoque.produto.valor) : ''}</td>
                            <td>
                                <button
                                    type="button"
                                    className="btn-primary btn-sm"
                                    onClick={() => {
                                        if (!data.materialEscolar.some(m => m.controleEstoqueId === item.controleEstoqueId)) {
                                            updateFields({
                                                materialEscolar: [...data.materialEscolar, {
                                                    controleEstoqueId: item.controleEstoqueId,
                                                    controleEstoque: item.controleEstoque,
                                                    quantidadeCurso: 1,
                                                    quantidade: 1,
                                                }]
                                            });
                                        }
                                    }}
                                >
                                    Adicionar
                                </button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>

            <div className="material-selecionado">
                <h4>Materiais da Matrícula</h4>
                {data.materialEscolar.length === 0 ? (
                    <p className="ofc-aviso">Nenhum material adicionado.</p>
                ) : (
                    <div className="material-grid">
                        {data.materialEscolar.map((item, index) => (
                            <div key={index} className="material-card">
                                {item.controleEstoque?.produto?.imagem && (
                                    <img src={`${window.location.origin}/app-resources/${item.controleEstoque.produto.imagem}`} style={{maxHeight: 80, maxWidth: 80}} />
                                )}
                                <div className="material-info">
                                    <strong>{item.controleEstoque?.produto?.identificador}</strong>
                                    <div>Valor: {item.controleEstoque?.produto?.valor ? formatCurrency(item.controleEstoque.produto.valor) : ''}</div>
                                </div>
                                <div className="material-quantities">
                                    <label>Fornecida: <input type="number" value={item.quantidadeCurso ?? 0} readOnly /></label>
                                    <label>Compra: <input type="number" value={item.quantidadeCompra ?? 0} readOnly /></label>
                                    <label>Estoque: <input type="number" value={item.quantidadeEstoque ?? 0} readOnly /></label>
                                    <label>Solicitado: <input type="number" value={item.quantidadeSolicitado ?? 0} readOnly /></label>
                                    <label>
                                        Qtde:
                                        <input
                                            type="number"
                                            min={1}
                                            value={item.quantidade ?? 1}
                                            onChange={(e) => setData(prev => ({
                                                ...prev,
                                                materialEscolar: prev.materialEscolar.map((m, i) => i === index ? {...m, quantidade: Math.max(1, Number(e.target.value))} : m)
                                            }))}
                                        />
                                    </label>
                                </div>
                                <button
                                    type="button"
                                    className="btn-danger btn-sm"
                                    onClick={() => setData(prev => ({
                                        ...prev,
                                        materialEscolar: prev.materialEscolar.filter((_, i) => i !== index)
                                    }))}
                                >
                                    Remover
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );

    const renderTabValores = () => (
        <section className="tab-content">
            <p className="step-description">
                Configure a forma de pagamento, parcelas, taxas e bolsas.
            </p>

            <div className="valores-curso">
                <h4>Cursos Selecionados</h4>
                {data.oferecimentosSelecionado.filter(o => o.selected).length === 0 && data.gruposSelecionados.filter(g => g.selected).length === 0 ? (
                    <p className="ofc-aviso">Nenhum curso/oferta selecionado.</p>
                ) : (
                    <table className="ofc-table">
                        <thead>
                        <tr>
                            <th>Status</th>
                            <th>Unidade</th>
                            <th>Sala</th>
                            <th>Componente Curricular</th>
                            <th>C.H.</th>
                            <th>Data Início/Fim</th>
                            <th>Professor</th>
                        </tr>
                        </thead>
                        <tbody>
                        {data.oferecimentosSelecionado.filter(o => o.selected).map((of) => (
                            <tr key={of.id}>
                                <td><span className={`status-${of.status}`}>{of.status}</span></td>
                                <td>{of.unidade?.sucinto}</td>
                                <td>{of.sala?.numero}</td>
                                <td>{of.componenteCurricular?.descricao}</td>
                                <td>{of.componenteCurricular?.cargaHoraria} H/A</td>
                                <td>{of.dataInicio ? brDate(of.dataInicio) : ''} até {of.dataFim ? brDate(of.dataFim) : ''}</td>
                                <td>{of.professor?.pessoa?.pessoaFisica?.nome || of.professor?.pessoa?.pessoaJuridica?.nomeFantasia}</td>
                            </tr>
                        ))}
                        {data.gruposSelecionados.filter(g => g.selected).map((g) => (
                            <tr key={g.id}>
                                <td colSpan={7}><strong>Grupo: </strong>{g.grupo?.nome} - {g.horario}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                )}
            </div>

            <div className="field-row">
                <div className="field-group">
                    <label htmlFor="mat-forma-pagamento">Forma de Pagamento *</label>
                    <select
                        id="mat-forma-pagamento"
                        className="form-input form-select"
                        value={data.entity.formaPagamentoId ?? ''}
                        onChange={(e) => {
                            const id = Number(e.target.value) || null;
                            updateEntityField('formaPagamentoId', id);
                        }}
                    >
                        <option value="">Selecione</option>
                        {(formasPagamentoQuery.data ?? []).map((f) => (
                            <option key={f.id} value={f.id}>
                                {f.vezes}X - Juros: {f.juros}% - Desconto: {f.desconto}% - Multa: {f.multa}%
                            </option>
                        ))}
                    </select>
                </div>
                <button type="button" className="btn-secondary" onClick={() => {}}>Taxas</button>
            </div>

            <div className="field-row">
                <div className="field-group">
                    <label htmlFor="mat-data-primeira">Pagamento 1ª Parcela *</label>
                    <input
                        id="mat-data-primeira"
                        type="date"
                        className="form-input"
                        value={data.entity.dataPrimeiraParcela ?? ''}
                        onChange={(e) => updateEntityField('dataPrimeiraParcela', e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                    />
                </div>
                <div className="field-group">
                    <label htmlFor="mat-data-parcela">Pagamento 2ª Parcela</label>
                    <select
                        id="mat-data-parcela"
                        className="form-input form-select"
                        value={data.entity.dataParcela ?? ''}
                        onChange={(e) => updateEntityField('dataParcela', e.target.value || null)}
                    >
                        <option value="">Selecione</option>
                        {(data.valores.parcelas ?? []).slice(1).map((p, i) => (
                            <option key={i} value={p.dataVencimento}>{brDate(p.dataVencimento)}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="field-row">
                <button type="button" className="btn-danger" disabled={data.descontoBolsa}>$ Autorização bolsa estudos</button>
                <button type="button" className="btn-warning" disabled={!data.entity.formaPagamentoId}>$ Ajuste parcela</button>
            </div>

            <div className="parcelas-table">
                <h4>Parcelas</h4>
                {data.valores.parcelas.length === 0 ? (
                    <p className="ofc-aviso">Selecione a forma de pagamento para gerar as parcelas.</p>
                ) : (
                    <table className="ofc-table">
                        <thead>
                        <tr>
                            <th>Descrição</th>
                            <th>Parcela</th>
                            <th>Data Vencimento</th>
                            <th>Valor</th>
                        </tr>
                        </thead>
                        <tbody>
                        {data.valores.parcelas.map((p, i) => (
                            <tr key={i}>
                                <td>{p.parcela === 0 ? 'Taxa Inscrição' : 'Matrícula Parcelada'}</td>
                                <td>{p.parcela}</td>
                                <td>{brDate(p.dataVencimento)}</td>
                                <td>
                                    {data.valores.ajustarParcelas && p.parcela !== 0 ? (
                                        <input
                                            type="number"
                                            step="0.01"
                                            min={0}
                                            max={data.valores.valorTotalParcela ?? p.valor}
                                            value={p.valor}
                                            onChange={(e) => {
                                                const newParcelas = [...data.valores.parcelas];
                                                newParcelas[i] = {...p, valor: Number(e.target.value)};
                                                updateValoresField('parcelas', newParcelas);
                                            }}
                                        />
                                    ) : (
                                        formatCurrency(p.valor)
                                    )}
                                </td>
                            </tr>
                        ))}
                        </tbody>
                        <tfoot>
                        <tr>
                            <td colSpan={3}>Parcela mínima: {data.valores.valorMinimoParcela ? formatCurrency(data.valores.valorMinimoParcela) : ''}</td>
                            <td>Total: {data.valores.valorTotalParcela ? formatCurrency(data.valores.valorTotalParcela) : ''}</td>
                        </tr>
                        </tfoot>
                    </table>
                )}
            </div>

            <div className="material-parcelado">
                <h4>Material Escolar - Parcelamento</h4>
                <div className="field-row">
                    <div className="field-group">
                        <label>Tipo Pagamento</label>
                        <select
                            className="form-input form-select"
                            value={data.valores.tipoFormaPagamento || ''}
                            onChange={(e) => updateValoresField('tipoFormaPagamento', e.target.value)}
                        >
                            <option value="">Selecione</option>
                            <option value="AVISTA">À Vista</option>
                            <option value="PARCELA">Parcelado</option>
                        </select>
                    </div>
                </div>
                {data.valores.tipoFormaPagamento === 'PARCELA' && (
                    <div className="field-row">
                        <div className="field-group">
                            <label>Forma de Pagamento Material</label>
                            <select
                                className="form-input form-select"
                                value={data.entity.formaPagamentoId ?? ''}
                                onChange={(e) => updateEntityField('formaPagamentoId', Number(e.target.value) || null)}
                            >
                                <option value="">Selecione</option>
                                {(formasPagamentoQuery.data ?? []).map((f) => (
                                    <option key={f.id} value={f.id}>
                                        {f.vezes}X - Juros: {f.juros}% - Desconto: {f.desconto}%
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                )}
            </div>
        </section>
    );

    const renderTabFinalizar = () => (
        <section className="tab-content">
            <h3>Finalizar Matrícula</h3>
            <p>Revise os dados abaixo e clique em "Finalizar Matrícula" para confirmar.</p>
            <div className="resumo-section">
                <h4>Aluno</h4>
                <p>{(pessoasQuery.data ?? []).find(p => p.id === data.entity.pessoaId)?.nome || 'Não selecionado'}</p>
                <h4>Curso</h4>
                <p>{(curriculosQuery.data ?? []).find(c => c.id === data.entity.curriculoId)?.descricao || 'Não selecionado'}</p>
                <h4>Unidade</h4>
                <p>{(unidadesQuery.data ?? []).find(u => u.id === data.entity.unidadeId)?.sucinto || 'Não selecionado'}</p>
                <h4>Forma Pagamento</h4>
                <p>{(formasPagamentoQuery.data ?? []).find(f => f.id === data.entity.formaPagamentoId)?.vezes + 'X' || 'Não selecionado'}</p>
                <h4>Total Parcelas</h4>
                <p>{data.valores.parcelas.reduce((sum, p) => sum + p.valor, 0).toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})}</p>
            </div>
        </section>
    );

    const steps: WizardStep[] = TABS.map((tab, index) => ({
        key: tab.key,
        label: tab.label,
        content: (
            index === 0 ? renderTabContrato() :
            index === 1 ? renderTabMatricula() :
            index === 2 ? renderTabMaterial() :
            index === 3 ? renderTabValores() :
            renderTabFinalizar()
        ),
        validate: async () => {
            const isValid = await validateStep(index + 1);
            return isValid;
        },
    }));

    return (
        <PermissionGate permission="READ">
            <main>
                <div className="div_form">
                    <div className="form-title">Matrícula</div>
                    <div className="table_form">
                        <Wizard
                            steps={steps}
                            initial={0}
                            completeLabel="Finalizar Matrícula"
                            onComplete={handleSave}
                        />
                    </div>
                </div>
            </main>
        </PermissionGate>
    );
}