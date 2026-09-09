import {useEffect, useState} from 'react';

import {Link} from 'react-router-dom';

import {alunoApi, AvaliacaoAluno, formatarData} from '../../features/aluno/aluno';

import '../../features/aluno/AlunoPortal.css';



export default function AlunoAvaliacoesScreen() {

    const [avaliacoes, setAvaliacoes] = useState<AvaliacaoAluno[]>([]);

    const [error, setError] = useState('');

    const [busy, setBusy] = useState(true);



    useEffect(() => {

        let active = true;

        alunoApi

            .avaliacoes()

            .then(data => {

                if (!active) return;

                setAvaliacoes(data ?? []);

            })

            .catch((e: any) => {

                if (active) setError(e.response?.data?.error || e.response?.data?.message || 'Não foi possível carregar as avaliações.');

            })

            .finally(() => {

                if (active) setBusy(false);

            });

        return () => {

            active = false;

        };

    }, []);



    if (busy) return <main><h1>Avaliações do Aluno</h1><p className="aluno-portal-msg">Carregando...</p></main>;

    if (error) return <main><h1>Avaliações do Aluno</h1>

        <div className="aluno-portal-error" role="alert">{error}</div>

    </main>;



    return (

        <main className="aluno-portal">

            <h1>Avaliações do Aluno</h1>

            <p className="aluno-portal-msg">Total de avaliações: {avaliacoes.length}</p>



            {avaliacoes.length === 0 && <p className="aluno-portal-msg">Nenhuma avaliação encontrada.</p>}



            <div className="aluno-portal-avaliacoes-lista">

                {avaliacoes.map(a => (

                    <section className="aluno-portal-item" key={a.id}>

                        <div className="aluno-portal-item-cabecalho">

                            <div>

                                <h2>{a.nome || `Avaliação ${a.id}`}</h2>

                                <p className="aluno-portal-item-meta">

                                    {[a.componente, a.turma ? 'Turma ' + a.turma : '', a.descricao]

                                        .filter(Boolean).join(' • ')}

                                </p>

                            </div>

                            <span className={`aluno-portal-situacao ${a.respondida ? 'ok' : a.ativa ? 'pendente' : 'fechada'}`}>

                                {a.respondida ? 'Respondida' : a.ativa ? 'Disponível' : 'Fechada'}

                            </span>

                        </div>



                        <div className="aluno-portal-item-dados">

                            <p><strong>Início:</strong> {formatarData(a.dataInicial)}</p>

                            <p><strong>Fim:</strong> {formatarData(a.dataFinal)}</p>

                        </div>



                        <div className="aluno-portal-item-acoes">

                            {(a.ativa || a.respondida) && (

                                <Link to={`/aluno/avaliacao/${a.id}`}>{a.respondida ? 'Ver respostas' : 'Responder'}</Link>

                            )}

                        </div>

                    </section>

                ))}

            </div>

        </main>

    );

}

