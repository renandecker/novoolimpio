import {useEffect, useState} from 'react';
import {Link, useParams} from 'react-router-dom';
import {aulaApi, OferecimentoAula} from '../../features/professor/aula';
import '../../features/aluno/AlunoPortal.css';

export default function AulaOferecimentoScreen() {
    const {contratoId} = useParams<{ contratoId: string }>();
    const [oferecimentos, setOferecimentos] = useState<OferecimentoAula[]>([]);
    const [error, setError] = useState('');
    const [busy, setBusy] = useState(true);

    useEffect(() => {
        let active = true;
        aulaApi
            .oferecimentos(Number(contratoId))
            .then(data => {
                if (active) setOferecimentos(data ?? []);
            })
            .catch((e: any) => {
                if (active) setError(e.response?.data?.error || e.response?.data?.message || 'NÃ£o foi possÃ­vel carregar os mÃ³dulos.');
            })
            .finally(() => {
                if (active) setBusy(false);
            });
        return () => {
            active = false;
        };
    }, [contratoId]);

    if (busy) return <main><h1>MÃ³dulos</h1><p className="aluno-portal-msg">Carregando...</p></main>;
    if (error) return <main><h1>MÃ³dulos</h1>
        <div className="aluno-portal-error" role="alert">{error}</div>
    </main>;

    return (
        <main className="aluno-portal">
            <p className="aluno-portal-item-acoes"><Link to="/aluno/aula">Voltar Cursos</Link></p>
            <h1>MÃ³dulos</h1>
            <p className="aluno-portal-saudacao">Selecione o mÃ³dulo do curso:</p>
            {oferecimentos.length === 0 && <p className="aluno-portal-msg">Nenhum mÃ³dulo encontrado.</p>}
            <div className="aluno-portal-boletim-lista">
                {oferecimentos.map(o => (
                    <Link
                        key={o.id}
                        to={`/aluno/aula/ocorrencias/${o.id}`}
                        className="aluno-portal-item aluno-portal-link-cartao"
                        style={{textDecoration: 'none'}}
                    >
                        <h2>{o.modulo || `MÃ³dulo ${o.id}`}</h2>
                    </Link>
                ))}
            </div>
        </main>
    );
}
