import {useState} from 'react';
import {api} from '../api';
import {PermissionGate} from '../permissions';
import {useAuth} from '../auth';
import {Tabs} from '../Tabs';
import {AutoComplete} from '../AutoComplete';
import {ExportDropdown} from '../ExportDropdown';

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

const tiposOpcoes: Record<RespostaTipo, string> = {
    SELECAO: 'Seleção Múltipla',
    ESCOLHA: 'Escolha Única',
    TEXTO: 'Texto Livre',
    ARQUIVO: 'Arquivo',
};

function Aviso({tipo, texto}: { tipo: 'erro' | 'sucesso'; texto: string }) {
    if (!texto) return null;
    return <div className={`gp-aviso gp-aviso-${tipo}`}>{texto}</div>;
}

export default function ViewCriarPerguntaScreen() {
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
    const [pergunta, setPergunta] = useState('');
    const [tipo, setTipo] = useState<RespostaTipo>('TEXTO');
    const [opcoes, setOpcoes] = useState<OpcaoResposta[]>([]);
    const [respostaTexto, setRespostaTexto] = useState('');
    const [respostaEscolhidaId, setRespostaEscolhidaId] = useState<number | null>(null);
    const [anexos, setAnexos] = useState<{ id: number; nome: string; anexo: string; tipo: string }[]>([]);
    const [salvando, setSalvando] = useState(false);
    const [opcaoNova, setOpcaoNova] = useState('');
    const [aviso, setAviso] = useState<{ tipo: 'erro' | 'sucesso'; texto: string }>({tipo: 'sucesso', texto: ''});

    const notificar = (t: 'erro' | 'sucesso', texto: string) => setAviso({tipo: t, texto});

    const adicionarOpcao = () => {
        if (!opcaoNova.trim()) return;
        setOpcoes([...opcoes, {id: Date.now(), nome: opcaoNova.trim()}]);
        setOpcaoNova('');
    };

    const removerOpcao = (id: number) => {
        setOpcoes(opcoes.filter((o) => o.id !== id));
        if (respostaEscolhidaId === id) setRespostaEscolhidaId(null);
    };

    const adicionarAnexo = () => {
        setAnexos([...anexos, {id: Date.now(), nome: '', anexo: '', tipo: 'PDF'}]);
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
            await api.post<AvaliacaoPergunta>('/api/professor/avaliacao-pergunta', payload);
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
        <div>
            <Aviso tipo={aviso.tipo} texto={aviso.texto}/>

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

            {(tipo === 'SELECAO' || tipo === 'ESCOLHA') && (
                <div className="gp-control-group">
                    <span className="gp-control-label">Opções de Resposta</span>
                    {opcoes.map((opcao, idx) => (
                        <div key={idx} className="gp-opcao-linha">
                            {tipo === 'ESCOLHA' && (
                                <input
                                    type="radio"
                                    name="gp-resposta-correta"
                                    checked={respostaEscolhidaId === opcao.id}
                                    onChange={() => setRespostaEscolhidaId(opcao.id)}
                                    title="Marcar como resposta correta"
                                />
                            )}
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
                    <div className="gp-opcao-linha">
                        <input
                            type="text"
                            value={opcaoNova}
                            onChange={(e) => setOpcaoNova(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') adicionarOpcao();
                            }}
                            placeholder="Nova opção"
                        />
                        <button
                            className="gp-btn gp-btn-acoes"
                            onClick={adicionarOpcao}
                            title="Adicionar opção"
                        >
                            ➕
                        </button>
                    </div>
                </div>
            )}

            {tipo === 'TEXTO' && (
                <div className="gp-control-group">
                    <span className="gp-control-label">Resposta Texto</span>
                    <textarea
                        rows={3}
                        value={respostaTexto}
                        onChange={(e) => setRespostaTexto(e.target.value)}
                        placeholder="Digite a resposta (opcional)"
                    />
                </div>
            )}

            {tipo === 'ESCOLHA' && respostaEscolhidaId !== null && (
                <div className="gp-control-group">
                    <span className="gp-control-label">Resposta Escolhida</span>
                    <p>ID da resposta escolhida: {respostaEscolhidaId}</p>
                </div>
            )}

            {tipo === 'ARQUIVO' && (
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
            )}

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
    const [aviso, setAviso] = useState<{ tipo: 'erro' | 'sucesso'; texto: string }>({tipo: 'sucesso', texto: ''});

    const handleExport = async (format: 'pdf' | 'docx' | 'excel') => {
        try {
            const response = await api.get(`/api/professor/avaliacao-pergunta/exportar/${format}`, {responseType: 'blob'});
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `perguntas-avaliacao.${format}`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (e) {
            alert(`Erro ao exportar ${format.toUpperCase()}`);
        }
    };

    const exportOptions = [
        {key: 'pdf', label: 'PDF', icon: <i className="fa fa-file-pdf-o"/>, onClick: () => handleExport('pdf')},
        {key: 'docx', label: 'DOCX', icon: <i className="fa fa-file-word-o"/>, onClick: () => handleExport('docx')},
        {key: 'excel', label: 'Excel', icon: <i className="fa fa-file-excel-o"/>, onClick: () => handleExport('excel')},
    ];

    const carregarPerguntas = async () => {
        setCarregando(true);
        try {
            const {data} = await api.get<AvaliacaoPergunta[]>(
                '/api/professor/avaliacao-pergunta',
                isAdmin ? {} : {params: {professorId: session?.id}}
            );
            setPerguntas(data);
        } catch (e) {
            setAviso({tipo: 'erro', texto: 'Erro ao carregar perguntas.'});
        } finally {
            setCarregando(false);
        }
    };

    return (
        <div>
            <div className="data-table-toolbar" style={{marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '10px'}}>
                <button
                    className="gp-btn gp-btn-procurar"
                    onClick={carregarPerguntas}
                    disabled={carregando}
                >
                    {carregando ? 'Carregando...' : 'Carregar Perguntas'}
                </button>
                <ExportDropdown options={exportOptions} triggerLabel="Exportar" triggerIcon={<i className="fa fa-download"/>}/>
            </div>

            <Aviso tipo={aviso.tipo} texto={aviso.texto}/>

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
