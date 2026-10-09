import {useEffect, useState} from 'react';

import {useNavigate, useSearchParams} from 'react-router-dom';

import {PermissionGate} from '../../../shared/services/permissions';

import {api} from '../../../shared/services/api';

import {AutoComplete} from '../../../shared/components/AutoComplete';

import type {AutoCompleteOption} from '../../../shared/components/AutoComplete';

import {BooleanField} from '../../../shared/components/BooleanField';


const apiErrorMessage = (error: unknown): string =>
    (error as { response?: { data?: { error?: string } } })?.response?.data?.error
        ?? (error as Error)?.message
        ?? 'erro desconhecido';


const formatarData = (value: string | null | undefined): string => {
    if (!value) return '';
    const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(value));
    if (!match) return String(value);
    return `${match[3]}/${match[2]}/${match[1]}`;
};


const parseData = (value: string): string | null => {
    if (!value) return null;
    const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value);
    if (!match) return null;
    return `${match[3]}-${match[2]}-${match[1]}`;
};


type Turma = {
    id: number;
    data: string;
    oferecimentoId: number;
    grupoNome: string;
    unidadeSucinto: string;
    cursoNome: string;
    componenteCurricularDescricao: string;
    cargaHoraria: number;
    status: string;
    inscritos: number;
    vagas: number;
    diaSemanaNome: string;
    turnoDescricao: string;
    tempoAulaDescricao: string;
};


export default function ViewFeriadoFormFeriadoListScreen() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const idEdicao = searchParams.get('id');

    const [carregando, setCarregando] = useState(!!idEdicao);
    const [salvando, setSalvando] = useState(false);
    const [mensagem, setMensagem] = useState('');

    const [nome, setNome] = useState('');
    const [descricao, setDescricao] = useState('');
    const [tipoFeriao, setTipoFeriao] = useState('');
    const [dataFeriado, setDataFeriado] = useState('');
    const [nacional, setNacional] = useState(false);
    const [todosCursos, setTodosCursos] = useState(false);
    const [feriadoFixo, setFeriadoFixo] = useState(false);

    const [tipoCursos, setTipoCursos] = useState<AutoCompleteOption[]>([]);
    const [unidades, setUnidades] = useState<AutoCompleteOption[]>([]);

    const [mostrarModalTurmas, setMostrarModalTurmas] = useState(false);
    const [turmas, setTurmas] = useState<Turma[]>([]);
    const [turmasCarregando, setTurmasCarregando] = useState(false);
    const [turmasSelecionadas, setTurmasSelecionadas] = useState<Set<number>>(new Set());

    useEffect(() => {
        if (!idEdicao) return;
        let ativo = true;
        (async () => {
            try {
                const ent = (await api.get<Record<string, unknown>>(`/api/basico/feriado/${idEdicao}`)).data;
                if (!ativo) return;
                setNome(String(ent.nome ?? ''));
                setDescricao(String(ent.descricao ?? ''));
                setTipoFeriao(String(ent.tipo_feriao ?? ''));
                setDataFeriado(formatarData(ent.dt_feriado == null ? null : String(ent.dt_feriado)));
                setNacional(Boolean(ent.fl_nacional ?? false));
                setTodosCursos(Boolean(ent.fl_tipo_curso ?? false));
                setFeriadoFixo(Boolean(ent.fl_feriado_fixo ?? false));

                try {
                    const relCursos = await api.get<Array<{ id: number; descricao?: string; sucinto?: string }>>(`/api/basico/feriado/${idEdicao}/tipo-cursos`);
                    if (relCursos.data) {
                        setTipoCursos(relCursos.data.map(item => ({ id: item.id, label: item.descricao || item.sucinto || `#${item.id}` })));
                    }
                } catch { }

                try {
                    const relUnidades = await api.get<Array<{ id: number; sucinto?: string; nome?: string }>>(`/api/basico/feriado/${idEdicao}/unidades`);
                    if (relUnidades.data) {
                        setUnidades(relUnidades.data.map(item => ({ id: item.id, label: item.sucinto || item.nome || `#${item.id}` })));
                    }
                } catch { }
            } catch (erro) {
                console.error('Erro ao carregar feriado:', erro);
                alert('Não foi possível carregar o feriado para edição');
            } finally {
                if (ativo) setCarregando(false);
            }
        })();
        return () => { ativo = false; };
    }, [idEdicao]);

    const buscarTipoCursos = async (query: string): Promise<AutoCompleteOption[]> => {
        const {data} = await api.get<Array<{ id: number; label: string; descricao?: string }>>(
            '/api/educacao/tipo-curso/opcoes', {params: {query}});
        return (data ?? []).map((item) => ({id: item.id, label: item.label || item.descricao || `#${item.id}`}));
    };

    const buscarUnidades = async (query: string): Promise<AutoCompleteOption[]> => {
        const {data} = await api.get<Array<{ id: number; sucinto: string }>>(
            '/api/basico/unidade/auto-complete-unidade-usuario', {params: {query}});
        return (data ?? []).map((item) => ({id: item.id, label: item.sucinto || `#${item.id}`}));
    };

    const voltar = () => navigate('/view/feriado/listFeriado');

    const carregarTurmas = async (data: string) => {
        setTurmasCarregando(true);
        try {
            const dataFormatada = parseData(data);
            if (!dataFormatada) return;
            const {data: turmasData} = await api.get<Turma[]>(`/api/basico/feriado/turmas-por-data`, {params: {data: dataFormatada}});
            setTurmas(turmasData ?? []);
            setTurmasSelecionadas(new Set());
        } catch (error) {
            alert(`Erro ao carregar turmas: ${apiErrorMessage(error)}`);
        } finally {
            setTurmasCarregando(false);
        }
    };

    const salvar = async (voltarDepois: boolean) => {
        if (!nome.trim()) {
            alert('Informe o nome do feriado.');
            return;
        }
        if (!dataFeriado.trim()) {
            alert('Informe a data do feriado.');
            return;
        }

        if (!idEdicao) {
            await carregarTurmas(dataFeriado);
            if (turmas.length > 0) {
                setMostrarModalTurmas(true);
                return;
            }
        }

        await salvarFeriado(voltarDepois, [], []);
    };

    const salvarFeriado = async (voltarDepois: boolean, ajustarIds: number[], naoAjustarIds: number[]) => {
        setSalvando(true);
        try {
            const body = {
                nome: nome.trim(),
                descricao: descricao.trim() || null,
                tipoFeriao: tipoFeriao || null,
                dataFeriado: parseData(dataFeriado),
                nacional: nacional,
                todosCursos: todosCursos,
                feriadoFixo: feriadoFixo,
                ajustarOcorrenciaIds: ajustarIds,
                naoAjustarOcorrenciaIds: naoAjustarIds,
            };

            if (idEdicao) {
                await api.put(`/api/basico/feriado/${idEdicao}`, body);
            } else {
                await api.post('/api/basico/feriado', body);
            }

            alert('Registro salvo com sucesso.');
            setMostrarModalTurmas(false);
            if (voltarDepois) voltar();
        } catch (error) {
            alert(`Erro ao salvar o feriado: ${apiErrorMessage(error)}`);
        } finally {
            setSalvando(false);
        }
    };

    const handleManterDatas = () => salvarFeriado(true, [], []);
    const handleAjustarTodas = () => salvarFeriado(true, turmas.map(t => t.id), []);
    const handleAjustarSelecionadas = () => salvarFeriado(true, Array.from(turmasSelecionadas), turmas.filter(t => !turmasSelecionadas.has(t.id)).map(t => t.id));
    const handleNaoAjustarSelecionadas = () => salvarFeriado(true, [], Array.from(turmasSelecionadas));

    const toggleTurmaSelecao = (id: number) => {
        setTurmasSelecionadas(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    if (carregando) {
        return (
            <PermissionGate permission="READ">
                <main>
                    <h1>Feriado</h1>
                    <div className="div_form">
                        <p className="master-detail-empty">Carregando...</p>
                    </div>
                </main>
            </PermissionGate>
        );
    }

    return (
        <PermissionGate permission="READ">
            <main>
                <h1>{idEdicao ? `Editar Feriado #${idEdicao}` : 'Feriado'}</h1>
                <div className="div_form">
                    <div className="form-title">{idEdicao ? `Feriado #${idEdicao}` : 'Novo Feriado'}</div>
                    <div className="table_form">
                        <div className="form-grid">
                            <label className="form-field">
                                <span className="form-label">Id</span>
                                <input className="form-input" value={idEdicao ?? ''} disabled/>
                            </label>
                            <label className="form-field">
                                <span className="form-label">Nome *</span>
                                <input className="form-input" value={nome}
                                    onChange={(event) => { setMensagem(''); setNome(event.target.value); }}/>
                            </label>
                            <label className="form-field">
                                <span className="form-label">Descrição *</span>
                                <textarea className="form-input" rows={4} style={{gridColumn: 'span 3'}} value={descricao}
                                    onChange={(event) => setDescricao(event.target.value)}/>
                            </label>
                            <label className="form-field">
                                <span className="form-label">Data Feriado *</span>
                                <input className="form-input" placeholder="dd/mm/yyyy" maxLength={10}
                                    value={dataFeriado}
                                    onChange={(event) => { setMensagem(''); setDataFeriado(event.target.value); }}/>
                            </label>
                            <label className="form-field">
                                <span className="form-label">Feriado Fixo</span>
                                <BooleanField value={feriadoFixo} onChange={setFeriadoFixo} />
                            </label>
                            <label className="form-field">
                                <span className="form-label">Nacional (Todas Unidades)</span>
                                <BooleanField value={nacional} onChange={(v) => { setNacional(v); if (v) setUnidades([]); }} />
                            </label>
                            <label className="form-field">
                                <span className="form-label">Todos Tipos de Curso</span>
                                <BooleanField value={todosCursos} onChange={(v) => { setTodosCursos(v); if (v) setTipoCursos([]); }} />
                            </label>
                            {!todosCursos && (
                                <>
                                    <label className="form-field">
                                        <span className="form-label">Tipo Cursos</span>
                                        <AutoComplete
                                            placeholder="Digite para buscar (mínimo 3 caracteres)"
                                            multiple
                                            value={tipoCursos}
                                            onChange={setTipoCursos}
                                            fetchOptions={buscarTipoCursos}
                                        />
                                    </label>
                                </>
                            )}
                            {!nacional && (
                                <>
                                    <label className="form-field">
                                        <span className="form-label">Unidade</span>
                                        <AutoComplete
                                            placeholder="Digite para buscar (mínimo 3 caracteres)"
                                            multiple
                                            value={unidades}
                                            onChange={setUnidades}
                                            fetchOptions={buscarUnidades}
                                        />
                                    </label>
                                </>
                            )}
                        </div>
                        <div className="form-buttons">
                            <button type="button" className="btnstop" title="Salvar registro"
                                disabled={salvando || turmasCarregando} onClick={() => void salvar(true)}>
                                Gravar
                            </button>
                            <button type="button" className="btnblue" title="Salvar e continuar editando"
                                disabled={salvando || turmasCarregando} onClick={() => void salvar(false)}>
                                Salvar e Continuar
                            </button>
                            <button type="button" className="btnyellow" title="Voltar para a lista"
                                onClick={voltar} disabled={salvando || turmasCarregando}>
                                Voltar
                            </button>
                        </div>
                    </div>
                </div>

                {mostrarModalTurmas && (
                    <div className="modal-overlay" onClick={() => setMostrarModalTurmas(false)}>
                        <div className="modal form-modal" onClick={(event) => event.stopPropagation()}>
                            <div className="div_form">
                                <div className="form-title">Turmas encontradas nessa data</div>
                                {turmasCarregando ? (
                                    <p className="master-detail-empty">Carregando turmas...</p>
                                ) : turmas.length === 0 ? (
                                    <p className="master-detail-empty">Nenhuma turma encontrada para esta data.</p>
                                ) : (
                                    <>
                                        <div className="table_form">
                                            <table className="data-table" style={{width: '100%'}}>
                                                <thead>
                                                    <tr>
                                                        <th style={{width: '40px'}}><input type="checkbox" onChange={(e) => { if (e.target.checked) setTurmasSelecionadas(new Set(turmas.map(t => t.id))); else setTurmasSelecionadas(new Set()); }} /></th>
                                                        <th>Data</th>
                                                        <th>Turma</th>
                                                        <th>Grupo</th>
                                                        <th>Unidade</th>
                                                        <th>Curso</th>
                                                        <th>Componente Curricular</th>
                                                        <th>C.H.</th>
                                                        <th>Status</th>
                                                        <th>Inscritos / Vagas</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {turmas.map((turma) => (
                                                        <tr key={turma.id}>
                                                            <td><input type="checkbox" checked={turmasSelecionadas.has(turma.id)} onChange={() => toggleTurmaSelecao(turma.id)} /></td>
                                                            <td>{formatarData(turma.data)}</td>
                                                            <td>{turma.oferecimentoId}</td>
                                                            <td>{turma.grupoNome}</td>
                                                            <td>{turma.unidadeSucinto}</td>
                                                            <td>{turma.cursoNome}</td>
                                                            <td>{turma.componenteCurricularDescricao}</td>
                                                            <td>{turma.cargaHoraria} H/A</td>
                                                            <td><span className={`status${turma.status}`}>{turma.status}</span></td>
                                                            <td>{turma.inscritos} / {turma.vagas}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                        <div className="form-buttons">
                                            <button type="button" className="btnblue" disabled={salvando} onClick={handleManterDatas}>
                                                Manter datas das ofertas
                                            </button>
                                            <button type="button" className="btnstop" disabled={salvando} onClick={handleAjustarTodas}>
                                                Ajustar datas das ofertas
                                            </button>
                                            <button type="button" className="btngreen" disabled={salvando || turmasSelecionadas.size === 0} onClick={handleAjustarSelecionadas}>
                                                Ajustar ofertas selecionadas
                                            </button>
                                            <button type="button" className="btnblack" disabled={salvando || turmasSelecionadas.size === 0} onClick={handleNaoAjustarSelecionadas}>
                                                Não Ajustar ofertas selecionadas
                                            </button>
                                            <button type="button" className="btnyellow" onClick={() => setMostrarModalTurmas(false)} disabled={salvando}>
                                                Fechar
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </PermissionGate>
    );
}