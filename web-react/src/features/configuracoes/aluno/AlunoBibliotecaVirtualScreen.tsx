import {useEffect, useMemo, useState} from 'react';
import {useAuth} from '../../auth/auth';
import {
    bibliotecaAlunoApi,
    formatarDataHora,
    type EmprestimoVirtual,
    type LivroVirtual,
    type ProvedorVirtual,
} from '../../aluno/bibliotecaAluno';
import '../../aluno/AlunoPortal.css';

type Aba = 'meus' | 'catalogo' | 'fornecedores';

const ABAS: Array<{id: Aba; rotulo: string}> = [
    {id: 'meus', rotulo: 'Meus livros virtuais'},
    {id: 'catalogo', rotulo: 'Catálogo virtual'},
    {id: 'fornecedores', rotulo: 'Fornecedores'},
];

export default function AlunoBibliotecaVirtualScreen() {
    const {session} = useAuth();
    const usuarioId = session?.idUsuario ?? null;

    const [aba, setAba] = useState<Aba>('meus');
    const [meus, setMeus] = useState<EmprestimoVirtual[]>([]);
    const [livros, setLivros] = useState<LivroVirtual[]>([]);
    const [provedores, setProvedores] = useState<ProvedorVirtual[]>([]);
    const [busca, setBusca] = useState('');
    const [busy, setBusy] = useState(true);
    const [busyBusca, setBusyBusca] = useState(false);
    const [error, setError] = useState('');
    const [aviso, setAviso] = useState('');

    useEffect(() => {
        let active = true;
        setBusy(true);
        setError('');
        if (usuarioId == null) {
            setBusy(false);
            return;
        }
        Promise.all([
            bibliotecaAlunoApi.meusEmprestimosVirtuaisAtivos(usuarioId),
            bibliotecaAlunoApi.provedoresAtivos(),
        ])
            .then(([emprestimos, provs]) => {
                if (!active) return;
                setMeus(emprestimos);
                setProvedores(provs);
            })
            .catch((e: any) => {
                if (active) setError(e.response?.data?.error || e.response?.data?.message || 'Não foi possível carregar a biblioteca virtual.');
            })
            .finally(() => {
                if (active) setBusy(false);
            });
        return () => {
            active = false;
        };
    }, [usuarioId]);

    const acessosPorProvedor = useMemo(() => {
        const map = new Map<string, number>();
        for (const e of meus) {
            const nome = e.livroDigital?.provedor?.nome || e.livroDigital?.editora || 'Acervo próprio';
            map.set(nome, (map.get(nome) ?? 0) + 1);
        }
        return map;
    }, [meus]);

    const buscarLivros = async () => {
        if (!busca.trim()) {
            setAviso('Digite título, autor ou ISBN para buscar nos livros virtuais dos fornecedores.');
            return;
        }
        setBusyBusca(true);
        setAviso('');
        setError('');
        try {
            setLivros(await bibliotecaAlunoApi.buscarLivrosVirtuais(busca.trim()));
        } catch (e: any) {
            setError(e.response?.data?.error || e.response?.data?.message || 'Não foi possível buscar nos livros virtuais.');
        } finally {
            setBusyBusca(false);
        }
    };

    const abrirRecurso = (livro: LivroVirtual) => {
        const url = livro.urlRecurso || livro.previewUrl;
        if (url) window.open(url, '_blank', 'noopener,noreferrer');
        else setAviso(`"${livro.titulo}" ainda não possui link de acesso publicado pelo fornecedor.`);
    };

    if (usuarioId == null) {
        return (
            <main className="aluno-portal">
                <h1>Biblioteca Virtual</h1>
                <div className="aluno-portal-error" role="alert">Sessão sem usuário identificado. Faça login novamente para ver seus livros virtuais.</div>
            </main>
        );
    }

    if (busy) return <main className="aluno-portal"><h1>Biblioteca Virtual</h1><p className="aluno-portal-msg">Carregando...</p></main>;

    return (
        <main className="aluno-portal">
            <h1>Biblioteca Virtual</h1>
            <p className="aluno-portal-saudacao">Olá, <strong>{session?.nome || session?.username}</strong>! Acesse aqui os livros virtuais dos fornecedores disponíveis para você.</p>

            {error && <div className="aluno-portal-error" role="alert">{error}</div>}
            {aviso && <p className="aluno-portal-msg" role="status">{aviso}</p>}

            <div className="aluno-portal-cards">
                <div className="aluno-portal-card">
                    <span className="aluno-portal-card-valor">{meus.length}</span>
                    <span className="aluno-portal-card-rotulo">Meus acessos ativos</span>
                </div>
                <div className="aluno-portal-card">
                    <span className="aluno-portal-card-valor">{provedores.length}</span>
                    <span className="aluno-portal-card-rotulo">Fornecedores</span>
                </div>
                <div className="aluno-portal-card">
                    <span className="aluno-portal-card-valor">{livros.length}</span>
                    <span className="aluno-portal-card-rotulo">Livros localizados</span>
                </div>
            </div>

            <div className="aluno-portal-abas" role="tablist" aria-label="Biblioteca virtual">
                {ABAS.map(a => (
                    <button
                        key={a.id}
                        role="tab"
                        aria-selected={aba === a.id}
                        type="button"
                        className={`aluno-portal-aba${aba === a.id ? ' ativa' : ''}`}
                        onClick={() => setAba(a.id)}
                    >
                        {a.rotulo}
                    </button>
                ))}
            </div>

            {aba === 'meus' && (
                <section className="aluno-portal-item">
                    <h2>Meus livros virtuais</h2>
                    {meus.length === 0 ? (
                        <p className="aluno-portal-msg">Você não possui acessos ativos. Consulte o catálogo ou fale com a biblioteca.</p>
                    ) : (
                        <table className="aluno-portal-tabela">
                            <thead>
                                <tr>
                                    <th>Livro</th>
                                    <th>Fornecedor</th>
                                    <th>Expira em</th>
                                    <th>Progresso</th>
                                    <th>Acesso</th>
                                </tr>
                            </thead>
                            <tbody>
                                {meus.map(e => (
                                    <tr key={e.id}>
                                        <td>
                                            <strong>{e.livroDigital?.titulo ?? '-'}</strong>
                                            <br /><span className="aluno-portal-data">{e.livroDigital?.autores ?? ''}</span>
                                        </td>
                                        <td>{e.livroDigital?.provedor?.nome ?? e.livroDigital?.editora ?? 'Acervo próprio'}</td>
                                        <td>{formatarDataHora(e.dataExpiracao)}</td>
                                        <td>{e.progressoLeitura != null ? `${e.progressoLeitura}%` : '-'}</td>
                                        <td>
                                            <button type="button" className="aluno-portal-botao" onClick={() => e.livroDigital && abrirRecurso(e.livroDigital)}>
                                                Abrir livro
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                    {acessosPorProvedor.size > 0 && (
                        <p className="aluno-portal-msg">
                            Acessos por fornecedor: {[...acessosPorProvedor.entries()].map(([n, q]) => `${n} (${q})`).join(' · ')}
                        </p>
                    )}
                </section>
            )}

            {aba === 'catalogo' && (
                <section className="aluno-portal-item">
                    <h2>Catálogo virtual</h2>
                    <div className="aluno-portal-busca">
                        <input
                            type="text"
                            placeholder="Buscar por título, autor ou ISBN..."
                            value={busca}
                            onChange={e => setBusca(e.target.value)}
                            onKeyDown={e => { if (e.key === 'Enter') buscarLivros(); }}
                            aria-label="Buscar nos livros virtuais"
                        />
                        <button type="button" className="aluno-portal-botao" onClick={buscarLivros} disabled={busyBusca}>
                            {busyBusca ? 'Buscando...' : 'Buscar'}
                        </button>
                    </div>
                    {livros.length === 0 ? (
                        <p className="aluno-portal-msg">Nenhum livro localizado. Use a busca acima para consultar o acervo dos fornecedores.</p>
                    ) : (
                        <table className="aluno-portal-tabela">
                            <thead>
                                <tr>
                                    <th>Livro</th>
                                    <th>Fornecedor</th>
                                    <th>Formatos</th>
                                    <th>Acesso</th>
                                </tr>
                            </thead>
                            <tbody>
                                {livros.map(l => (
                                    <tr key={l.id}>
                                        <td>
                                            <strong>{l.titulo}</strong>
                                            <br /><span className="aluno-portal-data">{[l.autores, l.editora, l.anoPublicacao].filter(Boolean).join(' · ')}</span>
                                        </td>
                                        <td>{l.provedor?.nome ?? l.editora ?? '-'}</td>
                                        <td>{(l.formatosDisponiveis ?? []).join(', ') || '-'}</td>
                                        <td>
                                            <button type="button" className="aluno-portal-botao" onClick={() => abrirRecurso(l)}>
                                                Abrir
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                    <p className="aluno-portal-msg">O acesso integral depende das licenças contratadas com cada fornecedor.</p>
                </section>
            )}

            {aba === 'fornecedores' && (
                <section className="aluno-portal-item">
                    <h2>Fornecedores</h2>
                    {provedores.length === 0 ? (
                        <p className="aluno-portal-msg">Nenhum fornecedor ativo no momento.</p>
                    ) : (
                        <div className="aluno-portal-boletim-lista">
                            {provedores.map(p => (
                                <div className="aluno-portal-item" key={p.id}>
                                    <div className="aluno-portal-item-cabecalho">
                                        <div>
                                            <h2>{p.nome}</h2>
                                            <p className="aluno-portal-item-meta">
                                                {[p.publicoAlvo, p.areaConhecimento].filter(Boolean).join(' · ')}
                                            </p>
                                        </div>
                                        <span className="aluno-portal-status">{p.statusDisplay ?? 'Ativo'}</span>
                                    </div>
                                    {p.descricao && <p className="aluno-portal-msg">{p.descricao}</p>}
                                    <div className="aluno-portal-item-dados">
                                        {p.suportaSso && <span><strong>SSO:</strong> sim</span>}
                                        {p.suportaLti && <span><strong>LTI:</strong> sim</span>}
                                    </div>
                                    <div className="aluno-portal-item-acoes">
                                        {p.urlApi && <a href={p.urlApi} target="_blank" rel="noopener noreferrer">Acessar plataforma</a>}
                                        {p.documentacaoUrl && <a href={p.documentacaoUrl} target="_blank" rel="noopener noreferrer">Ajuda</a>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            )}
        </main>
    );
}
