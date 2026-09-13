import {useEffect, useState} from 'react';

import {Link} from 'react-router-dom';

import {alunoApi, Boletim, Grau, formatarNota, formatarPercentual} from '../../aluno/aluno';

import '../../aluno/AlunoPortal.css';



const STATUS_ROTULO: Record<string, string> = {

    APROVADO: 'Aprovado',

    'EM EXAME': 'Em exame',

    'REPROVADO POR FREQUÃŠNCIA': 'Reprovado por frequência',

    'SEM NOTAS': 'Sem notas',

};



export default function AlunoBoletimScreen() {

    const [boletins, setBoletins] = useState<Boletim[]>([]);

    const [error, setError] = useState('');

    const [busy, setBusy] = useState(true);



    useEffect(() => {

        let active = true;

        alunoApi

            .boletim()

            .then(data => {

                if (active) setBoletins(data ?? []);

            })

            .catch((e: any) => {

                if (active) setError(e.response?.data?.error || e.response?.data?.message || 'Não foi possível carregar o boletim.');

            })

            .finally(() => {

                if (active) setBusy(false);

            });

    }, []);



    if (busy) return <main><h1>Notas</h1><p className="aluno-portal-msg">Carregando...</p></main>;

    if (error) return <main><h1>Notas</h1>

        <div className="aluno-portal-error" role="alert">{error}</div>

    </main>;

    if (boletins.length === 0) return <main><h1>Notas</h1><p className="aluno-portal-msg">Nenhuma nota encontrada.</p></main>;



    return (

        <main className="aluno-portal">

            <h1>Notas</h1>

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

                {STATUS_ROTULO[b.status] ?? b.status}

                        </span>

                    </div>



                    {b.graus.map(grau => (

                        <div className="aluno-portal-grau" key={grau.id}>

                            <h3>{grau.descricao}</h3>

                            {grau.notas.length === 0 ? (

                                <p className="aluno-portal-msg">Sem notas lançadas.</p>

                            ) : (

                                <table className="aluno-portal-tabela">

                                    <thead>

                                    <tr>

                                        <th>Avaliação</th>

                                        <th>Peso</th>

                                        <th>Nota</th>

                                    </tr>

                                    </thead>

                                    <tbody>

                                    {grau.notas.map(nota => (

                                        <tr key={nota.id}>

                                            <td>

                                                {nota.nome}

                                                {nota.numeroNota ? ` (${nota.numeroNota}ª)` : ''}

                                            </td>

                                            <td>{nota.peso != null ? formatarNota(nota.peso) : '-'}</td>

                                            <td>{nota.nota != null ? formatarNota(nota.nota) : <em>pendente</em>}</td>

                                        </tr>

                                    ))}

                                    </tbody>

                                </table>

                            )}

                            {grau.mediaFinal != null && grau.mediaFinal !== grau.mediaSemExame && (

                                <p className="aluno-portal-grau-rodape">Média para

                                    aprovação: <strong>{formatarNota(grau.mediaFinal)}</strong></p>

                            )}

                        </div>

                    ))}

                </section>

            ))}

            <p className="aluno-portal-msg aluno-portal-data">Emitido em {new Date().toISOString()}</p>

        </main>

    );

}

