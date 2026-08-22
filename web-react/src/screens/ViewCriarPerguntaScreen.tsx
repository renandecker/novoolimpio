import {useRef, useState, useEffect} from 'react';
import {api} from '../api';
import {PermissionGate} from '../permissions';
import {useAuth} from '../auth';
import {Tabs} from '../Tabs';
import {AutoComplete, type AutoCompleteOption} from '../AutoComplete';

type RespostaTipo = 'SELECAO' | 'ESCOLHA' | 'TEXTO' | 'ARQUIVO';

type OpcaoResposta = { id: number; nome: string };

type AvaliacaoPergunta = {
    id: number;
    pergunta: string;
    tipo: RespostaTipo;
    opcoes: OpcaoResposta[];
    respostaTexto: string | null;
    respostaEscolhidaId: number | null;
    anexos: { id: number; nome: string; anexo: string; tipo: string }[];
};

type AvaliacaoPerguntaForm = {
    pergunta: string;
    tipo: RespostaTipo;
    opcoes: OpcaoResposta[];
    respostaTexto: string;
    respostaEscolhidaId: number | null;
    anexos: { id: number; nome: string; anexo: string; tipo: string }[];
};

const tiposOpcoes: Record<RespostaTipo, string> = {
    SELECAO: 'Seleção Múltipla',
    ESCOLHA: 'Escolha Única',
    TEXTO: 'Texto Livre',
    ARQUIVO: 'Arquivo',
};

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

export default function ViewCriarPerguntaScreen() {
    const {session} = useAuth();
    const isAdmin = session?.hierarquia === 'ADMIN';

    const [pergunta, setPergunta] = useState('');
    const [tipo, setTipo] = useState<RespostaTipo>('TEXTO');
    const [opcoes, setOpcoes] = useState<OpcaoResposta[]>([]);
    const [respostaTexto, setRespostaTexto] = useState('');
    const [respostaEscolhidaId, setRespostaEscolhidaId] = useState<number | null>(null);
    const [anexos, setAnexos] = useState<{ id: number; nome: string; anexo: string; tipo: string }[]>([]);
    const [salvando, setSalvando] = useState(false);

    const [opcaoNova, setOpcaoNova] = useState({nome: ''});

    const alternarTipo = (novoTipo: RespostaTipo) => {
        setTipo(novoTipo);
        if (novoTipo !== 'TEXTO' && novoTipo !== 'ARQUIVO') {
            setRespostaEscolhidaId(novoTipo === 'ESCOLHA' ? null : respostaEscolhidaId);
        }
    };

    const adicionarOpcao = () => {
        if (opcaoNova.nome.trim()) {
            setOpcoes([...opcoes, { id: Date.now(), nome: opcaoNova.nome }]);
            setOpcaoNova({nome: ''});
        }
    };

    const removerOpcao = (id: number) => {
        setOpcoes(opcoes.filter((o) => o.id !== id));
    };

    const adicionarAnexo = () => {
        setAnexos([...anexos, { id: Date.now(), nome: '', anexo: '', tipo: 'PDF' }]);
    };

    const removerAnexo = (id: number) => {
        setAnexos(anexos.filter((a) => a.id !== id));
    };

    async function salvarPergunta() {
        setSalvando(true);
        try {
            const payload = {
                pergunta,
                tipo,
                opcoes: opcoes.map((o) => ({nome: o.nome})),
                respostaTexto,
                respostaEscolhidaId,
                anexos,
            };
            const {data} = await api.post<AvaliacaoPergunta>('/api/professor/avaliacao-pergunta', payload);
            notificar('sucesso', 'Pergunta salva com sucesso.');
            limparFormulario();
        } catch (e) {
            notificar('erro', 'Erro ao salvar a pergunta.');
        } finally {
            setSalvando(false);
        }
    }

    function limparFormulario() {
        setPergunta('');
        setTipo('TEXTO');
        setOpcoes([]);
        setRespostaTexto('');
        setRespostaEscolhidaId(null);
        setAnexos([]);
    }

    return (
        <main className="gestao-professor">
            <h1>Criar Pergunta</h1>
            <Tabs
                tabs={[
                    {key: 'criar', label: 'Criar Pergunta', content: <CriarPergunta/>},
                    {key: 'listar', label: 'Listar Perguntas', content: <ListarPerguntas/>},
                ]}
            />
        </main>
    );
}

function CriarPergunta() {
    return (
        <div>
            <div className="gp-procurar">
                <AutoComplete
                    id="gp-pergunta"
                    label="Pergunta:"
                    placeholder="Digite a pergunta..."
                    value={pergunta}
                    onChange={setPergunta}
                    fetchOptions={(query: string) => Promise.resolve([])}
                />
            </div>

            <div className="gp-controls">
                <div className="gp-control-group">
                    <span className="gp-control-label">Tipo:</span>
                    <select
                        value={tipo}
                        onChange={(e) => setTipo(e.target.value as RespostaTipo)}
                    >
                        <option value="SELECAO">Seleção Múltipla</option>
                        <option value="ESCOLHA">Escolha Única</option>
                        <option value="TEXTO">Texto Livre</option>
                        <option value="ARQUIVO">Arquivo</option>
                    </select>
                </div>

                <div className="gp-control-group">
                    <span className="gp-control-label">Pergunta</span>
                    <textarea
                        rows={3}
                        value={pergunta}
                        onChange={(e) => setPergunta(e.target.value)}
                        placeholder="Digite a pergunta"
                    />
                </div>
            </div>

            {tipo === 'SELECAO' || tipo === 'ESCOLHA'} && (
                <div className="gp-control-group">
                    <span className="gp-control-label">Opções de Resposta</span>
                    {opcoes.map((opcao, idx) => (
                        <div key={idx} className="gp-opcao-linha">
                            <input
                                type="text"
                                value={opcao.nome}
                                onChange={(e) =>
                                    setOpcoes(
                                        opcoes.map((o, i) =>
                                            i === idx ? {...o, nome: e.target.value} : o
                                        )
                                    )
                                }
                            />
                            <button
                                className="gp-btn gp-btn-acoes"
                                onClick={() => removerOpcao(opcao.id)}
                                title="Remover opção"
                            >
                                ✖
                            </button>
                        </div>
                    ))}
                    <button
                        className="gp-btn gp-btn-acoes"
                        onClick={() => setOpcaoNova({nome: ''})}
                        title="Adicionar opção"
                    >
                        ➕
                    </button>
                </div>
            )

            {tipo === 'TEXTO'} && (
                <div className="gp-control-group">
                    <span className="gp-control-label">Resposta Texto</span>
                    <textarea
                        rows={3}
                        value={respostaTexto}
                        onChange={(e) => setRespostaTexto(e.target.value)}
                        placeholder="Digite a resposta (opcional)"
                    />
                </div>
            )

            {tipo === 'ESCOLHA'} && respostaEscolhidaId !== null && (
                <div className="gp-control-group">
                    <span className="gp-control-label">Resposta Escolhida</span>
                    <p>ID da resposta escolhida: {respostaEscolhidaId}</p>
                </div>
            )

            {tipo === 'ARQUIVO'} && (
                <div className="gp-control-group">
                    <span className="gp-control-label">Anexos</span>
                    <button className="gp-btn gp-btn-acoes" onClick={adicionarAnexo} title="Adicionar anexo">
                        ➕ Anexo
                    </button>
                    {anexos.map((a, idx) => (
                        <div key={idx} className="gp-anexo-chip">
                            {a.tipo}: {a.nome}
                            <button
                                className="gp-btn gp-btn-acoes"
                                onClick={() => removerAnexo(a.id)}
                                title="Remover anexo"
                            >
                                ✖
                            </button>
                        </div>
                    ))}
                </div>
            )

            <div className="gp-rodape">
                <PermissionGate permission="CREATE">
                    <button className="gp-btn gp-btn-salvar" onClick={salvarPergunta} disabled={salvando}>
                        {salvando ? 'Salvando...' : 'Salvar Pergunta'}
                    </button>
                </PermissionGate>
            </div>
        </div>
    );
}

function ListarPerguntas() {
    const {session} = useAuth();
    const isAdmin = session?.hierarquia === 'ADMIN';

    const [perguntas, setPerguntas] = useState<AvaliacaoPergunta[]>([]);
    const [carregando, setCarregando] = useState(false);

    const carregarPerguntas = async () => {
        setCarregando(true);
        try {
            const {data} = await api.get<AvaliacaoPergunta[]>(
                '/api/professor/avaliacao-pergunta',
                isAdmin ? {} : {params: {professorId: session?.id}}
            );
            setPerguntas(data);
        } catch (e) {
            notificar('erro', 'Erro ao carregar perguntas.');
        } finally {
            setCarregando(false);
        }
    };

    return (
        <div>
            <button
                className="gp-btn gp-btn-procurar"
                onClick={carregarPerguntas}
                disabled={carregando}
            >
                {carregando ? 'Carregando...' : 'Carregar Perguntas'}
            </button>

            <Aviso tipo={''} texto={''}/>

            {perguntas.length > 0 && (
                <table className="gp-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Pergunta</th>
                            <th>Tipo</th>
                            <th>Opções</th>
                            <th>Anexos</th>
                            <th>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {perguntas.map((p) => (
                            <tr key={p.id}>
                                <td>{p.id}</td>
                                <td>{p.pergunta}</td>
                                <td>{tiposOpcoes[p.tipo]}</td>
                                <td>
                                    {p.opcoes.map((o) => (
                                        <span key={o.id} className="gp-anexo-chip">
                                            {o.nome}
                                        </span>
                                    ))}
                                </td>
                                <td>
                                    {p.anexos.map((a) => (
                                        <span key={a.id} className="gp-anexo-chip">
                                            {a.tipo}: {a.nome}
                                        </span>
                                    ))}
                                </td>
                                <td>
                                    <button className="gp-btn gp-btn-acoes" title="Editar">✏️</button>
                                    <button className="gp-btn gp-btn-acoes" title="Excluir">🗑️</button>
                                </td>
                            </tr>
                        ))}
                        {perguntas.length === 0 && (
                            <tr>
                                <td colSpan={6} className="gp-vazio">
                                    Nenhuma pergunta cadastrada.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            )}
        </div>
    );
}