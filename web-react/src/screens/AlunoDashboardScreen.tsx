import {useEffect, useState} from 'react';
import {Link} from 'react-router-dom';
import {alunoApi, AulaAluno, BoletimResumo, formatarNota, formatarPercentual} from '../aluno';
import '../AlunoPortal.css';

const STATUS_ROTULO: Record<string, string> = {
    APROVADO: 'Aprovado',
    'EM EXAME': 'Em exame',
    'REPROVADO POR FREQUÊNCIA': 'Reprovado por frequência',
    'SEM NOTAS': 'Sem notas',
};

export default function AlunoDashboardScreen() {
    const [nome, setNome] = useState('');
    const [boletins, setBoletins] = useState<BoletimResumo[]>([]);
    const [chamadas, setChamadas] = useState<AulaAluno[]>([]);
    const [error, setError] = useState('');
    const [busy, setBusy] = useState(true);

    useEffect(() => {
        let active = true;
        Promise.all([alunoApi.perfil(), alunoApi.dashboard(), alunoApi.chamadas()])
            .then(([perfil, dashboard, chamadasData]) => {
                if (!active) return;
                setNome(perfil.nome || perfil.username || '');
                setBoletins(dashboard.boletins ? ? []);
                setChamadas(chamadasData ? ? []);
            })
            .catch((e: any) => {
                if (active) setError(e.response?.data?.error || e.response?.data?.message || 'Não foi possível carregar o painel do aluno.');
            })
            .finally(() => {
                if (active) setBusy(false);
            });
        return () => {
            active = false;
        };
    }, []);

    if (busy) return <main><h1>Portal do Aluno</h1><p className="aluno-portal-msg">Carregando...</p></main>;
    if (error) return <main><h1>Portal do Aluno</h1>
        <div className="aluno-portal-error" role="alert">{error}</div>
    </main>;

    const aprovadas = boletins.filter(b => b.status === 'APROVADO').length;

    return (
        <main className="aluno-portal">
            <h1>Portal do Aluno</h1>
            <p className="aluno-portal-saudacao">Olá, <strong>{nome}</strong>! Este é o seu painel acadêmico.</p>

            <div className="aluno-portal-cards">
                <div className="aluno-portal-card">
                    <span className="aluno-portal-card-valor">{boletins.length}</span>
                    <span className="aluno-portal-card-rotulo">Matrículas</span>
                </div>
                <div className="aluno-portal-card">
                    <span className="aluno-portal-card-valor">{aprovadas}</span>
                    <span className="aluno-portal-card-rotulo">Disciplinas aprovadas</span>
                </div>
            </div>

            {boletins.length === 0 && <p className="aluno-portal-msg">Nenhuma matrícula encontrada.</p>}

            <div className="aluno-portal-boletim-lista">
                {boletins.map(b => (
                    <section className="aluno-portal-item" key={b.matricula.id}>
                        <div className="aluno-portal-item-cabecalho">
                            <div>
                                <h2>{b.matricula.componente || b.matricula.curso || 'Disciplina'}</h2>
                                <p className="aluno-portal-item-meta">
                                    {[b.matricula.curso, b.matricula.turma ? `Turma ${b.matricula.turma}` : null, b.matricula.periodo].filter(Boolean).join(' · ')}
                                </p>
                            </div>
                            <span
                                className={`aluno-portal-status aluno-portal-status-${String(b.status).toLowerCase().replace(/\s+/g, '-')}`}>
                {STATUS_ROTULO[b.status] ? ? b.status}
              </span>
                        </div>
                        <div className="aluno-portal-item-dados">
                            <span><strong>Média:</strong> {formatarNota(b.media)}</span>
                            <span><strong>Frequência:</strong> {formatarPercentual(b.frequenciaPerc)}</span>
                        </div>
                        <div className="aluno-portal-item-acoes">
                            <Link to="/aluno/boletim">Ver boletim</Link>
                            <Link to="/aluno/frequencia">Ver frequência</Link>
                            <Link to="/aluno/aulas">Ver aulas</Link>
                            <Link to="/aluno/avaliacoes">Ver avaliações</Link>
                        </div>
                    </section>
                ))}
            </div>

            {chamadas.length > 0 && (
                <div className="aluno-portal-chamadas">
                    <h2>Minhas Chamadas</h2>
                    <p className="aluno-portal-msg">Total de aulas registradas: {chamadas.length}</p>
                    <ul>
                        {chamadas.map(c => (
                            <li key={c.id}>
                                <strong>{c.nome}</strong> - {c.descricao || ''}
                                {c.componente && <span>({c.componente})</span>}
                                {c.turma && <span>Turma: {c.turma}</span>}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </main>
    );
}
