import {useEffect, useState} from 'react';
import {useAuth} from '../../features/auth/auth';
import {alunoApi, formatarData} from '../../features/aluno/aluno';
import {api} from '../../shared/services/api';
import {Base64FileUpload} from '../../shared/components/Base64FileUpload';
import '../../features/usuario/MeusDados.css';

type MeusDados = {
    username: string;
    nome: string;
    nomeSocial: string;
    cpf: string;
    rg: string;
    dataNascimento: string;
    email: string;
    telefone: string;
    celular: string;
    foto: string;
    nomePai: string;
    nomeMae: string;
    nomeReferencia: string;
    telefoneReferencia: string;
    facebook: string;
    twitter: string;
    telefoneComercial: string;
    genero: string;
    etnia: string;
    escolaridade: string;
    estadoCivil: string;
};

export default function MeusDadosScreen() {
    const {session, refreshSession} = useAuth();
    const [dados, setDados] = useState<MeusDados>({
        username: session?.username || '',
        nome: session?.nome || '',
        nomeSocial: '',
        cpf: session?.cpf || '',
        rg: '',
        dataNascimento: '',
        email: session?.email || '',
        telefone: '',
        celular: '',
        foto: session?.foto || '',
        nomePai: '',
        nomeMae: '',
        nomeReferencia: '',
        telefoneReferencia: '',
        facebook: '',
        twitter: '',
        telefoneComercial: '',
        genero: '',
        etnia: '',
        escolaridade: '',
        estadoCivil: '',
    });
    const [foto, setFoto] = useState(session?.foto || '');
    const [busy, setBusy] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        let active = true;
        alunoApi
            .perfil()
            .then((perfil) => {
                if (!active) return;
                setDados((prev) => ({
                    username: perfil.username || prev.username,
                    nome: perfil.nome || prev.nome,
                    nomeSocial: perfil.nomeSocial || '',
                    cpf: perfil.cpf || prev.cpf,
                    rg: perfil.rg || '',
                    dataNascimento: perfil.dataNascimento || '',
                    email: perfil.email || prev.email,
                    telefone: perfil.telefone || '',
                    celular: perfil.celular || '',
                    foto: perfil.foto || prev.foto,
                    nomePai: perfil.nomePai || '',
                    nomeMae: perfil.nomeMae || '',
                    nomeReferencia: perfil.nomeReferencia || '',
                    telefoneReferencia: perfil.telefoneReferencia || '',
                    facebook: perfil.facebook || '',
                    twitter: perfil.twitter || '',
                    telefoneComercial: perfil.telefoneComercial || '',
                    genero: perfil.genero || '',
                    etnia: perfil.etnia || '',
                    escolaridade: perfil.escolaridade || '',
                    estadoCivil: perfil.estadoCivil || '',
                }));
                if (perfil.foto) setFoto(perfil.foto);
            })
            .catch(() => {
                /* mantÃ©m os dados da sessÃ£o quando o perfil nÃ£o estÃ¡ disponÃ­vel */
            })
            .finally(() => {
                if (active) setBusy(false);
            });
        return () => {
            active = false;
        };
    }, []);

    async function salvarFoto() {
        if (!session) return;
        setSaving(true);
        setSaved(false);
        setError('');
        try {
            const {data} = await api.put<{ foto: string }>('/api/basico/usuario/foto-base64', {foto});
            const fotoFinal = data.foto ?? foto;
            setFoto(fotoFinal);
            setDados((prev) => ({...prev, foto: fotoFinal}));
            refreshSession({
                accessToken: session.accessToken,
                expiresAt: session.expiresAt,
                username: session.username,
                permissions: session.permissions,
                modulePermissions: session.modulePermissions,
                foto: fotoFinal,
            });
            setSaved(true);
        } catch (e) {
            const msg = (e as { response?: { data?: { error?: string } } })?.response?.data?.error;
            setError(msg || 'NÃ£o foi possÃ­vel salvar a foto.');
        } finally {
            setSaving(false);
        }
    }

    if (busy) return <main><h1>Meus dados</h1><p className="meus-dados-msg">Carregando...</p></main>;

    const nomeExibido = dados.nome || dados.username || 'UsuÃ¡rio';
    const inicial = (dados.nome || dados.username || '?').charAt(0).toUpperCase();

    return (
        <main className="meus-dados">
            <h1>Meus dados</h1>

            <div className="meus-dados-card">
                <div className="meus-dados-foto">
                    {foto ? (
                        <img src={foto} alt={nomeExibido}/>
                    ) : (
                        <div className="meus-dados-foto-avatar">{inicial}</div>
                    )}
                </div>

                <div className="meus-dados-conteudo">
                    <h2 className="meus-dados-nome">{nomeExibido}</h2>
                    {dados.nomeSocial && <p className="meus-dados-social">{dados.nomeSocial}</p>}

                    <dl className="meus-dados-grid">
                        <div className="meus-dados-item">
                            <dt>UsuÃ¡rio</dt>
                            <dd>{dados.username || 'NÃ£o informado'}</dd>
                        </div>
                        <div className="meus-dados-item">
                            <dt>CPF</dt>
                            <dd>{dados.cpf || 'NÃ£o informado'}</dd>
                        </div>
                        <div className="meus-dados-item">
                            <dt>RG</dt>
                            <dd>{dados.rg || 'NÃ£o informado'}</dd>
                        </div>
                        <div className="meus-dados-item">
                            <dt>Data de nascimento</dt>
                            <dd>{formatarData(dados.dataNascimento)}</dd>
                        </div>
                        <div className="meus-dados-item">
                            <dt>GÃªnero</dt>
                            <dd>{dados.genero || 'NÃ£o informado'}</dd>
                        </div>
                        <div className="meus-dados-item">
                            <dt>Etnia</dt>
                            <dd>{dados.etnia || 'NÃ£o informado'}</dd>
                        </div>
                        <div className="meus-dados-item">
                            <dt>Estado civil</dt>
                            <dd>{dados.estadoCivil || 'NÃ£o informado'}</dd>
                        </div>
                        <div className="meus-dados-item">
                            <dt>Escolaridade</dt>
                            <dd>{dados.escolaridade || 'NÃ£o informado'}</dd>
                        </div>
                        <div className="meus-dados-item">
                            <dt>E-mail</dt>
                            <dd>{dados.email || 'NÃ£o informado'}</dd>
                        </div>
                        <div className="meus-dados-item">
                            <dt>Telefone</dt>
                            <dd>{dados.telefone || 'NÃ£o informado'}</dd>
                        </div>
                        <div className="meus-dados-item">
                            <dt>Celular</dt>
                            <dd>{dados.celular || 'NÃ£o informado'}</dd>
                        </div>
                        <div className="meus-dados-item">
                            <dt>Telefone comercial</dt>
                            <dd>{dados.telefoneComercial || 'NÃ£o informado'}</dd>
                        </div>
                        <div className="meus-dados-item">
                            <dt>Nome do pai</dt>
                            <dd>{dados.nomePai || 'NÃ£o informado'}</dd>
                        </div>
                        <div className="meus-dados-item">
                            <dt>Nome da mÃ£e</dt>
                            <dd>{dados.nomeMae || 'NÃ£o informado'}</dd>
                        </div>
                        <div className="meus-dados-item">
                            <dt>Contato de referÃªncia</dt>
                            <dd>{dados.nomeReferencia || 'NÃ£o informado'}</dd>
                        </div>
                        <div className="meus-dados-item">
                            <dt>Telefone do contato</dt>
                            <dd>{dados.telefoneReferencia || 'NÃ£o informado'}</dd>
                        </div>
                        {dados.facebook && (
                            <div className="meus-dados-item">
                                <dt>Facebook</dt>
                                <dd>{dados.facebook}</dd>
                            </div>
                        )}
                        {dados.twitter && (
                            <div className="meus-dados-item">
                                <dt>Twitter</dt>
                                <dd>{dados.twitter}</dd>
                            </div>
                        )}
                    </dl>

                    <div className="meus-dados-foto-editar">
                        <Base64FileUpload
                            value={foto}
                            onChange={(v) => {
                                setFoto(v);
                                setSaved(false);
                                setError('');
                            }}
                            accept="image/*"
                            label="Foto do perfil (JPG/PNG, mÃ¡x. 5 MB)"
                            onError={(m) => setError(m)}
                        />
                        <button
                            type="button"
                            className="meus-dados-salvar"
                            onClick={salvarFoto}
                            disabled={saving || foto === (dados.foto || '')}
                        >
                            {saving ? 'Salvando...' : 'Salvar foto'}
                        </button>
                        {error && <div className="meus-dados-error" role="alert">{error}</div>}
                        {saved && <span className="meus-dados-ok" role="status">Foto salva com sucesso.</span>}
                    </div>
                </div>
            </div>
        </main>
    );
}
