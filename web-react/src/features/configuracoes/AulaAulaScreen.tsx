import {useEffect, useState} from 'react';
import {Link, useParams} from 'react-router-dom';
import {aulaApi, Aula} from '../aula';
import '../AlunoPortal.css';

export default function AulaAulaScreen() {
    const {ocorrenciaId} = useParams<{ ocorrenciaId: string }>();
    const [aulas, setAulas] = useState<Aula[]>([]);
    const [error, setError] = useState('');
    const [busy, setBusy] = useState(true);

    useEffect(() => {
        let active = true;
        aulaApi
            .aulasDaOcorrencia(Number(ocorrenciaId))
            .then(data => {
                if (active) setAulas(data ?? []);
            })
            .catch((e: any) => {
                if (active) setError(e.response?.data?.error || e.response?.data?.message || 'Não foi possível carregar as aulas.');
            })
            .finally(() => {
                if (active) setBusy(false);
            });
        return () => {
            active = false;
        };
    }, [ocorrenciaId]);

    if (busy) return <main><h1>Aulas</h1><p className="aluno-portal-msg">Carregando...</p></main>;
    if (error) return <main><h1>Aulas</h1>
        <div className="aluno-portal-error" role="alert">{error}</div>
    </main>;

    return (
        <main className="aluno-portal">
            <p className="aluno-portal-item-acoes"><Link to="/aluno/aula">Voltar Cursos</Link></p>
            <h1>Aulas</h1>
            <p className="aluno-portal-saudacao">Selecione a aula:</p>
            {aulas.length === 0 && <p className="aluno-portal-msg">Nenhuma aula encontrada.</p>}
            <div className="aluno-portal-boletim-lista">
                {aulas.map(a => (
                    <Link
                        key={a.id}
                        to={`/aluno/aula/aula/${a.id}`}
                        className="aluno-portal-item aluno-portal-link-cartao"
                        style={{textDecoration: 'none'}}
                    >
                        <h2>{a.nome || `Aula ${a.id}`}</h2>
                    </Link>
                ))}
            </div>
        </main>
    );
}
