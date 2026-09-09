import {useEffect, useState} from 'react';
import {Link, useParams} from 'react-router-dom';
import {aulaApi, formatarDataAula, OcorrenciaAula} from '../../features/professor/aula';
import '../../features/aluno/AlunoPortal.css';

export default function AulaOcorrenciaScreen() {
    const {oferecimentoId} = useParams<{ oferecimentoId: string }>();
    const [ocorrencias, setOcorrencias] = useState<OcorrenciaAula[]>([]);
    const [error, setError] = useState('');
    const [busy, setBusy] = useState(true);

    useEffect(() => {
        let active = true;
        aulaApi
            .ocorrencias(Number(oferecimentoId))
            .then(data => {
                if (active) setOcorrencias(data ?? []);
            })
            .catch((e: any) => {
                if (active) setError(e.response?.data?.error || e.response?.data?.message || 'Não foi possível carregar as ocorrências.');
            })
            .finally(() => {
                if (active) setBusy(false);
            });
        return () => {
            active = false;
        };
    }, [oferecimentoId]);

    if (busy) return <main><h1>Aulas</h1><p className="aluno-portal-msg">Carregando...</p></main>;
    if (error) return <main><h1>Aulas</h1>
        <div className="aluno-portal-error" role="alert">{error}</div>
    </main>;

    return (
        <main className="aluno-portal">
            <p className="aluno-portal-item-acoes"><Link to="/aluno/aula">Voltar Cursos</Link></p>
            <h1>Aulas</h1>
            <p className="aluno-portal-saudacao">Selecione a data da aula:</p>
            {ocorrencias.length === 0 && <p className="aluno-portal-msg">Nenhuma ocorrência encontrada.</p>}
            <div className="aluno-portal-boletim-lista">
                {ocorrencias.map(o => (
                    <Link
                        key={o.id}
                        to={`/aluno/aula/aulas/${o.id}`}
                        className="aluno-portal-item aluno-portal-link-cartao"
                        style={{textDecoration: 'none'}}
                    >
                        <h2>{formatarDataAula(o.data)}</h2>
                    </Link>
                ))}
            </div>
        </main>
    );
}
