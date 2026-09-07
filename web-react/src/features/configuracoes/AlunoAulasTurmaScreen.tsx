import {useEffect, useState} from 'react';

import {Link, useParams} from 'react-router-dom';

import {aulaApi, AulaTurma} from '../../features/professor/aula';

import '../../features/aluno/AlunoPortal.css';

export default function AlunoAulasTurmaScreen() {
    const {oferecimentoId} = useParams<{ oferecimentoId: string }>();

    const [aulas, setAulas] = useState<AulaTurma[]>([]);
    const [error, setError] = useState('');
    const [busy, setBusy] = useState(true);

    useEffect(() => {
        let active = true;
        aulaApi
            .aulasDaTurma(Number(oferecimentoId))
            .then(data => {
                if (!active) return;
                setAulas(data ?? []);
            })
            .catch((e: any) => {
                if (active) setError(e.response?.data?.error || e.response?.data?.message || 'Não foi possível carregar as aulas da turma.');
            })
            .finally(() => {
                if (active) setBusy(false);
            });
        return () => {
            active = false;
        };
    }, [oferecimentoId]);

    if (busy) return <main><h1>Aulas da Turma</h1><p className="aluno-portal-msg">Carregando...</p></main>;

    if (error) return <main><h1>Aulas da Turma</h1>
        <div className="aluno-portal-error" role="alert">{error}</div>
    </main>;

    return (
        <main className="aluno-portal">
            <p className="aluno-portal-item-acoes"><Link to="/aluno/aulas">Voltar Turmas</Link></p>
            <h1>Aulas da Turma</h1>
            <p className="aluno-portal-msg">Total de aulas: {aulas.length}</p>

            {aulas.length === 0 && <p className="aluno-portal-msg">Nenhuma aula encontrada para esta turma.</p>}

            <div className="aluno-portal-avaliacoes-lista">
                {aulas.map(a => (
                    <section className="aluno-portal-item" key={a.id}>
                        <div className="aluno-portal-item-cabecalho">
                            <div>
                                <h2>{a.nome || `Aula ${a.id}`}</h2>
                                <p className="aluno-portal-item-meta">
                                    {a.data ? `Data: ${a.data}` : 'Data não informada'}
                                    {a.descricao ? ` · ${a.descricao}` : ''}
                                </p>
                            </div>
                            <span className={`aluno-portal-situacao ${a.assistida ? 'ok' : 'pendente'}`}>
                                {a.assistida ? 'Assistida' : 'Pendente'}
                            </span>
                        </div>
                        <div className="aluno-portal-item-acoes">
                            <Link to={`/aluno/aulas/aula/${a.id}`}>Abrir aula</Link>
                        </div>
                    </section>
                ))}
            </div>
        </main>
    );
}