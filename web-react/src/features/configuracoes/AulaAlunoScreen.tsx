import {useCallback, useEffect, useState} from 'react';
import {Link, useParams} from 'react-router-dom';
import {aulaApi, Aula, AulaAnexo} from '../../features/professor/aula';
import '../../features/aluno/AlunoPortal.css';

export default function AulaAlunoScreen() {
    const {aulaId} = useParams<{ aulaId: string }>();
    const [aula, setAula] = useState<Aula | null>(null);
    const [anexos, setAnexos] = useState<AulaAnexo[]>([]);
    const [jaAssistida, setJaAssistida] = useState(false);
    const [error, setError] = useState('');
    const [busy, setBusy] = useState(true);
    const [marcando, setMarcando] = useState(false);

    useEffect(() => {
        let active = true;
        Promise.all([aulaApi.aula(Number(aulaId)), aulaApi.anexosDaAula(Number(aulaId)), aulaApi.jaAssistida(Number(aulaId))])
            .then(([a, anexos, assistida]) => {
                if (!active) return;
                setAula(a);
                setAnexos(anexos ?? []);
                setJaAssistida(assistida);
            })
            .catch((e: any) => {
                if (active) setError(e.response?.data?.error || e.response?.data?.message || 'Não foi possível carregar a aula.');
            })
            .finally(() => {
                if (active) setBusy(false);
            });
        return () => {
            active = false;
        };
    }, [aulaId]);

    const marcarAssistida = useCallback(() => {
        setMarcando(true);
        aulaApi
            .marcarAssistida(Number(aulaId))
            .then(() => setJaAssistida(true))
            .catch((e: any) => setError(e.response?.data?.error || e.response?.data?.message || 'Não foi possível marcar a aula como assistida.'))
            .finally(() => setMarcando(false));
    }, [aulaId]);

    if (busy) return <main><h1>Aula</h1><p className="aluno-portal-msg">Carregando...</p></main>;
    if (error) return <main><h1>Aula</h1>
        <div className="aluno-portal-error" role="alert">{error}</div>
    </main>;
    if (!aula) return <main><h1>Aula</h1><p className="aluno-portal-msg">Aula não encontrada.</p></main>;

    const videos = anexos.filter(a => a.tipo === 'VIDEO');
    const documentos = anexos.filter(a => a.tipo === 'PDF' || a.tipo === 'IMAGEM');

    return (
        <main className="aluno-portal">
            <p className="aluno-portal-item-acoes"><Link to="/aluno/aulas">Voltar Aulas</Link></p>
            <h1>{aula.nome || `Aula ${aula.id}`}</h1>

            {videos.length > 0 && (
                <div className="aluno-portal-boletim-lista">
                    {videos.map(v => (
                        <section className="aluno-portal-item" key={v.id}>
                            <h3>{v.nome}</h3>
                            <iframe
                                title={v.nome}
                                width="640"
                                height="385"
                                src={v.anexo}
                                frameBorder="0"
                                allowFullScreen
                                style={{maxWidth: '100%'}}
                            />
                        </section>
                    ))}
                </div>
            )}

            {documentos.length > 0 && (
                <section className="aluno-portal-item">
                    <h3>Arquivos da Aula</h3>
                    <div className="aluno-portal-item-acoes" style={{flexWrap: 'wrap'}}>
                        {documentos.map(d => (
                            <a key={d.id} href={d.anexo} target="_blank" rel="noreferrer">{d.nome}</a>
                        ))}
                    </div>
                </section>
            )}

            {aula.descricao && (
                <section className="aluno-portal-item">
                    <h3>Informações</h3>
                    <p className="aluno-portal-msg" style={{margin: 0}}>{aula.descricao}</p>
                </section>
            )}

            <div className="aluno-portal-item-dados">
                {jaAssistida ? (
                    <span className="aluno-portal-status aluno-portal-status-aprovado">Aula assistida</span>
                ) : (
                    <button
                        type="button"
                        className="aluno-portal-botao"
                        onClick={marcarAssistida}
                        disabled={marcando}
                    >
                        {marcando ? 'Marcando...' : 'Marcar como assistida'}
                    </button>
                )}
            </div>
        </main>
    );
}
