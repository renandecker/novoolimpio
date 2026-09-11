import {PermissionGate} from '../../../shared/services/permissions';
import {api} from '../../../shared/services/api';
import {useState, useEffect, useCallback, useMemo} from 'react';
import {AutoComplete, type AutoCompleteOption} from '../../../shared/components/AutoComplete';
import {Tabs} from '../../../shared/components/Tabs';
import {Wizard} from '../../../shared/components/Wizard';

interface ContratoAutoCompleteResponse {
    id: number;
    nome: string;
}

interface CurriculoResponse {
    id: number;
    sucinto: string;
    curso: { nome: string };
    tipoCurso: { descricao: string };
    cargaHoraria: number;
}

interface UnidadeResponse {
    id: number;
    sucinto: string;
}

interface PessoaFisicaResponse {
    id: number;
    pessoaId?: number;
    nome: string;
    cpf: string;
}

interface PessoaJuridicaResponse {
    id: number;
    nomeFantasia: string;
    cnpj: string;
}

interface OferecimentoGrupo {
    id: number;
    grupo: string;
    unidade: { sucinto: string };
    horario: string;
    selected: boolean;
    oferecimentosSelecionado?: OferecimentoItem[];
}

interface OferecimentoItem {
    id: number;
    status: string;
    unidade: { sucinto: string };
    sala: { numero: string };
    componenteCurricular: { descricao: string; cargaHoraria: number };
    dataInicio: string;
    dataFim: string;
    professor?: { pessoa?: { pessoaFisica?: { nome: string }; pessoaJuridica?: { nomeFantasia: string } } };
    disabledComponenteCurricular?: boolean;
    disabledConflitoDia?: boolean;
    disabledRequisito?: boolean;
    motivo?: string;
    selected?: boolean;
}

interface FiltroMatricula {
    unidadeId?: number;
    turnoEducacaoId?: number;
    diaSemanaId?: number;
    curriculoId?: number;
    tipoMatricula: 'GRUPO' | 'LIVRE';
}

interface FormaPagamentoResponse {
    id: number;
    vezes: number;
    juros: number | null;
    desconto: number | null;
    multa?: number | null;
    ativo: boolean;
    ajuste: boolean;
}

interface ParcelaLinha {
    parcela: number;
    descricao: string;
    dataVencimento: string;
    valor: number;
    editavel: boolean;
}

function addMonths(iso: string, months: number): string {
    if (!iso) return '';
    const [y, m, d] = iso.split('-').map(Number);
    const dt = new Date(y, m - 1 + months, d);
    return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`;
}

function formatDate(iso: string): string {
    if (!iso) return '';
    const parts = iso.split('-');
    if (parts.length !== 3) return iso;
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

function toAutoCompleteOption(item: { id: number; nome?: string; nomeFantasia?: string; cpf?: string; cnpj?: string; sucinto?: string; curso?: { nome: string } }): AutoCompleteOption {
    const label = item.nome
        ? `${item.nome} (${item.cpf || ''})`
        : item.nomeFantasia
        ? `${item.nomeFantasia} (${item.cnpj || ''})`
        : item.sucinto
        ? `${item.sucinto} - ${item.curso?.nome || ''}`
        : `#${item.id}`;
    return { id: item.id, label };
}

interface CurriculoOption extends AutoCompleteOption {
    sucinto?: string;
    cursoNome?: string;
    tipoCurso?: string;
    cargaHoraria?: number;
}

function toCurriculoOption(item: CurriculoResponse): CurriculoOption {
    const label = [
        item.sucinto,
        item.curso?.nome,
        item.tipoCurso?.descricao ? `(${item.tipoCurso.descricao})` : '',
        item.cargaHoraria ? `${item.cargaHoraria} H/A` : '',
    ]
        .filter(Boolean)
        .join(' - ');
    return {
        id: item.id,
        label: label || `#${item.id}`,
        sucinto: item.sucinto,
        cursoNome: item.curso?.nome,
        tipoCurso: item.tipoCurso?.descricao,
        cargaHoraria: item.cargaHoraria,
    };
}

function buildParcelas(fp: FormaPagamentoResponse | null, primeira: string, segunda: string, valorTotalParcela: number): ParcelaLinha[] {
    if (!fp || !primeira) return [];
    const vezes = fp.vezes > 0 ? fp.vezes : 1;
    const base = segunda || primeira;
    const rows: ParcelaLinha[] = [];
    for (let i = 0; i <= vezes; i++) {
        const data = i === 0 ? primeira : addMonths(base, segunda ? i - 1 : i);
        rows.push({
            parcela: i,
            descricao: i === 0 ? 'Taxa Inscrição' : 'Matrícula Parcelada',
            dataVencimento: data,
            valor: i === 0 ? 0 : Math.round((valorTotalParcela / vezes) * 100) / 100,
            editavel: false,
        });
    }
    return rows;
}

export default function ViewConsultorMatriculaLayoutScreen() {
    const [verificaMatriculaFinalizada, setVerificaMatriculaFinalizada] = useState(false);
    const [alunos, setAlunos] = useState<AutoCompleteOption[]>([]);
    const [curriculos, setCurriculos] = useState<AutoCompleteOption[]>([]);
    const [unidades, setUnidades] = useState<UnidadeResponse[]>([]);
    const [pessoasFisicas, setPessoasFisicas] = useState<AutoCompleteOption[]>([]);
    const [pessoasJuridicas, setPessoasJuridicas] = useState<AutoCompleteOption[]>([]);
    const [testemunhas, setTestemunhas] = useState<AutoCompleteOption[]>([]);
    const [grupos, setGrupos] = useState<OferecimentoGrupo[]>([]);
    const [ofertasLivre, setOfertasLivre] = useState<OferecimentoItem[]>([]);
    const [filtro, setFiltro] = useState<FiltroMatricula>({ tipoMatricula: 'LIVRE' });
    const [loading, setLoading] = useState(false);
    const [contrato, setContrato] = useState<Record<string, unknown>>({});
    const [materialEstoque, setMaterialEstoque] = useState<any[]>([]);
    const [materialContrato, setMaterialContrato] = useState<any[]>([]);
    const [matriculaSelecionadas, setMatriculaSelecionadas] = useState<OferecimentoItem[]>([]);
    const [formaPagamentos, setFormaPagamentos] = useState<FormaPagamentoResponse[]>([]);
    const [formaPagamento, setFormaPagamento] = useState<FormaPagamentoResponse | null>(null);
    const [materialFormaPagamento, setMaterialFormaPagamento] = useState<FormaPagamentoResponse | null>(null);
    const [dataPrimeiraParcela, setDataPrimeiraParcela] = useState('');
    const [dataSegundaParcela, setDataSegundaParcela] = useState('');
    const [valorCurso, setValorCurso] = useState(0);
    const [parcelas, setParcelas] = useState<ParcelaLinha[]>([]);

    const loadAlunos = useCallback(async (query: string): Promise<AutoCompleteOption[]> => {
        if (!query || query.length < 3) return [];
        try {
            const response = await api.get<ContratoAutoCompleteResponse[]>('/api/educacao/contrato/auto-complete-aluno', { params: { query } });
            return response.data.map(toAutoCompleteOption);
        } catch (e) {
            console.error('Erro ao buscar alunos:', e);
            return [];
        }
    }, []);

    const loadCurriculos = useCallback(async (query: string): Promise<AutoCompleteOption[]> => {
        if (!query) return [];
        try {
            const response = await api.get<CurriculoResponse[]>('/api/educacao/curriculo/auto-complete-full', { params: { query } });
            return response.data.map(toCurriculoOption);
        } catch (e) {
            console.error('Erro ao buscar currículos:', e);
            return [];
        }
    }, []);

    const loadUnidades = useCallback(async () => {
        try {
            const response = await api.get<UnidadeResponse[]>('/api/basico/unidade');
            setUnidades(response.data);
        } catch (e) {
            console.error('Erro ao buscar unidades:', e);
        }
    }, []);

    const loadPessoasFisicas = useCallback(async (query: string): Promise<AutoCompleteOption[]> => {
        if (!query || query.length < 3) return [];
        try {
            const response = await api.get<PessoaFisicaResponse[]>('/api/basico/pessoa-fisica/auto-complete-todos', { params: { query } });
            return response.data.map(toAutoCompleteOption);
        } catch (e) {
            console.error('Erro ao buscar pessoas físicas:', e);
            return [];
        }
    }, []);

    const loadPessoasJuridicas = useCallback(async (query: string): Promise<AutoCompleteOption[]> => {
        if (!query || query.length < 3) return [];
        try {
            const response = await api.get<PessoaJuridicaResponse[]>('/api/basico/pessoa-juridica/auto-complete-todos', { params: { query } });
            return response.data.map(toAutoCompleteOption);
        } catch (e) {
            console.error('Erro ao buscar pessoas jurídicas:', e);
            return [];
        }
    }, []);

    // Referência legado (extracted_aceso):
    //  abasMatricula.xhtml -> completeMethod="#{pessoaFisicaController.autoCompleteTestemunha}"
    //  itemLabel="#{pessoa.pessoaFisica.nome} (#{pessoa.pessoaFisica.cpf})", minQueryLength=3, dropdown=true.
    //  Backend filtra Usuario ativo por nome/cpf (PessoaFisicaRepository.autoCompleteTestemunha).
    //  Contrato.testemunha1/2 referenciam Pessoa (bas_pessoa id) -> usar pessoaId quando disponível.
    const toTestemunhaOption = useCallback((item: PessoaFisicaResponse): AutoCompleteOption => {
        const pessoaId = item.pessoaId ?? item.id;
        const label = item.nome ? `${item.nome} (${item.cpf || ''})` : `#${pessoaId}`;
        return { id: pessoaId, label };
    }, []);

    const loadTestemunhas = useCallback(async (query: string): Promise<AutoCompleteOption[]> => {
        try {
            const q = (query || '').trim();
            // dropdown=true no legado: query vazia lista as 10 primeiras testemunhas
            const response = await api.get<PessoaFisicaResponse[] | number[]>('/api/basico/pessoa-fisica/auto-complete-testemunha', { params: { query: q } });
            const data = response.data ?? [];
            if (data.length > 0 && typeof data[0] === 'number') {
                return (data as number[]).map(id => ({ id, label: `#${id}` }));
            }
            return (data as PessoaFisicaResponse[]).map(toTestemunhaOption);
        } catch (e) {
            console.error('Erro ao buscar testemunhas:', e);
            return [];
        }
    }, [toTestemunhaOption]);

    const loadGrupos = useCallback(async () => {
        if (!filtro.curriculoId) return;
        setLoading(true);
        try {
            const params = new URLSearchParams();
            params.append('curriculoId', String(filtro.curriculoId));
            if (filtro.unidadeId) params.append('unidadeId', String(filtro.unidadeId));
            const response = await api.get<OferecimentoGrupo[]>(`/api/educacao/oferecimento-curso/listar-grupos?${params}`);
            setGrupos(response.data);
        } catch (e) {
            console.error('Erro ao buscar grupos:', e);
        } finally {
            setLoading(false);
        }
    }, [filtro]);

    const loadOfertasLivre = useCallback(async () => {
        if (!filtro.curriculoId) return;
        setLoading(true);
        try {
            const params = new URLSearchParams();
            params.append('curriculoId', String(filtro.curriculoId));
            if (filtro.unidadeId) params.append('unidadeId', String(filtro.unidadeId));
            if (filtro.turnoEducacaoId) params.append('turnoEducacaoId', String(filtro.turnoEducacaoId));
            if (filtro.diaSemanaId) params.append('diaSemanaId', String(filtro.diaSemanaId));
            const response = await api.get<{ content: OferecimentoItem[] }>(`/api/educacao/oferecimento-componente-curricular/paged?${params}`);
            setOfertasLivre(response.data.content || []);
        } catch (e) {
            console.error('Erro ao buscar ofertas livre:', e);
        } finally {
            setLoading(false);
        }
    }, [filtro]);

    const loadFormaPagamentos = useCallback(async () => {
        try {
            const response = await api.get<FormaPagamentoResponse[]>('/api/financeiro/forma-pagamento');
            setFormaPagamentos(response.data ?? []);
        } catch (e) {
            console.error('Erro ao buscar formas de pagamento:', e);
        }
    }, []);

    const loadValorCurso = useCallback(async () => {
        const curriculo = contrato.curriculo as AutoCompleteOption | undefined;
        const unidade = contrato.unidade as UnidadeResponse | undefined;
        if (!curriculo?.id || !unidade?.id) return;
        try {
            const res = await api.get<number>('/api/educacao/matricula/buscar-valor-curso2', { params: { curriculoId: curriculo.id, unidadeId: unidade.id } });
            setValorCurso(Number(res.data ?? 0));
        } catch (e) {
            console.error('Erro ao buscar valor do curso:', e);
        }
    }, [contrato.curriculo, contrato.unidade]);

    const diasSegundaParcela = useMemo(() => {
        if (!dataPrimeiraParcela) return [];
        return Array.from({ length: 6 }, (_, i) => addMonths(dataPrimeiraParcela, i + 1));
    }, [dataPrimeiraParcela]);

    useEffect(() => {
        loadUnidades();
    }, [loadUnidades]);

    useEffect(() => {
        loadFormaPagamentos();
    }, [loadFormaPagamentos]);

    useEffect(() => {
        if (filtro.tipoMatricula === 'GRUPO') {
            loadGrupos();
        } else {
            loadOfertasLivre();
        }
    }, [filtro, loadGrupos, loadOfertasLivre]);

    useEffect(() => {
        setParcelas(buildParcelas(formaPagamento, dataPrimeiraParcela, dataSegundaParcela, valorCurso));
    }, [formaPagamento, dataPrimeiraParcela, dataSegundaParcela, valorCurso]);

    const handleAlunoSelect = (option: AutoCompleteOption | null) => {
        if (option) setContrato(prev => ({ ...prev, pessoa: option }));
    };

    const handleCursoSelect = (option: AutoCompleteOption | null) => {
        if (option) {
            setContrato(prev => ({ ...prev, curriculo: option }));
            setFiltro(prev => ({ ...prev, curriculoId: option.id }));
        }
    };

    const handleResponsavelSelect = (option: AutoCompleteOption | null, tipo: 'fisica' | 'juridica') => {
        if (option) setContrato(prev => ({ ...prev, responsavel: option, tipoContratante: tipo }));
    };

    const handleUnidadeChange = (unidade: UnidadeResponse | undefined) => {
        if (unidade) {
            setContrato(prev => ({ ...prev, unidade }));
            setFiltro(prev => ({ ...prev, unidadeId: unidade.id }));
        }
    };

    const handleTestemunhaSelect = (option: AutoCompleteOption | null, num: 1 | 2) => {
        if (option) setContrato(prev => ({ ...prev, [`testemunha${num}`]: option }));
    };

    const handleGrupoSelect = (grupo: OferecimentoGrupo) => {
        setGrupos(prev => prev.map(g => ({
            ...g,
            selected: g.id === grupo.id ? !grupo.selected : g.selected
        })));
        if (!grupo.selected && grupo.oferecimentosSelecionado) {
            setMatriculaSelecionadas(prev => [...prev, ...grupo.oferecimentosSelecionado]);
        }
    };

    const handleOfertaSelect = (oferta: OferecimentoItem) => {
        setOfertasLivre(prev => prev.map(o => ({
            ...o,
            selected: o.id === oferta.id ? !oferta.selected : o.selected
        })));
        if (!oferta.selected) {
            setMatriculaSelecionadas(prev => [...prev, oferta]);
        } else {
            setMatriculaSelecionadas(prev => prev.filter(o => o.id !== oferta.id));
        }
    };

    const handleFiltroChange = (key: keyof FiltroMatricula, value: unknown) => {
        setFiltro(prev => ({ ...prev, [key]: value }));
    };

    const handleTipoMatriculaChange = (tipo: 'GRUPO' | 'LIVRE') => {
        setFiltro(prev => ({ ...prev, tipoMatricula: tipo }));
    };

    const handleFormaPagamentoChange = (fp: FormaPagamentoResponse | undefined) => {
        setFormaPagamento(fp ?? null);
    };

    const handleDataPrimeiraParcelaChange = (value: string) => {
        setDataPrimeiraParcela(value);
        if (!dataSegundaParcela) setDataSegundaParcela(addMonths(value, 1));
    };

    const validateContrato = (): string | boolean => {
        if (!contrato.pessoa) return 'Selecione o aluno.';
        if (!contrato.curriculo) return 'Selecione o curso.';
        if (!contrato.unidade) return 'Selecione a unidade do contrato.';
        const t1 = contrato.testemunha1 as AutoCompleteOption | undefined;
        const t2 = contrato.testemunha2 as AutoCompleteOption | undefined;
        if (!t1) return 'Selecione a primeira testemunha.';
        if (!t2) return 'Selecione a segunda testemunha.';
        if (t1.id === t2.id) return 'A primeira e a segunda testemunha não podem ser as mesmas.';
        return true;
    };

    const validateMatricula = (): string | boolean => {
        if (matriculaSelecionadas.length === 0) return 'Selecione ao menos um oferecimento (Grupo ou Livre) para a matrícula.';
        return true;
    };

    const validateValores = (): string | boolean => {
        if (!formaPagamento) return 'Selecione a forma de pagamento antes de finalizar.';
        if (!dataPrimeiraParcela) return 'Informe a data da primeira parcela.';
        return true;
    };

    const handleFinalizarMatricula = async () => {
        try {
            await api.post('/api/educacao/matricula/gerar-carne-consultor');
        } catch (e) {
            console.error('Erro ao finalizar matrícula:', e);
        }
        setVerificaMatriculaFinalizada(true);
    };

    const handleNovaMatricula = () => {
        setVerificaMatriculaFinalizada(false);
        setContrato({});
        setMatriculaSelecionadas([]);
        setFormaPagamento(null);
        setMaterialFormaPagamento(null);
        setDataPrimeiraParcela('');
        setDataSegundaParcela('');
        setParcelas([]);
        setMaterialContrato([]);
    };

    const handleBaixarCarneMatricula = async () => {
        try {
            await api.post('/api/educacao/matricula/gerar-carne-consultor');
        } catch (e) {
            console.error('Erro ao gerar carnê de matrícula:', e);
        }
        alert('Download do carnê de matrícula iniciado.');
    };

    const handleBaixarCarneMaterial = () => {
        alert('Download do carnê de material escolar ainda não implementado.');
    };

    const handleGerarContrato = () => {
        alert('Geração do contrato (doc) ainda não implementada.');
    };

    const handleGerarPromissoria = () => {
        alert('Geração da promissória ainda não implementada.');
    };

    const handleDigitalizar = () => {
        alert('Digitalização do contrato ainda não implementada.');
    };

    const renderOferecimentosTable = (rows: OferecimentoItem[]) => (
        <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                    <tr style={{ background: '#2f333b', color: '#fff' }}>
                        <th style={{ padding: '8px', textAlign: 'left' }}>Status</th>
                        <th style={{ padding: '8px', textAlign: 'left' }}>Turma</th>
                        <th style={{ padding: '8px', textAlign: 'left' }}>Unidade</th>
                        <th style={{ padding: '8px', textAlign: 'left' }}>Sala</th>
                        <th style={{ padding: '8px', textAlign: 'left' }}>Componente Curricular</th>
                        <th style={{ padding: '8px', textAlign: 'left' }}>C.H.</th>
                        <th style={{ padding: '8px', textAlign: 'left' }}>Data Início - Fim</th>
                        <th style={{ padding: '8px', textAlign: 'left' }}>Professor</th>
                    </tr>
                </thead>
                <tbody>
                    {rows.map((o, i) => (
                        <tr key={o.id} style={{ background: i % 2 === 0 ? '#ffffff' : '#f7f7f7', borderBottom: '1px solid #e5e5e5' }}>
                            <td style={{ padding: '8px' }}><span className={`status ${o.status}`}>{o.status}</span></td>
                            <td style={{ padding: '8px' }}>Turma {o.id}</td>
                            <td style={{ padding: '8px' }}>{o.unidade?.sucinto}</td>
                            <td style={{ padding: '8px' }}>{o.sala?.numero}</td>
                            <td style={{ padding: '8px' }}>{o.componenteCurricular?.descricao}</td>
                            <td style={{ padding: '8px' }}>{o.componenteCurricular?.cargaHoraria}H/A</td>
                            <td style={{ padding: '8px', whiteSpace: 'nowrap' }}>{o.dataInicio} - {o.dataFim}</td>
                            <td style={{ padding: '8px' }}>{o.professor?.pessoa?.pessoaFisica?.nome || o.professor?.pessoa?.pessoaJuridica?.nomeFantasia || '-'}</td>
                        </tr>
                    ))}
                    {rows.length === 0 && (
                        <tr><td colSpan={8} style={{ padding: '8px' }}>Nenhum oferecimento selecionado na etapa de Matrícula.</td></tr>
                    )}
                </tbody>
            </table>
        </div>
    );

    const renderContratoTab = () => (
        <div className="contrato-tab">
            <div className="aluno-info" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginBottom: '20px' }}>
                <div className="info-panel">
                    <h4>Maioridade</h4>
                    <span className={`status ${contrato.maioridade ? 'PENDENTE' : 'EM_ANDAMENTO'}`}>
                        {contrato.maioridade ? 'DE MENOR' : 'DE MAIOR'}
                    </span>
                </div>
                <div className="info-panel">
                    <h4>Financeiro</h4>
                    <span className={`status ${contrato.financeiro ? 'PENDENTE' : 'EM_ANDAMENTO'}`}>
                        {contrato.financeiro ? 'COM DÍVIDAS' : 'SEM DÍVIDAS'}
                    </span>
                </div>
                <div className="info-panel">
                    <h4>Aluno</h4>
                    <span className={`status ${contrato.aluno ? 'EM_ANDAMENTO' : 'PENDENTE'}`}>
                        {contrato.aluno ? 'SIM' : 'NÃO'}
                    </span>
                </div>
                <div className="info-panel">
                    <h4>Atualizar Dados</h4>
                    <span className={`status ${contrato.dados ? 'PENDENTE' : 'EM_ANDAMENTO'}`}>
                        {contrato.dados ? 'SIM' : 'NÃO'}
                    </span>
                </div>
            </div>

            <div className="form-section">
                <h3>Dados do Contrato</h3>
                <div className="table_form" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px' }}>
                    <div>
                        <label>Aluno *</label>
                        <AutoComplete
                            value={contrato.pessoa as AutoCompleteOption | undefined}
                            onChange={handleAlunoSelect}
                            fetchOptions={loadAlunos}
                            minChars={3}
                            placeholder="Digite 3+ caracteres..."
                        />
                    </div>

                    <div>
                        <label>Curso *</label>
                        <AutoComplete
                            value={contrato.curriculo as AutoCompleteOption | undefined}
                            onChange={handleCursoSelect}
                            fetchOptions={loadCurriculos}
                            minChars={1}
                            placeholder="Digite para buscar..."
                        />
                    </div>
                </div>
            </div>

            <div className="form-section">
                <h3>Tipo de Contratante</h3>
                <div style={{ display: 'flex', gap: '20px', marginBottom: '15px' }}>
                    <label><input type="radio" name="tipoContratante" value="fisica" checked={contrato.tipoContratante === 'fisica'} onChange={() => setContrato(prev => ({ ...prev, tipoContratante: 'fisica' }))} /> Pessoa Física</label>
                    <label><input type="radio" name="tipoContratante" value="juridica" checked={contrato.tipoContratante === 'juridica'} onChange={() => setContrato(prev => ({ ...prev, tipoContratante: 'juridica' }))} /> Pessoa Jurídica</label>
                </div>
                <div className="table_form" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px' }}>
                    <div>
                        <label>Contratante *</label>
                        {contrato.tipoContratante === 'fisica' ? (
                            <AutoComplete
                                value={contrato.responsavel as AutoCompleteOption | undefined}
                                onChange={p => handleResponsavelSelect(p, 'fisica')}
                                fetchOptions={loadPessoasFisicas}
                                minChars={3}
                                placeholder="Digite 3+ caracteres..."
                            />
                        ) : (
                            <AutoComplete
                                value={contrato.responsavel as AutoCompleteOption | undefined}
                                onChange={p => handleResponsavelSelect(p, 'juridica')}
                                fetchOptions={loadPessoasJuridicas}
                                minChars={3}
                                placeholder="Digite 3+ caracteres..."
                            />
                        )}
                    </div>
                </div>
            </div>

            <div className="form-section">
                <h3>Unidade e Testemunhas</h3>
                <div className="table_form" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px' }}>
                    <div>
                        <label>Unidade do Contrato *</label>
                        <select
                            value={contrato.unidade ? String((contrato.unidade as UnidadeResponse).id) : ''}
                            onChange={e => handleUnidadeChange(unidades.find(u => u.id === Number(e.target.value)))}
                            className="form-input"
                        >
                            <option value="">Selecione</option>
                            {unidades.map(u => <option key={u.id} value={String(u.id)}>{u.sucinto}</option>)}
                        </select>
                    </div>
                    <div>
                        <label>Primeira Testemunha</label>
                        <AutoComplete
                            value={contrato.testemunha1 as AutoCompleteOption | undefined}
                            onChange={p => handleTestemunhaSelect(p, 1)}
                            fetchOptions={loadTestemunhas}
                            minChars={3}
                            placeholder="Digite 3+ caracteres..."
                        />
                    </div>
                    <div>
                        <label>Segunda Testemunha</label>
                        <AutoComplete
                            value={contrato.testemunha2 as AutoCompleteOption | undefined}
                            onChange={p => handleTestemunhaSelect(p, 2)}
                            fetchOptions={loadTestemunhas}
                            minChars={3}
                            placeholder="Digite 3+ caracteres..."
                        />
                    </div>
                </div>
            </div>
        </div>
    );

    const renderMatriculaTab = () => {
        const curriculoSelecionado = contrato.curriculo as CurriculoOption | undefined;
        return (
        <div className="matricula-tab">
            <div className="curso-info" style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', marginBottom: '20px', alignItems: 'center' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(140px, 1fr))', gap: '10px', flex: 1, minWidth: '280px' }}>
                    <div className="info-panel" style={{ background: '#fff', border: '1px solid #ddd', borderRadius: '6px', padding: '10px 12px' }}>
                        <h4 style={{ margin: '0 0 4px', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.4px', color: '#7a7a7a' }}>Curso</h4>
                        <strong style={{ fontSize: '14px', color: '#1d2025' }}>{curriculoSelecionado?.cursoNome || '—'}</strong>
                    </div>
                    <div className="info-panel" style={{ background: '#fff', border: '1px solid #ddd', borderRadius: '6px', padding: '10px 12px' }}>
                        <h4 style={{ margin: '0 0 4px', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.4px', color: '#7a7a7a' }}>Sucinto</h4>
                        <strong style={{ fontSize: '14px', color: '#1d2025' }}>{curriculoSelecionado?.sucinto || '—'}</strong>
                    </div>
                    <div className="info-panel" style={{ background: '#fff', border: '1px solid #ddd', borderRadius: '6px', padding: '10px 12px' }}>
                        <h4 style={{ margin: '0 0 4px', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.4px', color: '#7a7a7a' }}>Tipo Curso</h4>
                        <strong style={{ fontSize: '14px', color: '#1d2025' }}>{curriculoSelecionado?.tipoCurso || '—'}</strong>
                    </div>
                    <div className="info-panel" style={{ background: '#fff', border: '1px solid #ddd', borderRadius: '6px', padding: '10px 12px' }}>
                        <h4 style={{ margin: '0 0 4px', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.4px', color: '#7a7a7a' }}>Carga Horária</h4>
                        <strong style={{ fontSize: '14px', color: '#1d2025' }}>{curriculoSelecionado?.cargaHoraria ? `${curriculoSelecionado.cargaHoraria} H/A` : '—'}</strong>
                    </div>
                </div>
                <button className="btnyellow" style={{ marginLeft: 'auto' }} onClick={() => alert('Matriz curricular ainda não implementada.')}>
                    <i className="fa fa-calculator"/> Matriz Curricular
                </button>
            </div>

            <div className="filtro-busca" style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ddd', borderRadius: '4px' }}>
                <h4>Filtro Busca</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px', marginBottom: '15px' }}>
                    <div>
                        <label>Unidade</label>
                        <select value={filtro.unidadeId || ''} onChange={e => handleFiltroChange('unidadeId', e.target.value ? Number(e.target.value) : undefined)} className="form-input">
                            <option value="">Selecione</option>
                            {unidades.map(u => <option key={u.id} value={String(u.id)}>{u.sucinto}</option>)}
                        </select>
                    </div>
                    <div>
                        <label>Turno</label>
                        <select value={filtro.turnoEducacaoId || ''} onChange={e => handleFiltroChange('turnoEducacaoId', e.target.value ? Number(e.target.value) : undefined)} className="form-input">
                            <option value="">Selecione</option>
                        </select>
                    </div>
                    <div>
                        <label>Dia da Semana</label>
                        <select value={filtro.diaSemanaId || ''} onChange={e => handleFiltroChange('diaSemanaId', e.target.value ? Number(e.target.value) : undefined)} className="form-input">
                            <option value="">Selecione</option>
                        </select>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <label><input type="radio" name="tipoMatricula" value="GRUPO" checked={filtro.tipoMatricula === 'GRUPO'} onChange={() => handleTipoMatriculaChange('GRUPO')} /> Grupo</label>
                    <label><input type="radio" name="tipoMatricula" value="LIVRE" checked={filtro.tipoMatricula === 'LIVRE'} onChange={() => handleTipoMatriculaChange('LIVRE')} /> Livre</label>
                    <button className="btngrey" onClick={() => filtro.tipoMatricula === 'GRUPO' ? loadGrupos() : loadOfertasLivre()}>
                        <i className="fa fa-search"/> Filtrar
                    </button>
                </div>
            </div>

            {filtro.tipoMatricula === 'GRUPO' && (
                <div className="grupos-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '15px' }}>
                    {grupos.map(grupo => (
                        <div key={grupo.id} className={`grupo-card ${grupo.selected ? 'selected' : ''}`} onClick={() => handleGrupoSelect(grupo)} style={{ border: '1px solid #ddd', borderRadius: '4px', padding: '15px', cursor: 'pointer', background: grupo.selected ? '#e8f5e9' : 'white' }}>
                            <div className="grupo-header" style={{ fontWeight: 'bold', fontSize: '16px' }}>{grupo.grupo}</div>
                            <div className="grupo-unidade" style={{ marginTop: '5px' }}>{grupo.unidade?.sucinto}</div>
                            <div className="grupo-horario" style={{ marginTop: '5px' }}>{grupo.horario}</div>
                            <div style={{ marginTop: '15px', display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                                <button className="btnblue" style={{ width: '95px' }} onClick={e => { e.stopPropagation(); handleGrupoSelect(grupo); }}>
                                    {grupo.selected ? 'Desmarcar' : 'Marcar'}
                                </button>
                                {grupo.selected && grupo.oferecimentosSelecionado && grupo.oferecimentosSelecionado.length > 0 && (
                                    <button className="btngreen" style={{ width: '95px' }} onClick={e => { e.stopPropagation(); alert('Definir oferecimentos'); }}>
                                        Definir
                                    </button>
                                )}
                                <button className="btnyellow" style={{ width: '95px' }} onClick={e => { e.stopPropagation(); alert('Detalhes do grupo'); }}>
                                    Detalhes
                                </button>
                            </div>
                        </div>
                    ))}
                    {grupos.length === 0 && !loading && <div className="empty-state">Nenhum grupo encontrado</div>}
                    {loading && <div className="loading">Carregando grupos...</div>}
                </div>
            )}

            {filtro.tipoMatricula === 'LIVRE' && (
                <div className="ofertas-accordion">
                    {ofertasLivre.map(oferta => (
                        <div key={oferta.id} className="accordion-item" style={{ border: '1px solid #ddd', marginBottom: '10px', borderRadius: '4px' }}>
                            <div className="accordion-header" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', background: '#f5f5f5', cursor: 'pointer' }}>
                                <input type="checkbox" checked={!!oferta.selected} onChange={() => handleOfertaSelect(oferta)} disabled={oferta.disabledComponenteCurricular || oferta.disabledConflitoDia || oferta.disabledRequisito} />
                                <span className={`status ${oferta.status}`} style={{ fontWeight: 'bold', width: '100px' }}>{oferta.status}</span>
                                <span style={{ width: '80px' }}>Turma {oferta.id}</span>
                                <span style={{ width: '80px' }}>{oferta.unidade?.sucinto}</span>
                                <span style={{ flex: 1 }}>{oferta.componenteCurricular?.descricao}</span>
                                <span style={{ width: '60px' }}>{oferta.sala?.numero}</span>
                                <span style={{ width: '120px' }}>{oferta.dataInicio} - {oferta.dataFim}</span>
                                {oferta.motivo && <span className="motivo-icon" style={{ color: 'red' }} title={oferta.motivo}><i className="fa fa-help"/></span>}
                                <button className="btnyellow" onClick={() => alert('Dias da aula')}>
                                    <i className="fa fa-calendar"/>
                                </button>
                            </div>
                        </div>
                    ))}
                    {ofertasLivre.length === 0 && !loading && <div className="empty-state">Nenhuma oferta encontrada</div>}
                    {loading && <div className="loading">Carregando ofertas...</div>}
                </div>
            )}

            <div className="selecionadas-summary" style={{ marginTop: '20px', padding: '15px', background: '#f9f9f9', borderRadius: '4px' }}>
                <h4>Oferecimentos Selecionados ({matriculaSelecionadas.length})</h4>
                {renderOferecimentosTable(matriculaSelecionadas)}
            </div>
        </div>
        );
    };

    const renderMaterialTab = () => (
        <div className="material-tab" style={{ padding: '20px' }}>
            <h3>Material Escolar</h3>
            <div style={{ display: 'flex', gap: '15px', marginBottom: '15px', fontSize: '14px' }}>
                <span style={{ color: '#000', fontWeight: 'bold' }}>■ Fornecido</span>
                <span style={{ color: '#0275d8', fontWeight: 'bold' }}>■ Compra</span>
                <span style={{ color: '#5cb85c', fontWeight: 'bold' }}>■ Estoque</span>
                <span style={{ color: '#f0ad4e', fontWeight: 'bold' }}>■ Solicitado</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '15px' }}>
                {materialContrato.map((item, idx) => (
                    <div key={idx} style={{ border: '1px solid #ddd', borderRadius: '4px', padding: '15px', background: '#fff' }}>
                        <div style={{ fontWeight: 'bold', marginBottom: '10px' }}>{item.nome}</div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                            <span>Valor:</span>
                            <strong>R$ {Number(item.valor || 0).toFixed(2)}</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                            <span>Quantidade:</span>
                            <input
                                type="number"
                                min={1}
                                value={item.quantidade || 1}
                                onChange={(e) => {
                                    const val = Math.max(1, Number(e.target.value));
                                    setMaterialContrato(prev => prev.map((m, i) => i === idx ? {...m, quantidade: val} : m));
                                }}
                                style={{ width: '60px', padding: '4px' }}
                            />
                        </div>
                        <div style={{ fontSize: '12px', display: 'flex', gap: '5px', marginBottom: '10px' }}>
                            <span style={{ color: '#000' }}>({item.quantidadeCurso || 0})</span>
                            <span style={{ color: '#0275d8' }}>({item.quantidadeCompra || 0})</span>
                            <span style={{ color: '#5cb85c' }}>({item.quantidadeEstoque || 0})</span>
                            <span style={{ color: '#f0ad4e' }}>({item.quantidadeSolicitado || 0})</span>
                        </div>
                        <button
                            className="btnred"
                            style={{ width: '100%', padding: '6px' }}
                            onClick={() => setMaterialContrato(prev => prev.filter((_, i) => i !== idx))}
                        >
                            Remover
                        </button>
                    </div>
                ))}
                {materialContrato.length === 0 && <p>Nenhum material adicionado ao contrato.</p>}
            </div>
        </div>
    );

    const renderValoresCursoTab = () => (
        <div className="valores-curso-tab">
            <div className="form-section">
                <h3>Informações de Valores</h3>

                {renderOferecimentosTable(matriculaSelecionadas)}

                <div className="table_form" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px', margin: '15px 0' }}>
                    <div>
                        <label>Forma de Pagamento *</label>
                        <select className="form-input" value={formaPagamento ? String(formaPagamento.id) : ''}
                                onChange={e => handleFormaPagamentoChange(formaPagamentos.find(f => f.id === Number(e.target.value)))}>
                            <option value="">Selecione</option>
                            {formaPagamentos.filter(f => f.ativo).map(f => (
                                <option key={f.id} value={String(f.id)}>
                                    {f.vezes}X - Juros:{f.juros ?? 0}% - Desconto: {f.desconto ?? 0}%
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label>Pagamento primeira parcela *</label>
                        <input type="date" className="form-input" value={dataPrimeiraParcela}
                               onChange={e => handleDataPrimeiraParcelaChange(e.target.value)} />
                    </div>
                    <div>
                        <label>Pagamento segunda parcela</label>
                        <select className="form-input" value={dataSegundaParcela}
                                onChange={e => setDataSegundaParcela(e.target.value)}>
                            <option value="">Selecione</option>
                            {diasSegundaParcela.map(d => <option key={d} value={d}>{formatDate(d)}</option>)}
                        </select>
                    </div>
                    <div>
                        <label>Valor do Curso</label>
                        <strong>R$ {valorCurso.toFixed(2)}</strong>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
                    <button type="button" className="btnyellow" disabled={!formaPagamento?.ajuste}
                            onClick={() => alert('Ajuste de parcelas ainda não implementado.')}>
                        <i className="fa fa-dollar"/> Ajuste parcela
                    </button>
                    <button type="button" className="btnred" onClick={() => alert('Bolsa de estudos ainda não implementada.')}>
                        <i className="fa fa-gift"/> Bolsa estudos
                    </button>
                    <button type="button" className="btngreen" disabled={parcelas.length === 0}
                            onClick={() => alert('Taxas adicionais ainda não implementadas.')}>
                        <i className="fa fa-plus"/> Taxas
                    </button>
                </div>

                <h4>Parcelas Selecionadas</h4>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: '#f0f0f0' }}>
                                <th style={{ padding: '8px', textAlign: 'left' }}>Descrição</th>
                                <th style={{ padding: '8px', textAlign: 'left' }}>Parcela</th>
                                <th style={{ padding: '8px', textAlign: 'left' }}>Data Vencimento</th>
                                <th style={{ padding: '8px', textAlign: 'right' }}>Valor R$</th>
                            </tr>
                        </thead>
                        <tbody>
                            {parcelas.map(p => (
                                <tr key={p.parcela}>
                                    <td style={{ padding: '8px' }}>{p.descricao}</td>
                                    <td style={{ padding: '8px' }}>{p.parcela}</td>
                                    <td style={{ padding: '8px' }}>{formatDate(p.dataVencimento)}</td>
                                    <td style={{ padding: '8px', textAlign: 'right' }}>{p.valor.toFixed(2)}</td>
                                </tr>
                            ))}
                            {parcelas.length === 0 && (
                                <tr><td colSpan={4} style={{ padding: '8px' }}>Nenhuma parcela calculada. Selecione a forma de pagamento.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );

    const renderValoresMaterialTab = () => {
        const totalQtde = materialContrato.reduce((acc: number, m: any) => acc + (Number(m.quantidade) || 1), 0);
        const totalValor = materialContrato.reduce((acc: number, m: any) => acc + ((Number(m.valor) || 0) * (Number(m.quantidade) || 1)), 0);
        return (
            <div className="valores-material-tab">
                <div className="table_form" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px', margin: '15px 0' }}>
                    <div>
                        <label>Forma de Pagamento (Material)</label>
                        <select className="form-input" value={materialFormaPagamento ? String(materialFormaPagamento.id) : ''}
                                onChange={e => setMaterialFormaPagamento(formaPagamentos.find(f => f.id === Number(e.target.value)) ?? null)}>
                            <option value="">Selecione</option>
                            {formaPagamentos.filter(f => f.ativo).map(f => (
                                <option key={f.id} value={String(f.id)}>
                                    {f.vezes}X - Juros:{f.juros ?? 0}% - Desconto: {f.desconto ?? 0}%
                                </option>
                            ))}
                        </select>
                    </div>
                    {materialFormaPagamento && materialFormaPagamento.vezes > 0 && (
                        <div>
                            <label>Vezes</label>
                            <strong>{materialFormaPagamento.vezes}X</strong>
                        </div>
                    )}
                </div>

                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: '#f0f0f0' }}>
                                <th style={{ padding: '8px', textAlign: 'left' }}>Produto</th>
                                <th style={{ padding: '8px', textAlign: 'center' }}>Qtde</th>
                                <th style={{ padding: '8px', textAlign: 'right' }}>Valor</th>
                            </tr>
                        </thead>
                        <tbody>
                            {materialContrato.map((m, idx) => (
                                <tr key={idx}>
                                    <td style={{ padding: '8px' }}>{m.nome}</td>
                                    <td style={{ padding: '8px', textAlign: 'center' }}>{Number(m.quantidade) || 1}</td>
                                    <td style={{ padding: '8px', textAlign: 'right' }}>R$ {((Number(m.valor) || 0) * (Number(m.quantidade) || 1)).toFixed(2)}</td>
                                </tr>
                            ))}
                            {materialContrato.length === 0 && (
                                <tr><td colSpan={3} style={{ padding: '8px' }}>Nenhum material selecionado.</td></tr>
                            )}
                        </tbody>
                        <tfoot>
                            <tr>
                                <td colSpan={2} style={{ padding: '8px' }}>Quantidade total {totalQtde}</td>
                                <td style={{ padding: '8px', textAlign: 'right' }}>Valor total R$ {totalValor.toFixed(2)}</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>
        );
    };

    const renderValoresTab = () => (
        <div className="valores-tab">
            <Tabs
                tabs={[
                    { key: 'curso', label: 'Curso', content: renderValoresCursoTab() },
                    { key: 'material', label: 'Material', content: renderValoresMaterialTab() },
                ]}
                initial="curso"
            />
        </div>
    );

    const renderFinalizadaPanel = () => (
        <div className="consultor-panel" style={{ padding: '25px', maxWidth: '980px' }}>
            <h3>Finalizando Processo</h3>
            <p>Matrícula efetuada com sucesso. Clique nos botões abaixo para fazer o download dos respectivos documentos.</p>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '15px' }}>
                <button type="button" className="btnred" disabled={materialContrato.length === 0} onClick={handleBaixarCarneMaterial}>
                    <i className="fa fa-download"/> Gerar Carnê Material
                </button>
                <button type="button" className="btngreen" onClick={handleBaixarCarneMatricula}>
                    <i className="fa fa-download"/> Gerar Carnê Matrícula
                </button>
                <button type="button" className="btnblue" onClick={handleGerarContrato}>
                    <i className="fa fa-file-text-o"/> Gerar Contrato
                </button>
                <button type="button" className="btnsky" onClick={handleGerarPromissoria}>
                    <i className="fa fa-file-text-o"/> Gerar Promissória
                </button>
                <button type="button" className="btnyellow" onClick={handleDigitalizar}>
                    <i className="fa fa-camera"/> Digitalizar
                </button>
            </div>
            <div style={{ marginTop: '20px' }}>
                <button type="button" className="btnstop" onClick={handleNovaMatricula}>
                    <i className="fa fa-plus"/> Nova Matrícula
                </button>
            </div>
        </div>
    );

    if (verificaMatriculaFinalizada) {
        return (
            <PermissionGate permission="READ">
                <main className="consultor-matricula-layout">
                    {renderFinalizadaPanel()}
                </main>
            </PermissionGate>
        );
    }

    return (
        <PermissionGate permission="READ">
            <main className="consultor-matricula-layout">
                <Wizard
                    steps={[
                        {
                            key: 'contrato',
                            label: 'Contrato',
                            content: renderContratoTab(),
                            validate: validateContrato,
                        },
                        {
                            key: 'matricula',
                            label: 'Matrícula',
                            content: renderMatriculaTab(),
                            validate: validateMatricula,
                        },
                        {
                            key: 'material',
                            label: 'Material',
                            content: renderMaterialTab(),
                        },
                        {
                            key: 'valores',
                            label: 'Valores',
                            nextLabel: 'Finalizar Matrícula',
                            content: renderValoresTab(),
                            validate: validateValores,
                            onEnter: loadValorCurso,
                        },
                    ]}
                    onComplete={() => handleFinalizarMatricula()}
                />
            </main>
        </PermissionGate>
    );
}
