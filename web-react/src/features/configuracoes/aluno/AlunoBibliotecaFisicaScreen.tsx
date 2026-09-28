import {useEffect, useMemo, useState} from 'react';
import {useAuth} from '../../auth/auth';
import {
    bibliotecaAlunoApi,
    formatarDataCurta,
    formatarDataHora,
    formatarMoeda,
    type EmprestimoFisico,
    type MultaFisica,
    type ObraResumo,
    type ReservaFisica,
} from '../../aluno/bibliotecaAluno';
import '../../aluno/AlunoPortal.css';

type Aba = 'livros' | 'reservas' | 'emprestimos' | 'multas';

const ABAS: Array<{id: Aba; rotulo: string}> = [
    {id: 'livros', rotulo: 'Livros disponíveis'},
    {id: 'reservas', rotulo: 'Minhas reservas'},
    {id: 'emprestimos', rotulo: 'Meus empréstimos'},
    {id: 'multas', rotulo: 'Minhas multas'},
];

const RESERVA_ATIVA = new Set(['AGUARDANDO_FILA', 'DISPONIVEL_PARA_RETIRADA']);

export default function AlunoBibliotecaFisicaScreen() {
    const {session} = useAuth();
    const usuarioId = session?.idUsuario ?? null;

    const [aba, setAba] = useState<Aba>('livros');
    const [reservas, setReservas] = useState<ReservaFisica[]>([]);
    const [emprestimos, setEmprestimos] = useState<EmprestimoFisico[]>([]);
    const [multas, setMultas] = useState<MultaFisica[]>([]);
    const [obras, setObras] = useState<ObraResumo[]>([]);
    const [busca, setBusca] = useState('');
    const [busy, setBusy] = useState(true);
    const [busyBusca, setBusyBusca] = useState(false);
    const [acaoId, setAcaoId] = useState<number | null>(null);
    const [error, setError] = useState('');
    const [aviso, setAviso] = useState('');

    const carregarPessoais = async () => {
        if (usuarioId == null) return;
        const [r, e, m] = await Promise.all([
            bibliotecaAlunoApi.minhasReservas(usuarioId),
            bibliotecaAlunoApi.meusEmprestimosAtivos(usuarioId),
            bibliotecaAlunoApi.minhasMultas(usuarioId),
        ]);
        setReservas(r);
        setEmprestimos(e);
        setMultas(m);
    };

    useEffect(() => {
        let active = true;
        setBusy(true);
        setError('');
        if (usuarioId == null) {
            setBusy(false);
            return;
        }
        carregarPessoais()
            .catch((e: any) => {
                if (active) setError(e.response?.data?.error || e.response?.data?.message || 'Não foi possível carregar a biblioteca física.');
            })
            .finally(() => {
                if (active) setBusy(false);
            });
        return () => {
            active = false;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [usuarioId]);

    const reservasAtivas = useMemo(() => reservas.filter(r => RESERVA_ATIVA.has(String(r.status ?? ''))), [reservas]);
    const multasPendentes = useMemo(() => multas.filter(m => String(m.statusPagamento ?? '') === 'PENDENTE'), [multas]);
    const totalMultasPendentes = useMemo(
        () => multasPendentes.reduce((acc, m) => acc + Number(m.valorTotal ?? 0), 0),
        [multasPendentes],
    );

    const buscarLivros = async () => {
        if (!busca.trim()) {
            setAviso('Digite título, autor ou ISBN para buscar no acervo físico.');
            return;
        }
        setBusyBusca(true);
        setAviso('');
        setError('');
        try {
            setObras(await bibliotecaAlunoApi.buscarObras(busca.trim()));
        } catch (e: any) {
            setError(e.response?.data?.error || e.response?.data?.message || 'Não foi possível buscar no acervo físico.');
        } finally {
            setBusyBusca(false);
        }
    };

    const reservar = async (obraId: number) => {
        setAcaoId(obraId);
        setAviso('');
        setError('');
        try {
            await bibliotecaAlunoApi.reservarObra(usuarioId, obraId);
            await carregarPessoais();
            setAviso('Reserva solicitada com sucesso. Acompanhe na aba "Minhas reservas".');
        } catch (e: any) {
            setError(e.response?.data?.error || e.response?.data?.message || 'Não foi possível reservar a obra.');
        } finally {
            setAcaoId(null);
        }
    };

    const cancelar = async (reservaId: number) => {
        setAcaoId(reservaId);
        setAviso('');
        setError('');
        try {
            await bibliotecaAlunoApi.cancelarReserva(reservaId);
            await carregarPessoais();
            setAviso('Reserva cancelada.');
        } catch (e: any) {
            setError(e.response?.data?.error || e.response?.data?.message || 'Não foi possível cancelar a reserva.');
        } finally {
            setAcaoId(null);
        }
    };

    if (usuarioId == null) {
        return (
            <main className="aluno-portal">
                <h1>Biblioteca Física</h1>
                <div className="aluno-portal-error" role="alert">Sessão sem usuário identificado. Faça login novamente para ver seus dados da biblioteca.</div>
            </main>
        );
    }

    if (busy) return <main className="aluno-portal"><h1>Biblioteca Física</h1><p className="aluno-portal-msg">Carregando...</p></main>;

    return (
        <main className="aluno-portal">
            <h1>Biblioteca Física</h1>
            <p className="aluno-portal-saudacao">Olá, <strong>{session?.nome || session?.username}</strong>! Aqui estão seus empréstimos, reservas, multas e o acervo disponível.</p>

            {error && <div className="aluno-portal-error" role="alert">{error}</div>}
            {aviso && <p className="aluno-portal-msg" role="status">{aviso}</p>}

            <div className="aluno-portal-cards">
                <div className="aluno-portal-card">
                    <span className="aluno-portal-card-valor">{reservasAtivas.length}</span>
                    <span className="aluno-portal-card-rotulo">Reservas ativas</span>
                </div>
                <div className="aluno-portal-card">
                    <span className="aluno-portal-card-valor">{emprestimos.length}</span>
                    <span className="aluno-portal-card-rotulo">Empréstimos ativos</span>
                </div>
                <div className="aluno-portal-card">
                    <span className="aluno-portal-card-valor">{multasPendentes.length}</span>
                    <span className="aluno-portal-card-rotulo">Multas pendentes</span>
                </div>
                <div className="aluno-portal-card">
                    <span className="aluno-portal-card-valor">{formatarMoeda(totalMultasPendentes)}</span>
                    <span className="aluno-portal-card-rotulo">Total em multas</span>
                </div>
            </div>

            <div className="aluno-portal-abas" role="tablist" aria-label="Biblioteca física">
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

            {aba === 'livros' && (
                <section className="aluno-portal-item">
                    <h2>Livros disponíveis</h2>
                    <div className="aluno-portal-busca">
                        <input
                            type="text"
                            placeholder="Buscar por título, autor ou ISBN..."
                            value={busca}
                            onChange={e => setBusca(e.target.value)}
                            onKeyDown={e => { if (e.key === 'Enter') buscarLivros(); }}
                            aria-label="Buscar no acervo físico"
                        />
                        <button type="button" className="aluno-portal-botao" onClick={buscarLivros} disabled={busyBusca}>
                            {busyBusca ? 'Buscando...' : 'Buscar'}
                        </button>
                    </div>
                    {obras.length === 0 ? (
                        <p className="aluno-portal-msg">Nenhum livro localizado. Use a busca acima para consultar o acervo físico.</p>
                    ) : (
                        <table className="aluno-portal-tabela">
                            <thead>
                                <tr>
                                    <th>Título</th>
                                    <th>Autor(es)</th>
                                    <th>Editora</th>
                                    <th>Ano</th>
                                    <th>Ação</th>
                                </tr>
                            </thead>
                            <tbody>
                                {obras.map(o => (
                                    <tr key={o.id}>
                                        <td><strong>{o.titulo}</strong>{o.subtitulo ? ` — ${o.subtitulo}` : ''}</td>
                                        <td>{o.autores ?? '-'}</td>
                                        <td>{o.editora ?? '-'}</td>
                                        <td>{o.anoPublicacao ?? '-'}</td>
                                        <td>
                                            <button
                                                type="button"
                                                className="aluno-portal-botao"
                                                disabled={acaoId === o.id}
                                                onClick={() => reservar(o.id)}
                                            >
                                                {acaoId === o.id ? 'Reservando...' : 'Reservar'}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </section>
            )}

            {aba === 'reservas' && (
                <section className="aluno-portal-item">
                    <h2>Minhas reservas</h2>
                    {reservas.length === 0 ? (
                        <p className="aluno-portal-msg">Você não possui reservas.</p>
                    ) : (
                        <table className="aluno-portal-tabela">
                            <thead>
                                <tr>
                                    <th>Obra</th>
                                    <th>Solicitação</th>
                                    <th>Posição na fila</th>
                                    <th>Status</th>
                                    <th>Limite retirada</th>
                                    <th>Ação</th>
                                </tr>
                            </thead>
                            <tbody>
                                {reservas.map(r => (
                                    <tr key={r.id}>
                                        <td><strong>{r.obra?.titulo ?? '-'}</strong><br /><span className="aluno-portal-data">{r.obra?.autores ?? ''}</span></td>
                                        <td>{formatarDataHora(r.dataSolicitacao)}</td>
                                        <td>{r.posicaoFila ?? '-'}</td>
                                        <td><span className="aluno-portal-status">{r.status ?? '-'}</span></td>
                                        <td>{formatarDataHora(r.dataLimiteRetirada)}</td>
                                        <td>
                                            {RESERVA_ATIVA.has(String(r.status ?? '')) && (
                                                <button
                                                    type="button"
                                                    className="aluno-portal-botao-perigo"
                                                    disabled={acaoId === r.id}
                                                    onClick={() => cancelar(r.id)}
                                                >
                                                    {acaoId === r.id ? 'Cancelando...' : 'Cancelar'}
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </section>
            )}

            {aba === 'emprestimos' && (
                <section className="aluno-portal-item">
                    <h2>Meus empréstimos</h2>
                    {emprestimos.length === 0 ? (
                        <p className="aluno-portal-msg">Você não possui empréstimos ativos.</p>
                    ) : (
                        <table className="aluno-portal-tabela">
                            <thead>
                                <tr>
                                    <th>Obra / Exemplar</th>
                                    <th>Retirada</th>
                                    <th>Devolução prevista</th>
                                    <th>Status</th>
                                    <th>Renovações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {emprestimos.map(e => (
                                    <tr key={e.id}>
                                        <td>
                                            <strong>{e.exemplar?.obra?.titulo ?? '-'}</strong>
                                            <br /><span className="aluno-portal-data">Tombo: {e.exemplar?.tombo ?? '-'} · {e.exemplar?.localizacao ?? ''}</span>
                                        </td>
                                        <td>{formatarDataHora(e.dataRetirada)}</td>
                                        <td>{formatarDataCurta(e.dataPrevistaDevolucao)}</td>
                                        <td><span className="aluno-portal-status">{e.status ?? '-'}</span></td>
                                        <td>{e.quantidadeRenovacoes ?? 0}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                    <p className="aluno-portal-msg">Renovações e devoluções são feitas no balcão da biblioteca.</p>
                </section>
            )}

            {aba === 'multas' && (
                <section className="aluno-portal-item">
                    <h2>Minhas multas</h2>
                    {multas.length === 0 ? (
                        <p className="aluno-portal-msg">Você não possui multas. 🎉</p>
                    ) : (
                        <table className="aluno-portal-tabela">
                            <thead>
                                <tr>
                                    <th>Obra</th>
                                    <th>Dias em atraso</th>
                                    <th>Valor total</th>
                                    <th>Motivo</th>
                                    <th>Pagamento</th>
                                </tr>
                            </thead>
                            <tbody>
                                {multas.map(m => (
                                    <tr key={m.id}>
                                        <td><strong>{m.emprestimo?.exemplar?.obra?.titulo ?? '-'}</strong></td>
                                        <td>{m.diasAtraso ?? '-'}</td>
                                        <td>{formatarMoeda(m.valorTotal)}</td>
                                        <td>{m.motivo ?? '-'}</td>
                                        <td><span className="aluno-portal-status">{m.statusPagamento ?? '-'}</span></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                    <p className="aluno-portal-msg">Regularize suas multas pendentes no balcão da biblioteca ou na tesouraria.</p>
                </section>
            )}
        </main>
    );
}
