import {useEffect, useState} from 'react';
import {Link} from 'react-router-dom';
import {alunoApi, AvaliacaoAluno, AvaliacaoPergunta, formatarNota} from '../aluno';
import '../AlunoPortal.css';

export default function AlunoAvaliacoesScreen() {
    const [avaliacoes, setAvaliacoes] = useState<AvaliacaoAluno[]>([]);
    const [error, setError] = useState('');
    const [busy, setBusy] = useState(true);

    useEffect(() => {
        let active = true;
        alunoApi
            .avaliacoes()
            .then(data => {
                if (!active) return;
                setAvaliacoes(data ? ? []);
            })
            .catch((e: any) => {
                if (active) setError(e.response?.data?.error || e.response?.data?.message || 'Não foi possível carregar as avaliações.');
            })
            .finally(() => {
                if (active) setBusy(false);
            });
        return () => {
            active = false;
        };
    }, []);

    if (busy) return <main><h1>Avaliações do Aluno</h1><p className="aluno-portal-msg">Carregando...</p></main>;
    if (error) return <main><h1>Avaliações do Aluno</h1>
        <div className="aluno-portal-error" role="alert">{error}</div>
    </main>;

    const totalAvaliacoes = avaliacoes.length;

    return (
        <main className="aluno-portal">
            <h1>Avaliações do Aluno</h1>
            <p className="aluno-portal-msg">Total de avaliações: {totalAvaliacoes}</p>

            {avaliacoes.length === 0 && <p className="aluno-portal-msg">Nenhuma avaliação encontrada.</p>}

            <div className="aluno-portal-avaliacoes-lista">
                {avaliacoes.map(a => (
                    <section className="aluno-portal-item" key={a.id}>
                        <div className="aluno-portal-item-cabecalho">
                            <div>
                                <h2>{a.descricao_pergunta || `Pergunta ${a.id_avaliacao_pergunta}`}</h2>
                                <p className="aluno-portal-item-meta">
                                    {a.id_avaliacao ? 'Avaliação ' + a.id_avaliacao : ''}
                                </p>
                            </div>
                        </div>

                        <div className="aluno-portal-item-dados">
                            {a.conceito !== undefined && a.conceito !== null ? (
                                <p><strong>Conceito:</strong> {a.conceito}</p>
                            ) : null}

                            {a.nota !== undefined && a.nota !== null ? (
                                <p><strong>Nota:</strong> {formatarNota(a.nota)}</p>
                            ) : null}

                            {a.resposta !== undefined && a.resposta !== null ? (
                                <p>
                                    <minhaResposta>{a.resposta}</minhaResposta>
                                </p>
                            ) : (
                                <p>Sua resposta: <em> ainda não respondida</em></p>
                            )}
                        </div>

                        <div className="aluno-portal-item-acoes">
                            <Link to={`/aluno/avaliacao/${a.id}`}>Responder</Link>
                        </div>
                    </section>
                ))}
            </div>
        </main>
    );
}