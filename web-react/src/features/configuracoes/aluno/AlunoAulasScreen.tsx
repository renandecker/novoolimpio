import {useEffect, useState} from 'react';

import {Link} from 'react-router-dom';

import {aulaApi, TurmaAula} from '../../features/professor/aula';

import '../../features/aluno/AlunoPortal.css';

export default function AlunoAulasScreen() {
    const [turmas, setTurmas] = useState<TurmaAula[]>([]);
    const [error, setError] = useState('');
    const [busy, setBusy] = useState(true);

    useEffect(() => {
        let active = true;
        aulaApi
            .turmas()
            .then(data => {
                if (!active) return;
                setTurmas(data ?? []);
            })
            .catch((e: any) => {
                if (active) setError(e.response?.data?.error || e.response?.data?.message || 'Não foi possível carregar as turmas.');
            })
            .finally(() => {
                if (active) setBusy(false);
            });
        return () => {
            active = false;
        };
    }, []);

    if (busy) return <main><h1>Aulas</h1><p className="aluno-portal-msg">Carregando...</p></main>;

    if (error) return <main><h1>Aulas</h1>
        <div className="aluno-portal-error" role="alert">{error}</div>
    </main>;

    return (
        <main className="aluno-portal">
            <h1>Aulas</h1>
            <p className="aluno-portal-msg">Selecione a turma para ver as aulas da disciplina.</p>

            {turmas.length === 0 && <p className="aluno-portal-msg">Nenhuma turma encontrada.</p>}

            <div className="aluno-portal-boletim-lista">
                {turmas.map(t => (
                    <Link
                        key={t.id}
                        to={`/aluno/aulas/turma/${t.id}`}
                        className="aluno-portal-item aluno-portal-link-cartao"
                        style={{textDecoration: 'none'}}
                    >
                        <h2>{t.componente || `Turma ${t.id}`}</h2>
                        <p className="aluno-portal-item-meta">
                            {[t.curso, t.turma ? `Turma ${t.turma}` : '', t.unidade].filter(Boolean).join(' · ')}
                        </p>
                        <p className="aluno-portal-data">{t.professor || 'Professor não informado'}</p>
                    </Link>
                ))}
            </div>
        </main>
    );
}