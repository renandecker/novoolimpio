import {useEffect, useState} from 'react';
import {Link, useParams} from 'react-router-dom';
import {alunoApi, AvaliacaoDetalhe, AvaliacaoRespostaEnvio} from '../../features/aluno/aluno';
import '../../features/aluno/AlunoPortal.css';

export default function AlunoAvaliacaoResponderScreen() {
    const {id} = useParams();
    const avaliacaoId = Number(id);
    const [avaliacao, setAvaliacao] = useState<AvaliacaoDetalhe | null>(null);
    const [escolhas, setEscolhas] = useState<Record<number, number | null>>({});
    const [textos, setTextos] = useState<Record<number, string>>({});
    const [error, setError] = useState('');
    const [msg, setMsg] = useState('');
    const [busy, setBusy] = useState(true);
    const [salvando, setSalvando] = useState(false);

    useEffect(() => {
        let active = true;
        if (!Number.isFinite(avaliacaoId) || avaliacaoId <= 0) {
            setBusy(false);
            setError('AvaliaÃ§Ã£o invÃ¡lida.');
            return () => {
                active = false;
            };
        }
        alunoApi
            .avaliacaoDetalhe(avaliacaoId)
            .then(data => {
                if (!active) return;
                setAvaliacao(data);
                const ch: Record<number, number | null> = {};
                const tx: Record<number, string> = {};
                for (const p of data.perguntas ?? []) {
                    ch[p.id] = p.respostaEscolhidaId ?? null;
                    tx[p.id] = p.respostaTexto ?? '';
                }
                setEscolhas(ch);
                setTextos(tx);
            })
            .catch((e: any) => {
                if (active) setError(e.response?.data?.error || e.response?.data?.message || 'NÃ£o foi possÃ­vel carregar a avaliaÃ§Ã£o.');
            })
            .finally(() => {
                if (active) setBusy(false);
            });
        return () => {
            active = false;
        };
    }, [avaliacaoId]);

    if (busy) return <main><h1>AvaliaÃ§Ã£o</h1><p className="aluno-portal-msg">Carregando...</p></main>;
    if (error && !avaliacao) return <main><h1>AvaliaÃ§Ã£o</h1>
        <div className="aluno-portal-error" role="alert">{error}</div>
        <p><Link to="/aluno/avaliacoes">Voltar para avaliaÃ§Ãµes</Link></p>
    </main>;
    if (!avaliacao) return null;

    const responder = async () => {
        setSalvando(true);
        setError('');
        setMsg('');
        const respostas: AvaliacaoRespostaEnvio[] = (avaliacao.perguntas ?? []).map(p => ({
            perguntaId: p.id,
            respostaId: escolhas[p.id] ?? null,
            respostaTexto: (textos[p.id] ?? '').trim() || null,
        }));
        try {
            await alunoApi.responderAvaliacao(avaliacaoId, respostas);
            setMsg('Respostas salvas com sucesso.');
        } catch (e: any) {
            setError(e.response?.data?.error || e.response?.data?.message || 'NÃ£o foi possÃ­vel salvar as respostas.');
        } finally {
            setSalvando(false);
        }
    };

    return (
        <main className="aluno-portal">
            <h1>{avaliacao.nome || 'AvaliaÃ§Ã£o'}</h1>
            {avaliacao.descricao && <p className="aluno-portal-msg">{avaliacao.descricao}</p>}
            {!avaliacao.ativa && <p className="aluno-portal-msg">Esta avaliaÃ§Ã£o estÃ¡ fechada. VocÃª pode consultar suas respostas.</p>}

            {error && <div className="aluno-portal-error" role="alert">{error}</div>}
            {msg && <div className="aluno-portal-msg" role="status">{msg}</div>}

            {(avaliacao.perguntas ?? []).length === 0 && (
                <p className="aluno-portal-msg">Nenhuma pergunta cadastrada nesta avaliaÃ§Ã£o.</p>
            )}

            <div className="aluno-portal-avaliacoes-lista">
                {(avaliacao.perguntas ?? []).map((p, index) => (
                    <section className="aluno-portal-item" key={p.id}>
                        <div className="aluno-portal-item-cabecalho">
                            <h2>{index + 1}. {p.pergunta || `Pergunta ${p.id}`}</h2>
                        </div>
                        <div className="aluno-portal-item-dados">
                            {(p.opcoes ?? []).length > 0 ? (
                                (p.opcoes ?? []).map(op => (
                                    <label key={op.id} className="aluno-portal-opcao">
                                        <input
                                            type="radio"
                                            name={`pergunta-${p.id}`}
                                            checked={escolhas[p.id] === op.id}
                                            disabled={!avaliacao.ativa}
                                            onChange={() => setEscolhas(prev => ({...prev, [p.id]: op.id}))}
                                        />
                                        {' '}{op.resposta}
                                    </label>
                                ))
                            ) : (
                                <textarea
                                    className="aluno-portal-textarea"
                                    value={textos[p.id] ?? ''}
                                    disabled={!avaliacao.ativa}
                                    rows={3}
                                    placeholder="Digite sua resposta..."
                                    onChange={e => setTextos(prev => ({...prev, [p.id]: e.target.value}))}
                                />
                            )}
                        </div>
                    </section>
                ))}
            </div>

            <div className="aluno-portal-item-acoes">
                {avaliacao.ativa && (avaliacao.perguntas ?? []).length > 0 && (
                    <button type="button" onClick={responder} disabled={salvando}>
                        {salvando ? 'Salvando...' : 'Salvar respostas'}
                    </button>
                )}
                <Link to="/aluno/avaliacoes">Voltar</Link>
            </div>
        </main>
    );
}
