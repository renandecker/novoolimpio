import {useEffect, useState} from 'react';
import {alunoApi, Frequencia, formatarData, formatarPercentual, Matricula} from '../aluno';
import '../AlunoPortal.css';

const STATUS_ROTULO: Record<string, string> = {
    PRESENTE: 'Presente',
    'MEIA PRESENCE': 'Meia presença',
    AUSENTE: 'Ausente',
    ATESTADO: 'Atestado',
    ATRASADO: 'Atrasado',
    'SEM MARCACAO': 'Sem marcação',
    CANCELADO: 'Cancelado',
    PRORROGADO: 'Prorrogado',
    DESISTENTE: 'Desistente',
};

export default function AlunoFrequenciaScreen() {
    const [matriculas, setMatriculas] = useState<Matricula[]>([]);
    const [selecionada, setSelecionada] = useState<number | null>(null);
    const [frequencia, setFrequencia] = useState<Frequencia | null>(null);
    const [error, setError] = useState('');
    const [busy, setBusy] = useState(true);

    useEffect(() => {
        let active = true;
        alunoApi
            .matriculas()
            .then(data => {
                if (!active) return;
                setMatriculas(data ?? []);
                if (data && data.length > 0) setSelecionada(data[0].id);
            })
            .catch((e: any) => {
                if (active) setError(e.response?.data?.error || e.response?.data?.message || 'Não foi possível carregar as matrículas.');
            })
            .finally(() => {
                if (active) setBusy(false);
            });
        return () => {
            active = false;
        };
    }, []);

    useEffect(() => {
        if (selecionada == null) return;
        let active = true;
        setBusy(true);
        setError('');
        alunoApi
            .frequencia(selecionada)
            .then(data => {
                if (active) setFrequencia(data);
            })
            .catch((e: any) => {
                if (active) setError(e.response?.data?.error || e.response?.data?.message || 'Não foi possível carregar a frequência.');
            })
            .finally(() => {
                if (active) setBusy(false);
            });
        return () => {
            active = false;
        };
    }, [selecionada]);

    if (matriculas.length === 0 && !busy) {
        return (
            <main className="aluno-portal">
                <h1>Frequência</h1>
                {error ? <div className="aluno-portal-error" role="alert">{error}</div> :
                    <p className="aluno-portal-msg">Nenhuma matrícula encontrada.</p>}
            </main>
        );
    }

    return (
        <main className="aluno-portal">
            <h1>Frequência</h1>

            {matriculas.length > 1 && (
                <label className="aluno-portal-select">
                    <span>Matrícula:</span>
                    <select value={selecionada ?? ''} onChange={e => setSelecionada(Number(e.target.value))}>
                        {matriculas.map(m => (
                            <option key={m.id} value={m.id}>
                                {m.componente || m.curso}
                            </option>
                        ))}
                    </select>
                </label>
            )}

            {busy && <p className="aluno-portal-msg">Carregando...</p>}
            {error && <div className="aluno-portal-error" role="alert">{error}</div>}

            {frequencia && (
                <>
                    <section className="aluno-portal-boletim">
                        <div className="aluno-portal-item-cabecalho">
                            <div>
                                <h2>{frequencia.matricula.componente || frequencia.matricula.curso || 'Disciplina'}</h2>
                                <p className="aluno-portal-item-meta">
                                    {[frequencia.matricula.curso, frequencia.matricula.turma ? `Turma ${frequencia.matricula.turma}` : null, frequencia.matricula.periodo].filter(Boolean).join(' · ')}
                                </p>
                            </div>
                            <span className="aluno-portal-status">
                Frequência: {formatarPercentual(frequencia.frequenciaPerc)}
              </span>
                        </div>

                        <div className="aluno-portal-frequencia-contadores">
                            <span><strong>Aulas realizadas:</strong> {frequencia.aulasRealizadas}</span>
                            <span><strong>Presente:</strong> {frequencia.presentes}</span>
                            <span><strong>Meia presença:</strong> {frequencia.meias}</span>
                            <span><strong>Ausente:</strong> {frequencia.ausentes}</span>
                            <span><strong>Atestado:</strong> {frequencia.atestados}</span>
                            <span><strong>Atrasado:</strong> {frequencia.atrasos}</span>
                            <span><strong>Sem marcação:</strong> {frequencia.semMarcacao}</span>
                        </div>

                        {frequencia.ocorrencias.length === 0 ? (
                            <p className="aluno-portal-msg">Sem registros de presença.</p>
                        ) : (
                            <table className="aluno-portal-tabela">
                                <thead>
                                <tr>
                                    <th>Data</th>
                                    <th>Presença</th>
                                </tr>
                                </thead>
                                <tbody>
                                {frequencia.ocorrencias.map((o, i) => (
                                    <tr key={i}>
                                        <td>{formatarData(o.data)}</td>
                                        <td>
                        <span className="aluno-portal-status" style={{color: '#1e7e45'}}>
                          {o.presencaDescricao || o.presenca}
                        </span>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        )}
                    </section>
                </>
            )}
        </main>
    );
}
