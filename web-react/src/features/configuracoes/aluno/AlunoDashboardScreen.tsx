import {useEffect, useState} from 'react';

import {Link} from 'react-router-dom';

import {alunoApi, AulaAluno, BoletimResumo, formatarNota, formatarPercentual} from '../../aluno/aluno';

import {Base64FileUpload} from '../../../shared/components/Base64FileUpload';

import {CurriculumAttachmentModal} from '../curriculo/CurriculumAttachmentModal';

import '../../aluno/AlunoPortal.css';



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

    const [showCurriculoAttachment, setShowCurriculoAttachment] = useState(false);

    const [curriculoFileName, setCurriculoFileName] = useState<string>('');

    const [curriculoFileBase64, setCurriculoFileBase64] = useState<string | null>(null);



    useEffect(() => {

        let active = true;

        Promise.all([alunoApi.perfil(), alunoApi.dashboard(), alunoApi.chamadas()])

            .then(([perfil, dashboard, chamadasData]) => {

                if (!active) return;

                setNome(perfil.nome || perfil.username || '');

                setBoletins(dashboard.boletins ?? []);

                setChamadas(chamadasData ?? []);

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



    if (busy) return <main><h1>Portal do aluno</h1><p className="aluno-portal-msg">Carregando...</p></main>;

    if (error) return <main><h1>Portal do aluno</h1>

        <div className="aluno-portal-error" role="alert">{error}</div>

    </main>;



    const aprovadas = boletins.filter(b => b.status === 'APROVADO').length;



    return (

        <main className="aluno-portal">

            <h1>Portal do aluno</h1>

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

                {STATUS_ROTULO[b.status] ?? b.status}

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

                            <Link to="/aluno/curriculo-anexo">Anexar currículo</Link>

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



            <div style={{marginTop: 32, padding: 16, background: '#f8f9fa', borderRadius: 8}}>

                <h3>Anexar Currículo</h3>

                <p style={{color: '#666', marginBottom: 16}}>Upload de documento de currículo do aluno.</p>

                <Base64FileUpload

                    value={curriculoFileBase64 || ''}

                    onChange={(dataUrl) => setCurriculoFileBase64(dataUrl)}

                    accept="application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"

                    label="Documento de Currículo"

                />

                {curriculoFileBase64 && (

                    <p style={{color: '#2a5a88', marginTop: 8}}>Documento anexado com sucesso.</p>

                )}

            </div>



            <CurriculumAttachmentModal

                visible={showCurriculoAttachment}

                onClose={() => setShowCurriculoAttachment(false)}

                onAttachmentUpdate={(fileBase64, fileName) => {

                    setCurriculoFileBase64(fileBase64);

                    setCurriculoFileName(fileName);

                    alert('Currículo anexado com sucesso!');

                }}

                currentFileName={curriculoFileName}

                currentFileBase64={curriculoFileBase64}

            />

        </main>

    );

}

