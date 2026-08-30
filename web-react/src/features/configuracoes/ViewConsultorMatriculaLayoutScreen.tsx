import {PermissionGate} from '../../shared/services/permissions';
import {api} from '../../shared/services/api';
import {useState, useEffect, useCallback} from 'react';
import {AutoComplete, type AutoCompleteOption} from '../../shared/components/AutoComplete';
import {Tabs} from '../../shared/components/Tabs';

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

export default function ViewConsultorMatriculaLayoutScreen() {
    const [activeTab, setActiveTab] = useState<'contrato' | 'matricula' | 'material'>('contrato');
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
            return response.data.map(toAutoCompleteOption);
        } catch (e) {
            console.error('Erro ao buscar currÃ­culos:', e);
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
            console.error('Erro ao buscar pessoas fÃ­sicas:', e);
            return [];
        }
    }, []);

    const loadPessoasJuridicas = useCallback(async (query: string): Promise<AutoCompleteOption[]> => {
        if (!query || query.length < 3) return [];
        try {
            const response = await api.get<PessoaJuridicaResponse[]>('/api/basico/pessoa-juridica/auto-complete-todos', { params: { query } });
            return response.data.map(toAutoCompleteOption);
        } catch (e) {
            console.error('Erro ao buscar pessoas jurÃ­dicas:', e);
            return [];
        }
    }, []);

    const loadTestemunhas = useCallback(async (query: string): Promise<AutoCompleteOption[]> => {
        if (!query || query.length < 3) return [];
        try {
            const response = await api.get<PessoaFisicaResponse[]>('/api/basico/pessoa-fisica/auto-complete-testemunha', { params: { query } });
            return response.data.map(toAutoCompleteOption);
        } catch (e) {
            console.error('Erro ao buscar testemunhas:', e);
            return [];
        }
    }, []);

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

    useEffect(() => {
        loadUnidades();
    }, [loadUnidades]);

    useEffect(() => {
        if (filtro.tipoMatricula === 'GRUPO') {
            loadGrupos();
        } else {
            loadOfertasLivre();
        }
    }, [filtro, loadGrupos, loadOfertasLivre]);

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
                        {contrato.financeiro ? 'COM DÃVIDAS' : 'SEM DÃVIDAS'}
                    </span>
                </div>
                <div className="info-panel">
                    <h4>Aluno</h4>
                    <span className={`status ${contrato.aluno ? 'EM_ANDAMENTO' : 'PENDENTE'}`}>
                        {contrato.aluno ? 'SIM' : 'NÃƒO'}
                    </span>
                </div>
                <div className="info-panel">
                    <h4>Atualizar Dados</h4>
                    <span className={`status ${contrato.dados ? 'PENDENTE' : 'EM_ANDAMENTO'}`}>
                        {contrato.dados ? 'SIM' : 'NÃƒO'}
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
                    <label><input type="radio" name="tipoContratante" value="fisica" checked={contrato.tipoContratante === 'fisica'} onChange={() => setContrato(prev => ({ ...prev, tipoContratante: 'fisica' }))} /> Pessoa FÃ­sica</label>
                    <label><input type="radio" name="tipoContratante" value="juridica" checked={contrato.tipoContratante === 'juridica'} onChange={() => setContrato(prev => ({ ...prev, tipoContratante: 'juridica' }))} /> Pessoa JurÃ­dica</label>
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

    const renderMatriculaTab = () => (
        <div className="matricula-tab">
            <div className="curso-info" style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', marginBottom: '20px', alignItems: 'center' }}>
                <div><strong>Curso:</strong> {contrato.curriculo ? (contrato.curriculo as AutoCompleteOption).label : 'NÃ£o selecionado'}</div>
                <button className="btnyellow" style={{ marginLeft: 'auto' }}>
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
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: '#f0f0f0' }}>
                                <th style={{ padding: '8px', textAlign: 'left' }}>Status</th>
                                <th style={{ padding: '8px', textAlign: 'left' }}>Unidade</th>
                                <th style={{ padding: '8px', textAlign: 'left' }}>Sala</th>
                                <th style={{ padding: '8px', textAlign: 'left' }}>Componente Curricular</th>
                                <th style={{ padding: '8px', textAlign: 'left' }}>C.H.</th>
                                <th style={{ padding: '8px', textAlign: 'left' }}>Data InÃ­cio - Fim</th>
                                <th style={{ padding: '8px', textAlign: 'left' }}>Professor</th>
                            </tr>
                        </thead>
                        <tbody>
                            {matriculaSelecionadas.map(o => (
                                <tr key={o.id}>
                                    <td style={{ padding: '8px' }}><span className={`status ${o.status}`}>{o.status}</span></td>
                                    <td style={{ padding: '8px' }}>{o.unidade?.sucinto}</td>
                                    <td style={{ padding: '8px' }}>{o.sala?.numero}</td>
                                    <td style={{ padding: '8px' }}>{o.componenteCurricular?.descricao}</td>
                                    <td style={{ padding: '8px' }}>{o.componenteCurricular?.cargaHoraria}H/A</td>
                                    <td style={{ padding: '8px' }}>{o.dataInicio} - {o.dataFim}</td>
                                    <td style={{ padding: '8px' }}>{o.professor?.pessoa?.pessoaFisica?.nome || o.professor?.pessoa?.pessoaJuridica?.nomeFantasia || '-'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );

    const renderMaterialTab = () => (
        <div className="material-tab" style={{ padding: '20px' }}>
            <h3>Material Escolar</h3>
            <div style={{ display: 'flex', gap: '15px', marginBottom: '15px', fontSize: '14px' }}>
                <span style={{ color: '#000', fontWeight: 'bold' }}>â–  Fornecido</span>
                <span style={{ color: '#0275d8', fontWeight: 'bold' }}>â–  Compra</span>
                <span style={{ color: '#5cb85c', fontWeight: 'bold' }}>â–  Estoque</span>
                <span style={{ color: '#f0ad4e', fontWeight: 'bold' }}>â–  Solicitado</span>
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

    return (
        <PermissionGate permission="READ">
            <main className="consultor-matricula-layout">
                <Tabs
                    tabs={[
                        { key: 'contrato', label: 'Contrato', content: renderContratoTab() },
                        { key: 'matricula', label: 'MatrÃ­cula', content: renderMatriculaTab() },
                        { key: 'material', label: 'Material', content: renderMaterialTab() },
                    ]}
                    activeKey={activeTab}
                    onChange={(k) => setActiveTab(k as any)}
                />
            </main>
        </PermissionGate>
    );
}
