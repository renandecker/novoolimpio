import {useEffect, useState} from 'react';

import {Link} from 'react-router-dom';

import {aulaApi, ContratoAula} from '../../professor/aula';

import '../../aluno/AlunoPortal.css';



export default function AulaContratoScreen() {

    const [contratos, setContratos] = useState<ContratoAula[]>([]);

    const [error, setError] = useState('');

    const [busy, setBusy] = useState(true);



    useEffect(() => {

        let active = true;

        aulaApi

            .contratos()

            .then(data => {

                if (active) setContratos(data ?? []);

            })

            .catch((e: any) => {

                if (active) setError(e.response?.data?.error || e.response?.data?.message || 'Não foi possível carregar os cursos.');

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

            <h1>Aulas do aluno</h1>

            <p className="aluno-portal-saudacao">Selecione o curso:</p>

            {contratos.length === 0 && <p className="aluno-portal-msg">Nenhum curso encontrado.</p>}

            <div className="aluno-portal-boletim-lista">

                {contratos.map(c => (

                    <Link

                        key={c.id}

                        to={`/aluno/aula/oferecimentos/${c.id}`}

                        className="aluno-portal-item aluno-portal-link-cartao"

                        style={{textDecoration: 'none'}}

                    >

                        <h2>{c.curso || `Curso ${c.id}`}</h2>

                    </Link>

                ))}

            </div>

        </main>

    );

}

