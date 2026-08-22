import {useRef, useState, useEffect} from 'react';
import {api} from '../api';
import {PermissionGate} from '../permissions';
import {useAuth} from '../auth';
import {Tabs} from '../Tabs';
import {AutoComplete, type AutoCompleteOption} from '../AutoComplete';
import {legacyClassName} from '../DataTable';
import '../GestaoProfessor.css';

type Turma = {
    id: number;
    professor: string;
    grupo: string;
    curso: string;
    componenteCurricular: string;
    status: string;
};

type Ocorrencia = { id: number; data: string; ativo: boolean };

type Presenca = { id: number; ocorrenciaId: number; data: string; presenca: string };

type Aluno = { matriculaId: number; nome: string; ativo: boolean; presencas: Presenca[] };

type Caderno = { turma: Turma; ocorrencias: Ocorrencia[]; alunos: Aluno[] };

type GrauNota = {
    id: number;
    nome: string;
    descricao: string;
    numeroNota: number | null;
    qtdeNota: number;
    peso: number | null;
};

type GrauConceito = {
    id: number;
    nome: string;
    descricao: string;
    conceito: string;
    ordem: number;
    qtdeNota: number;
};

type NotaValor = { id: number; nome: string; valor: number | null };

type NotaAluno = {
    id: number;
    matriculaId: number;
    aluno: string;
    grauNotaId: number | null;
    grauConceitoId: number | null;
    nota: number | null;
    notaConceitoId: number | null;
    notas: NotaValor[];
};

type Notas = {
    turma: Turma;
    tipoGrau: string;
    notasParciais: number;
    mediaSemExame: number | null;
    mediaFinal: number | null;
    notaMaxima: number | null;
    recuperacao: boolean;
    manual: boolean;
    manualAluno: boolean;
    pesoDistinto: boolean;
    frequenciaMinima: number | null;
    grauNotas: GrauNota[];
    grauConceitos: GrauConceito[];
    avaliacoes: NotaAluno[];
};

type Registro = { id: number | null; ocorrenciaId: number; data: string; descricao: string };

type OcorrenciaAula = { id: number; data: string; aulaCoringa: boolean; aulaPresencial: boolean };

type AulaItem = { id: number; nome: string; descricao: string; ocorrenciaComponenteCurricularId: number };

type AulaAnexoItem = { id: number; aulaId: number; nome: string; anexo: string; tipo: string };

type AnexoForm = { nome: string; anexo: string; tipo: string };

const PRESENCAS: Record<string, { titulo: string; cor: string }> = {
    n: {titulo: 'Sem Registro', cor: '#000000'},
    p: {titulo: 'Presente', cor: '#32CD32'},
    m: {titulo: 'Meia Presença', cor: '#FFD700'},
    a: {titulo: 'Ausente', cor: '#FF0000'},
    t: {titulo: 'Atestado', cor: '#0000CD'},
    c: {titulo: 'Cancelado', cor: '#FFA500'},
    v: {titulo: 'Troca de turma', cor: '#8000FF'},
    r: {titulo: 'Prorrogado', cor: '#61210B'},
    i: {titulo: 'Desistente', cor: '#C71585'},
    d: {titulo: 'Atrasado', cor: '#808080'},
};

const PROXIMA: Record<string, string> = {n: 'p', p: 'm', m: 'a', a: 't', t: 'n', d: 'n'};

const clone = <T, >(value: T): T => JSON.parse(JSON.stringify(value)) as T;

function parseData(s: string): Date {
    const [d, m, y] = s.split('/').map(Number);
    return new Date(y, m - 1, d);
}

function Painel({
                    titulo,
                    colapsado,
                    onToggle,
                    children,
                }: {
    titulo: string;
    colapsado: boolean;
    onToggle: () => void;
    children: React.ReactNode;
}) {
    return (
        <div className="gp-panel">
            <div className="gp-panel-header" onClick={onToggle}>
                <span className="gp-panel-titulo">{titulo}</span>
                <span className="gp-panel-setinha">{colapsado ? '▸' : '▾'}</span>
            </div>
            {!colapsado && <div className="gp-panel-body">{children}</div>}
        </div>
    );
}

function InfoTurma({turma}: { turma: Turma }) {
    return (
        <div className="gp-info">
      <span className="gp-info-item">
        <b>Turma:</b> {turma.id}
      </span>
            <span className="gp-info-item">
        <b>Componente:</b> {turma.componenteCurricular}
      </span>
            <span className="gp-info-item">
        <b>Grupo:</b> {turma.grupo}
      </span>
            <span className="gp-info-item">
        <b>Curso:</b> {turma.curso}
      </span>
            <span className="gp-info-item">
        <b>Status:</b> <span
                className={`gp-status ${legacyClassName(turma.status) ?? ''}`.trim()}>{turma.status}</span>
      </span>
            <span className="gp-info-item">
        <b>Professor:</b> {turma.professor}
      </span>
        </div>
    );
}

function Aviso({tipo, texto}: { tipo: 'erro' | 'sucesso'; texto: string }) {
    if (!texto) return null;
    return <div className={`gp-aviso gp-aviso-${tipo}`}>{texto}</div>;
}

export default function ViewGestaoProfessorGestaoProfessorListScreen() {
    return (
        <main className="gestao-professor">
            <h1>Gestão do Professor</h1>
            <Tabs
                tabs={[
                    {key: 'gestao', label: 'Gestão', content: <GestaoTab/>},
                    {key: 'disponibilidade', label: 'Disponibilidade do Professor', content: <DisponibilidadeTab/>},
                ]}
            />
        </main>
    );
}

function GestaoTab() {
    const {session} = useAuth();
    const isAdmin = session?.hierarquia === 'ADMIN';
    const professorLogadoId = session?.professorId;

    const [professorSelecionado, setProfessorSelecionado] = useState<AutoCompleteOption | null>(null);
    const [turmas, setTurmas] = useState<Turma[]>([]);
    const [carregandoTurmas, setCarregandoTurmas] = useState(false);
    const [erro, setErro] = useState('');

    const [menuColapsado, setMenuColapsado] = useState(false);
    const [painel, setPainel] = useState<'caderno' | 'notas' | 'registro' | 'aula' | null>(null);
    const [turmaSelecionada, setTurmaSelecionada] = useState<Turma | null>(null);

    const [caderno, setCaderno] = useState<Caderno | null>(null);
    const [notas, setNotas] = useState<Notas | null>(null);
    const [registros, setRegistros] = useState<Registro[]>([]);
    const [registrosEdit, setRegistrosEdit] = useState<Registro[]>([]);

    const [ocorrenciasAula, setOcorrenciasAula] = useState<OcorrenciaAula[]>([]);
    const [ocorrenciaAulaSel, setOcorrenciaAulaSel] = useState<number | null>(null);
    const [aulasDaOcorrencia, setAulasDaOcorrencia] = useState<AulaItem[]>([]);
    const [anexosDaAula, setAnexosDaAula] = useState<Record<number, AulaAnexoItem[]>>({});
    const [aulaForm, setAulaForm] = useState<{ id: number | null; nome: string; descricao: string; anexos: AnexoForm[] }>({
        id: null,
        nome: '',
        descricao: '',
        anexos: [],
    });
    const [salvandoAula, setSalvandoAula] = useState(false);

    const [tipoLista, setTipoLista] = useState<'0' | '1' | '2'>('1');
    const [qtdDias, setQtdDias] = useState(0);
    const [todasChamadas, setTodasChamadas] = useState(false);
    const cadernoOriginal = useRef<Caderno | null>(null);

    const [salvando, setSalvando] = useState(false);
    const [aviso, setAviso] = useState<{ tipo: 'erro' | 'sucesso'; texto: string }>({tipo: 'sucesso', texto: ''});

    const notificar = (tipo: 'erro' | 'sucesso', texto: string) => setAviso({tipo, texto});

    const fetchProfessores = async (query: string): Promise<AutoCompleteOption[]> => {
        const {data} = await api.get<{ id: number; nome: string }[]>(
            '/api/professor/professor/auto-complete-professor',
            {params: {query}},
        );
        return (data ?? []).map((item) => ({id: item.id, label: item.nome || `#${item.id}`}));
    };

    async function buscarTurmas(professorId: number | null) {
        setErro('');
        setCarregandoTurmas(true);
        setPainel(null);
        try {
            const {data} = await api.get<Turma[]>(professorId === null ? '/api/professor/gestao-professor/turmas' : '/api/professor/gestao-professor/turmas', {params: professorId !== null ? {professorId} : undefined});
            setTurmas(data);
            if (data.length === 0) {
                notificar(isAdmin ? 'sucesso' : 'erro', isAdmin ? 'Todas as turmas listadas.' : 'Nenhuma turma encontrada para o professor.');
            } else {
                notificar(isAdmin ? 'sucesso' : 'sucesso', isAdmin ? `${data.length} turma(s) encontrada(s).` : `${data.length} turma(s) encontrada(s).`);
            }
        } catch (e) {
            setErro('Erro ao carregar as turmas.');
        } finally {
            setCarregandoTurmas(false);
        }
    }

    async function abrirCaderno(turma: Turma) {
        setPainel('caderno');
        setTurmaSelecionada(turma);
        setAviso({tipo: 'sucesso', texto: ''});
        try {
            const {data} = await api.get<Caderno>(`/api/professor/gestao-professor/turmas/${turma.id}/caderno`);
            setCaderno(data);
            cadernoOriginal.current = clone(data);
            setTipoLista('1');
            setTodasChamadas(false);
            setQtdDias(data.ocorrencias.length);
        } catch (e) {
            notificar('erro', 'Erro ao carregar o caderno de chamada.');
        }
    }

    async function abrirNotas(turma: Turma) {
        setPainel('notas');
        setTurmaSelecionada(turma);
        setAviso({tipo: 'sucesso', texto: ''});
        try {
            const {data} = await api.get<Notas>(`/api/professor/gestao-professor/turmas/${turma.id}/notas`);
            setNotas(data);
        } catch (e) {
            notificar('erro', 'Erro ao carregar as notas.');
        }
    }

    async function abrirRegistro(turma: Turma) {
        setPainel('registro');
        setTurmaSelecionada(turma);
        setAviso({tipo: 'sucesso', texto: ''});
        try {
            const {data} = await api.get<Registro[]>(`/api/professor/gestao-professor/turmas/${turma.id}/registros`);
            setRegistros(data);
            setRegistrosEdit(clone(data));
        } catch (e) {
            notificar('erro', 'Erro ao carregar os registros de aula.');
        }
    }

    async function abrirAula(turma: Turma) {
        setPainel('aula');
        setTurmaSelecionada(turma);
        setAviso({tipo: 'sucesso', texto: ''});
        setOcorrenciaAulaSel(null);
        setAulaForm({id: null, nome: '', descricao: '', anexos: []});
        try {
            const {data} = await api.get<OcorrenciaAula[]>('/api/professor/aula/ocorrencias', {
                params: {oferecimentoId: turma.id},
            });
            setOcorrenciasAula(data);
            if (data.length === 0) notificar('erro', 'Nenhuma ocorrência encontrada para esta turma.');
        } catch (e) {
            notificar('erro', 'Erro ao carregar as ocorrências da turma.');
        }
    }

    async function selecionarOcorrenciaAula(ocorrenciaId: number) {
        setOcorrenciaAulaSel(ocorrenciaId);
        setAulaForm({id: null, nome: '', descricao: '', anexos: []});
        setAviso({tipo: 'sucesso', texto: ''});
        try {
            const {data} = await api.get<AulaItem[]>('/api/professor/aula/por-ocorrencia', {params: {ocorrenciaId}});
            setAulasDaOcorrencia(data);
        } catch (e) {
            notificar('erro', 'Erro ao carregar as aulas da ocorrência.');
        }
    }

    function editarAula(aula: AulaItem) {
        setAulaForm({id: aula.id, nome: aula.nome, descricao: aula.descricao, anexos: []});
        const anexos = anexosDaAula[aula.id] ?? [];
        if (anexos.length > 0) {
            setAulaForm({
                id: aula.id,
                nome: aula.nome,
                descricao: aula.descricao,
                anexos: anexos.map((a) => ({nome: a.nome, anexo: a.anexo, tipo: a.tipo})),
            });
        }
    }

    async function excluirAula(aula: AulaItem) {
        if (!window.confirm(`Excluir a aula "${aula.nome}"?`)) return;
        setAviso({tipo: 'sucesso', texto: ''});
        try {
            await api.delete(`/api/professor/aula/${aula.id}`);
            setAulasDaOcorrencia((prev) => prev.filter((a) => a.id !== aula.id));
            if (aulaForm.id === aula.id) setAulaForm({id: null, nome: '', descricao: '', anexos: []});
            notificar('sucesso', 'Aula excluída com sucesso.');
        } catch (e) {
            notificar('erro', 'Erro ao excluir a aula.');
        }
    }

    async function salvarAula() {
        if (!aulaForm.nome.trim() || !ocorrenciaAulaSel) {
            notificar('erro', 'Informe o nome da aula.');
            return;
        }
        setSalvandoAula(true);
        setAviso({tipo: 'sucesso', texto: ''});
        try {
            const payload = {
                nome: aulaForm.nome,
                descricao: aulaForm.descricao,
                ocorrenciaComponenteCurricularId: ocorrenciaAulaSel
            };
            let aulaId: number;
            if (aulaForm.id) {
                const {data} = await api.put<AulaItem>(`/api/professor/aula/${aulaForm.id}`, payload);
                aulaId = data.id;
            } else {
                const {data} = await api.post<AulaItem>('/api/professor/aula', payload);
                aulaId = data.id;
            }
            await salvarAnexosAula(aulaId);
            notificar('sucesso', 'Aula salva com sucesso.');
            await selecionarOcorrenciaAula(ocorrenciaAulaSel);
        } catch (e) {
            notificar('erro', 'Erro ao salvar a aula.');
        } finally {
            setSalvandoAula(false);
        }
    }

    async function salvarAnexosAula(aulaId: number) {
        if (aulaForm.anexos.length === 0) return;
        for (const a of aulaForm.anexos) {
            if (!a.nome.trim()) continue;
            await api.post('/api/professor/aula-anexo', {aulaId, nome: a.nome, anexo: a.anexo, tipo: a.tipo});
        }
        try {
            const {data} = await api.get<AulaAnexoItem[]>('/api/professor/aula-anexo/por-aula', {params: {aulaId}});
            setAnexosDaAula((prev) => ({...prev, [aulaId]: data}));
        } catch (e) {
            // silencioso: apenas anexos são recarregados
        }
    }

    const colunasVisiveis = (() => {
        if (!caderno) return [];
        return todasChamadas ? caderno.ocorrencias : caderno.ocorrencias.slice(0, qtdDias);
    })();

    const alunosFiltrados = (() => {
        if (!caderno) return [];
        return caderno.alunos.filter((a) => (tipoLista === '0' ? true : tipoLista === '1' ? a.ativo : !a.ativo));
    })();

    function alternarPresenca(aluno: Aluno, presenca: Presenca) {
        if (!caderno) return;
        const proxima = PROXIMA[presenca.presenca];
        if (!proxima) return;
        setCaderno({
            ...caderno,
            alunos: caderno.alunos.map((a) =>
                a.matriculaId === aluno.matriculaId
                    ? {
                        ...a,
                        presencas: a.presencas.map((p) =>
                            p.ocorrenciaId === presenca.ocorrenciaId ? {...p, presenca: proxima} : p,
                        ),
                    }
                    : a,
            ),
        });
    }

    async function salvarChamada() {
        if (!caderno || !turmaSelecionada) return;
        const orig = cadernoOriginal.current;
        const alteradas: { id: number; matriculaId: number; ocorrenciaId: number; presenca: string }[] = [];
        for (const aluno of caderno.alunos) {
            for (const p of aluno.presencas) {
                const anterior = orig?.alunos.find((a) => a.matriculaId === aluno.matriculaId)?.presencas.find(
                    (x) => x.ocorrenciaId === p.ocorrenciaId,
                )?.presenca;
                if (anterior !== p.presenca) {
                    alteradas.push({
                        id: p.id,
                        matriculaId: aluno.matriculaId,
                        ocorrenciaId: p.ocorrenciaId,
                        presenca: p.presenca
                    });
                }
            }
        }
        if (alteradas.length === 0) {
            notificar('erro', 'Nenhuma presença foi alterada.');
            return;
        }
        setSalvando(true);
        try {
            await api.post(`/api/professor/gestao-professor/turmas/${turmaSelecionada.id}/caderno/salvar`, {
                usuarioId: null,
                presencas: alteradas,
            });
            notificar('sucesso', 'Chamada salva com sucesso.');
            await abrirCaderno(turmaSelecionada);
        } catch (e) {
            notificar('erro', 'Erro ao salvar a chamada.');
        } finally {
            setSalvando(false);
        }
    }

    function atualizarNotaAvaliacao(avaId: number, campo: 'nota' | 'notaConceitoId', valor: number | null) {
        if (!notas) return;
        setNotas({
            ...notas,
            avaliacoes: notas.avaliacoes.map((a) => (a.id === avaId ? {...a, [campo]: valor} : a)),
        });
    }

    function atualizarNotaValor(avaId: number, notaId: number, valor: number | null) {
        if (!notas) return;
        setNotas({
            ...notas,
            avaliacoes: notas.avaliacoes.map((a) =>
                a.id === avaId
                    ? {...a, notas: a.notas.map((n) => (n.id === notaId ? {...n, valor} : n))}
                    : a,
            ),
        });
    }

    async function salvarNotas() {
        if (!notas || !turmaSelecionada) return;
        setSalvando(true);
        try {
            await api.post(`/api/professor/gestao-professor/turmas/${turmaSelecionada.id}/notas/salvar`, {
                avaliacoes: notas.avaliacoes.map((a) => ({
                    id: a.id,
                    nota: a.nota,
                    notaConceitoId: a.notaConceitoId,
                    notas: a.notas.map((n) => ({id: n.id, valor: n.valor})),
                })),
            });
            notificar('sucesso', 'Notas alteradas com sucesso.');
        } catch (e) {
            notificar('erro', 'Erro ao salvar as notas.');
        } finally {
            setSalvando(false);
        }
    }

    async function salvarRegistros() {
        if (!turmaSelecionada) return;
        setSalvando(true);
        try {
            await api.post(`/api/professor/gestao-professor/turmas/${turmaSelecionada.id}/registros/salvar`, {
                registros: registrosEdit,
            });
            notificar('sucesso', 'Aula registrada com sucesso.');
        } catch (e) {
            notificar('erro', 'Erro ao salvar os registros de aula.');
        } finally {
            setSalvando(false);
        }
    }

    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    return (
        <div>
            <div className="gp-procurar">
<AutoComplete
        id="gp-professor"
        label="Professor:"
        placeholder="Digite ao menos 3 caracteres..."
        value={professorSelecionado}
        onChange={setProfessorSelecionado}
        fetchOptions={fetchProfessores}
    />
    <button
        className="gp-btn gp-btn-procurar"
        onClick={() => {
            if (isAdmin) {
                buscarTurmas(null);
            } else if (professorSelecionado) {
                buscarTurmas(professorSelecionado.id);
            } else {
                notificar('erro', 'Selecione um professor.');
            }
        }}
        disabled={carregandoTurmas || (!isAdmin && !professorSelecionado)}
    >
        {carregandoTurmas ? 'Buscando...' : 'Buscar'}
    </button>
            </div>
            <Aviso tipo={erro ? 'erro' : aviso.tipo} texto={erro || aviso.texto}/>

            <Painel
                titulo="Menu Turmas"
                colapsado={menuColapsado}
                onToggle={() => setMenuColapsado(!menuColapsado)}
            >
                <div className="gp-table-wrap">
                    <table className="gp-table">
                        <thead>
                        <tr>
                            <th>Turma</th>
                            <th>Professor</th>
                            <th>Grupo</th>
                            <th>Curso</th>
                            <th>Componente Curricular</th>
                            <th>Status</th>
                            <th>Ações</th>
                        </tr>
                        </thead>
                        <tbody>
                        {turmas.map((t) => (
                            <tr key={t.id}>
                                <td>{t.id}</td>
                                <td>{t.professor}</td>
                                <td>{t.grupo}</td>
                                <td>{t.curso}</td>
                                <td>{t.componenteCurricular}</td>
                                <td>
                                    <span
                                        className={`gp-status ${legacyClassName(t.status) ?? ''}`.trim()}>{t.status}</span>
                                </td>
                                <td className="gp-acoes">
                                    {(t.status === 'EM_ANDAMENTO' || t.status === 'FINALIZADA') && (
                                        <>
                                            <button className="gp-btn gp-btn-acoes" title="Caderno chamada"
                                                    onClick={() => abrirCaderno(t)}>
                                                📖
                                            </button>
                                            <button className="gp-btn gp-btn-acoes" title="Notas"
                                                    onClick={() => abrirNotas(t)}>
                                                ✏️
                                            </button>
                                            <button className="gp-btn gp-btn-acoes" title="Registros de aula"
                                                    onClick={() => abrirRegistro(t)}>
                                                📄
                                            </button>
                                            <button className="gp-btn gp-btn-acoes" title="Aulas"
                                                    onClick={() => abrirAula(t)}>
                                                🎬
                                            </button>
                                        </>
                                    )}
                                </td>
                            </tr>
                        ))}
                        {turmas.length === 0 && (
                            <tr>
                                <td colSpan={7} className="gp-vazio">
                                    Nenhum registro.
                                </td>
                            </tr>
                        )}
                        </tbody>
                    </table>
                </div>
            </Painel>

            {painel === 'caderno' && caderno && (
                <Painel titulo="Caderno de Chamada" colapsado={false} onToggle={() => undefined}>
                    <InfoTurma turma={caderno.turma}/>
                    <div className="gp-caderno-conteudo">
                        <div className="gp-caderno-lateral">
                            <div className="gp-legend">
                                {Object.entries(PRESENCAS).map(([k, v]) => (
                                    <span key={k} className="gp-legenda-item">
                                        <span className="gp-dot-legenda" style={{background: v.cor}}/>
                                        {v.titulo}
                                    </span>
                                ))}
                            </div>
                        </div>
                        <div className="gp-caderno-principal">
                            <div className="gp-control-group gp-filtros">
                                <span className="gp-control-label">Alunos</span>
                                <label>
                                    <input type="radio" checked={tipoLista === '0'}
                                           onChange={() => setTipoLista('0')}/> Todos
                                </label>
                                <label>
                                    <input type="radio" checked={tipoLista === '1'}
                                           onChange={() => setTipoLista('1')}/> Ativos
                                </label>
                                <label>
                                    <input type="radio" checked={tipoLista === '2'}
                                           onChange={() => setTipoLista('2')}/> Inativos
                                </label>
                            </div>
                            <div className="gp-control-group">
                                <label htmlFor="gp-dias" className="gp-control-label">
                                    Dias exibir
                                </label>
                                <input
                                    id="gp-dias"
                                    type="number"
                                    min={0}
                                    max={caderno.ocorrencias.length}
                                    value={qtdDias}
                                    onChange={(e) => {
                                        const v = Number(e.target.value);
                                        setQtdDias(Number.isNaN(v) ? 0 : Math.max(0, Math.min(caderno.ocorrencias.length, v)));
                                    }}
                                    title={`Máximo de aulas ${caderno.ocorrencias.length}`}
                                />
                            </div>
                            <div className="gp-control-group">
                                <label>
                                    <input
                                        type="checkbox"
                                        checked={todasChamadas}
                                        onChange={(e) => {
                                            setTodasChamadas(e.target.checked);
                                            if (e.target.checked) setQtdDias(caderno.ocorrencias.length);
                                        }}
                                    />{' '}
                                    Todas datas
                                </label>
                            </div>
                        </div>
                    </div>

                    <div className="gp-table-wrap gp-scroll">
                        <table className="gp-table gp-grid">
                            <thead>
                            <tr>
                                <th className="gp-col-aluno">Alunos</th>
                                {colunasVisiveis.map((col) => (
                                    <th key={col.id} className="gp-col-data">
                                        {col.data}
                                    </th>
                                ))}
                            </tr>
                            </thead>
                            <tbody>
                            {alunosFiltrados.map((a) => (
                                <tr key={a.matriculaId}>
                                    <td className="gp-col-aluno">{a.nome}</td>
                                    {colunasVisiveis.map((col) => {
                                        const p = a.presencas.find((x) => x.ocorrenciaId === col.id);
                                        const desc = p ? PRESENCAS[p.presenca] : null;
                                        const bloqueado = p ? parseData(p.data) > hoje : true;
                                        return (
                                            <td key={col.id} className="gp-col-data">
                                                {p && desc && (
                                                    <button
                                                        className="gp-presenca-btn"
                                                        title={`${desc.titulo} - ${col.data}`}
                                                        disabled={bloqueado}
                                                        style={{background: desc.cor}}
                                                        onClick={() => alternarPresenca(a, p)}
                                                    />
                                                )}
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                            {alunosFiltrados.length === 0 && (
                                <tr>
                                    <td colSpan={colunasVisiveis.length + 1} className="gp-vazio">
                                        Nenhum aluno para a lista selecionada.
                                    </td>
                                </tr>
                            )}
                            </tbody>
                        </table>
                    </div>

                    <div className="gp-rodape">
                        <PermissionGate permission="CREATE">
                            <button className="gp-btn gp-btn-salvar" onClick={salvarChamada} disabled={salvando}>
                                {salvando ? 'Salvando...' : 'Salvar'}
                            </button>
                        </PermissionGate>
                    </div>
                </Painel>
            )}

            {painel === 'notas' && notas && (
                <Painel titulo="Notas" colapsado={false} onToggle={() => undefined}>
<div className="gp-notas-topo">
<InfoTurma turma={notas.turma}/>
                        <div className="gp-media">
                            <div>
                                <b>Média aprovação sem exame: </b>
                                <span>{notas.mediaSemExame ?? '-'}</span>
                            </div>
                            {notas.recuperacao && (
                                <div>
                                    <b>Média aprovação com exame: </b>
                                    <span>{notas.mediaFinal ?? '-'}</span>
                                </div>
                            )}
                            <div>
                                <b>Nota máxima: </b>
                                <span>{notas.notaMaxima ?? '-'}</span>
                            </div>
                        </div>
                    </div>

                    <div className="gp-table-wrap gp-scroll">
                        <table className="gp-table gp-grid">
                            <thead>
                            <tr>
                                <th className="gp-col-aluno">Aluno</th>
                                {notas.tipoGrau === 'n'
                                    ? notas.grauNotas.map((g) => (
                                        <th key={g.id} className="gp-col-data">
                                            {g.nome}
                                        </th>
                                    ))
                                    : notas.grauConceitos.map((g) => (
                                        <th key={g.id} className="gp-col-data">
                                            {g.nome || g.conceito}
                                        </th>
                                    ))}
                            </tr>
                            </thead>
                            <tbody>
                            {groupAvaliacoes(notas).map((aluno) => (
                                <tr key={aluno.matriculaId}>
                                    <td className="gp-col-aluno">{aluno.nome}</td>
                                    {notas.tipoGrau === 'n'
                                        ? notas.grauNotas.map((g) => {
                                            const ava = aluno.avaliacoes.find((a) => a.grauNotaId === g.id);
                                            if (!ava) return <td key={g.id} className="gp-col-data"/>;
                                            return (
                                                <td key={g.id} className="gp-col-data gp-nota-cell">
                                                    <div className="gp-nota-principal">
                                <span
                                    className={notas.mediaFinal !== null && ava.nota !== null && notas.mediaFinal > ava.nota ? 'gp-nota-red' : 'gp-nota-green'}>
                                  {fmtNumero(ava.nota)}
                                </span>
                                                        <input
                                                            type="number"
                                                            min={0}
                                                            step="0.1"
                                                            max={notas.notaMaxima ?? undefined}
                                                            value={ava.nota ?? ''}
                                                            onChange={(e) =>
                                                                atualizarNotaAvaliacao(ava.id, 'nota', e.target.value === '' ? null : Number(e.target.value))
                                                            }
                                                        />
                                                    </div>
                                                    {ava.notas.map((n) => (
                                                        <div key={n.id} className="gp-nota-parcial">
                                                            <span className="gp-nota-parcial-label">{n.nome}</span>
                                                            <input
                                                                type="number"
                                                                min={0}
                                                                step="0.1"
                                                                max={notas.notaMaxima ?? undefined}
                                                                value={n.valor ?? ''}
                                                                onChange={(e) =>
                                                                    atualizarNotaValor(ava.id, n.id, e.target.value === '' ? null : Number(e.target.value))
                                                                }
                                                            />
                                                        </div>
                                                    ))}
                                                </td>
                                            );
                                        })
                                        : notas.grauConceitos.map((g) => {
                                            const ava = aluno.avaliacoes.find((a) => a.grauConceitoId === g.id);
                                            if (!ava) return <td key={g.id} className="gp-col-data"/>;
                                            return (
                                                <td key={g.id} className="gp-col-data">
                                                    <select
                                                        value={ava.notaConceitoId ?? ''}
                                                        onChange={(e) =>
                                                            atualizarNotaAvaliacao(ava.id, 'notaConceitoId', e.target.value === '' ? null : Number(e.target.value))
                                                        }
                                                    >
                                                        <option value="">Selecione</option>
                                                        {notas.grauConceitos.map((c) => (
                                                            <option key={c.id} value={c.id}>
                                                                {c.conceito}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </td>
                                            );
                                        })}
                                </tr>
                            ))}
                            {notas.avaliacoes.length === 0 && (
                                <tr>
                                    <td colSpan={notas.tipoGrau === 'n' ? notas.grauNotas.length + 1 : notas.grauConceitos.length + 1}
                                        className="gp-vazio">
                                        Nenhuma nota cadastrada.
                                    </td>
                                </tr>
                            )}
                            </tbody>
                        </table>
                    </div>

                    <div className="gp-rodape">
                        <PermissionGate permission="UPDATE">
                            <button className="gp-btn gp-btn-salvar" onClick={salvarNotas} disabled={salvando}>
                                {salvando ? 'Salvando...' : 'Alterar'}
                            </button>
                        </PermissionGate>
                    </div>
                </Painel>
            )}

            {painel === 'registro' && turmaSelecionada && (
                <Painel titulo="Registrar de aula" colapsado={false} onToggle={() => undefined}>
                    <InfoTurma turma={turmaSelecionada}/>
                    <div className="gp-registros">
                        {registrosEdit.length > 0 && registrosEdit.map((r, idx) => (
                            <div key={`${r.ocorrenciaId}-${idx}`} className="gp-registro">
                                <div className="gp-registro-data">{r.data}</div>
                                <textarea
                                    rows={4}
                                    value={r.descricao}
                                    onChange={(e) =>
                                        setRegistrosEdit((prev) => prev.map((x, i) => (i === idx ? {
                                            ...x,
                                            descricao: e.target.value
                                        } : x)))
                                    }
                                />
                            </div>
                        ))}
                        {registrosEdit.length === 0 && <div className="gp-vazio">Nenhuma aula registrada.</div>}
                    </div>
                    <div className="gp-rodape">
                        <PermissionGate permission="CREATE">
                            <button className="gp-btn gp-btn-salvar" onClick={salvarRegistros} disabled={salvando}>
                                {salvando ? 'Salvando...' : 'Salvar'}
                            </button>
                        </PermissionGate>
                    </div>
                </Painel>
            )}

            {painel === 'aula' && turmaSelecionada && (
                <Painel titulo="Aulas" colapsado={false} onToggle={() => undefined}>
                    <InfoTurma turma={turmaSelecionada}/>
                    <div className="gp-controls">
                        <div className="gp-control-group gp-control-group-stretch">
                            <span className="gp-control-label">Ocorrência:</span>
                            <select
                                value={ocorrenciaAulaSel ?? ''}
                                onChange={(e) => e.target.value && selecionarOcorrenciaAula(Number(e.target.value))}
                            >
                                <option value="">Selecione a ocorrência...</option>
                                {ocorrenciasAula.map((o) => (
                                    <option key={o.id} value={o.id}>
                                        {o.data}
                                        {o.aulaCoringa ? ' - Aula extra' : ' - Aula normal'}
                                        {!o.aulaPresencial ? ' (remota)' : ''}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {ocorrenciaAulaSel && (
                        <div className="gp-aula-edicao">
                            <div className="gp-aula-form">
                                <label className="gp-aula-label">
                                    Nome
                                    <input
                                        type="text"
                                        value={aulaForm.nome}
                                        onChange={(e) => setAulaForm((f) => ({...f, nome: e.target.value}))}
                                        placeholder="Nome da aula"
                                    />
                                </label>
                                <label className="gp-aula-label">
                                    Descrição
                                    <textarea
                                        rows={3}
                                        value={aulaForm.descricao}
                                        onChange={(e) => setAulaForm((f) => ({...f, descricao: e.target.value}))}
                                        placeholder="Descrição / conteúdo da aula"
                                    />
                                </label>
                                <div className="gp-aula-anexos">
                                    <span className="gp-control-label">Anexos</span>
                                    {aulaForm.anexos.map((a, idx) => (
                                        <div key={idx} className="gp-aula-anexo-linha">
                                            <input
                                                type="text"
                                                value={a.nome}
                                                onChange={(e) =>
                                                    setAulaForm((f) => ({
                                                        ...f,
                                                        anexos: f.anexos.map((x, i) => (i === idx ? {
                                                            ...x,
                                                            nome: e.target.value
                                                        } : x)),
                                                    }))
                                                }
                                                placeholder="Nome do anexo"
                                            />
                                            <input
                                                type="text"
                                                value={a.anexo}
                                                onChange={(e) =>
                                                    setAulaForm((f) => ({
                                                        ...f,
                                                        anexos: f.anexos.map((x, i) => (i === idx ? {
                                                            ...x,
                                                            anexo: e.target.value
                                                        } : x)),
                                                    }))
                                                }
                                                placeholder="URL / caminho do arquivo"
                                            />
                                            <select
                                                value={a.tipo}
                                                onChange={(e) =>
                                                    setAulaForm((f) => ({
                                                        ...f,
                                                        anexos: f.anexos.map((x, i) => (i === idx ? {
                                                            ...x,
                                                            tipo: e.target.value
                                                        } : x)),
                                                    }))
                                                }
                                            >
                                                <option value="VIDEO">Vídeo</option>
                                                <option value="PDF">Documento (PDF)</option>
                                                <option value="IMAGEM">Imagem</option>
                                            </select>
                                            <button
                                                className="gp-btn gp-btn-acoes"
                                                title="Remover anexo"
                                                onClick={() =>
                                                    setAulaForm((f) => ({
                                                        ...f,
                                                        anexos: f.anexos.filter((_, i) => i !== idx)
                                                    }))
                                                }
                                            >
                                                ✖
                                            </button>
                                        </div>
                                    ))}
                                    <button
                                        className="gp-btn gp-btn-acoes"
                                        onClick={() => setAulaForm((f) => ({
                                            ...f,
                                            anexos: [...f.anexos, {nome: '', anexo: '', tipo: 'VIDEO'}]
                                        }))}
                                    >
                                        ➕ Anexo
                                    </button>
                                </div>
                                <div className="gp-rodape">
                                    <PermissionGate permission="CREATE">
                                        <button className="gp-btn gp-btn-salvar" onClick={salvarAula}
                                                disabled={salvandoAula}>
                                            {salvandoAula ? 'Salvando...' : aulaForm.id ? 'Alterar aula' : 'Salvar aula'}
                                        </button>
                                    </PermissionGate>
                                    {aulaForm.id && (
                                        <button className="gp-btn gp-btn-salvar" onClick={() => setAulaForm({
                                            id: null,
                                            nome: '',
                                            descricao: '',
                                            anexos: []
                                        })}>
                                            Nova aula
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className="gp-table-wrap">
                                <table className="gp-table">
                                    <thead>
                                    <tr>
                                        <th>Nome</th>
                                        <th>Descrição</th>
                                        <th>Anexos</th>
                                        <th>Ações</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {aulasDaOcorrencia.map((aula) => (
                                        <tr key={aula.id}>
                                            <td>{aula.nome}</td>
                                            <td>{aula.descricao}</td>
                                            <td>
                                                {(anexosDaAula[aula.id] ?? []).map((anexo) => (
                                                    <span key={anexo.id} className="gp-anexo-chip">
                                                        {anexo.tipo}: {anexo.nome}
                                                    </span>
                                                ))}
                                                {(anexosDaAula[aula.id] ?? []).length === 0 &&
                                                <span className="gp-vazio">—</span>}
                                            </td>
                                            <td className="gp-acoes">
                                                <button className="gp-btn gp-btn-acoes" title="Editar"
                                                        onClick={() => editarAula(aula)}>
                                                    ✏️
                                                </button>
                                                <button className="gp-btn gp-btn-acoes" title="Excluir"
                                                        onClick={() => excluirAula(aula)}>
                                                    🗑️
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {aulasDaOcorrencia.length === 0 && (
                                        <tr>
                                            <td colSpan={4} className="gp-vazio">
                                                Nenhuma aula registrada nesta ocorrência.
                                            </td>
                                        </tr>
                                    )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                    {ocorrenciasAula.length === 0 && <div className="gp-vazio">Nenhuma ocorrência encontrada.</div>}
                </Painel>
            )}
        </div>
    );
}

function groupAvaliacoes(notas: Notas): { matriculaId: number; nome: string; avaliacoes: NotaAluno[] }[] {
    const mapa = new Map<number, { matriculaId: number; nome: string; avaliacoes: NotaAluno[] }>();
    for (const ava of notas.avaliacoes) {
        const grupo = mapa.get(ava.matriculaId);
        if (grupo) {
            grupo.avaliacoes.push(ava);
        } else {
            mapa.set(ava.matriculaId, {matriculaId: ava.matriculaId, nome: ava.aluno, avaliacoes: [ava]});
        }
    }
    return [...mapa.values()];
}

function fmtNumero(v: number | null | undefined): string {
    return v === null || v === undefined ? '-' : String(v);
}

function DisponibilidadeTab() {
    return (
        <div className="gp-disponibilidade">
            <div className="gp-legenda">
        <span className="gp-legenda-item">
          <span className="gp-dot" style={{background: '#32CD32'}}/> Esta disponível
        </span>
                <span className="gp-legenda-item">
          <span className="gp-dot" style={{background: '#FFD700'}}/> Aula coringa
        </span>
                <span className="gp-legenda-item">
          <span className="gp-dot" style={{background: '#000000'}}/> Aula normal
        </span>
                <span className="gp-legenda-item">
          <span className="gp-dot" style={{background: '#FF0000'}}/> Recuperação aula
        </span>
                <span className="gp-legenda-item">
          <span className="gp-dot" style={{background: '#0000CD'}}/> Feriado
        </span>
            </div>
            <p>
                A agenda de disponibilidade do professor é exibida a partir do usuário logado no sistema legado. Para
                visualizá-la
                aqui, informe o professor acima e utilize a grade de horários (requer integração com o contexto de
                login).
            </p>
        </div>
    );
}
