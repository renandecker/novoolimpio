import {useEffect, useState} from 'react';
import {Link} from 'react-router-dom';
import {alunoApi, AulaAluno, formatarData} from '../aluno';
import '../AlunoPortal.css';

export default function AlunoAulasScreen() {
    const [aulas, setAulas] = useState<AulaAluno[]>([]);
    const [error, setError] = useState('');
    const [busy, setBusy] = useState(true);

    useEffect(() => {
        let active = true;
        alunoApi
            .chamadas()
            .then(data => {
                if (!active) return;
                setAulas(data ?? []);
            })
            .catch((e: any) => {
                if (active) setError(e.response?.data?.error || e.response?.data?.message || 'Não foi possível carregar as chamadas.');
            })
            .finally(() => {
                if (active) setBusy(false);
            });
        return () => {
            active = false;
        };
    }, []);

    if (busy) return <main><h1>Registro de Aulas</h1><p className="aluno-portal-msg">Carregando...</p></main>;
    if (error) return <main><h1>Registro de Aulas</h1>
        <div className="aluno-portal-error" role="alert">{error}</div>
    </main>;

    return (
        <main className="aluno-portal">
            <h1>Registro de Aulas</h1>
            <p className="aluno-portal-msg">Total de aulas registradas: {aulas.length}</p>

            {aulas.length === 0 && <p className="aluno-portal-msg">Nenhuma chamada encontrada.</p>}

            <div className="aluno-portal-chamadas-tabela">
                <table className="aluno-portal-tabela">
                    <thead>
                    <tr>
                        <th>Componente Curricular</th>
                        <th>Turma</th>
                        <th>Aula</th>
                        <th>Descrição</th>
                        <th>Data da Aula</th>
                        <th>Data Assistida</th>
                        <th>Situação</th>
                    </tr>
                    </thead>
                    <tbody>
                    {aulas.map(a => (
                        <tr key={a.id}>
                            <td>{a.componente || 'N/A'}</td>
                            <td>{a.turma ? `Turma ${a.turma}` : 'N/A'}</td>
                            <td>{a.nome || `Aula ${a.id}`}</td>
                            <td>{a.descricao || '-'}</td>
                            <td>{formatarData(a.dataAula)}</td>
                            <td>{formatarData(a.dataAssistida)}</td>
                            <td>
                                {a.dataAssistida ? 'Assistida' : 'Não assistida'}
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </main>
    );
}