import {useEffect, useState} from 'react';

import {useAuth} from '../../auth/auth';

import {alunoApi, formatarData} from '../../aluno/aluno';

import {api} from '../../../shared/services/api';

import {PhotoUploadModal} from '../../../shared/components/PhotoUploadModal';

import '../../usuario/MeusDados.css';



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

    const [photoModalOpen, setPhotoModalOpen] = useState(false);

    const handlePhotoUpdate = (fotoUrl: string) => {
        setFoto(fotoUrl);
        setDados((prev) => ({...prev, foto: fotoUrl}));
        if (session) {
            refreshSession({
                accessToken: session.accessToken,
                expiresAt: session.expiresAt,
                username: session.username,
                permissions: session.permissions,
                modulePermissions: session.modulePermissions,
                nome: session.nome,
                email: session.email,
                cpf: session.cpf,
                foto: fotoUrl,
            });
        }
    };



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

                /* mantém os dados da sessão quando o perfil não está disponível */

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

            setError(msg || 'Não foi possível salvar a foto.');

        } finally {

            setSaving(false);

        }

    }



    if (busy) return <main><h1>Meus dados</h1><p className="meus-dados-msg">Carregando...</p></main>;



    const nomeExibido = dados.nome || dados.username || 'Usuário';

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

                            <dt>Usuário</dt>

                            <dd>{dados.username || 'Não informado'}</dd>

                        </div>

                        <div className="meus-dados-item">

                            <dt>CPF</dt>

                            <dd>{dados.cpf || 'Não informado'}</dd>

                        </div>

                        <div className="meus-dados-item">

                            <dt>RG</dt>

                            <dd>{dados.rg || 'Não informado'}</dd>

                        </div>

                        <div className="meus-dados-item">

                            <dt>Data de nascimento</dt>

                            <dd>{formatarData(dados.dataNascimento)}</dd>

                        </div>

                        <div className="meus-dados-item">

                            <dt>Gênero</dt>

                            <dd>{dados.genero || 'Não informado'}</dd>

                        </div>

                        <div className="meus-dados-item">

                            <dt>Etnia</dt>

                            <dd>{dados.etnia || 'Não informado'}</dd>

                        </div>

                        <div className="meus-dados-item">

                            <dt>Estado civil</dt>

                            <dd>{dados.estadoCivil || 'Não informado'}</dd>

                        </div>

                        <div className="meus-dados-item">

                            <dt>Escolaridade</dt>

                            <dd>{dados.escolaridade || 'Não informado'}</dd>

                        </div>

                        <div className="meus-dados-item">

                            <dt>E-mail</dt>

                            <dd>{dados.email || 'Não informado'}</dd>

                        </div>

                        <div className="meus-dados-item">

                            <dt>Telefone</dt>

                            <dd>{dados.telefone || 'Não informado'}</dd>

                        </div>

                        <div className="meus-dados-item">

                            <dt>Celular</dt>

                            <dd>{dados.celular || 'Não informado'}</dd>

                        </div>

                        <div className="meus-dados-item">

                            <dt>Telefone comercial</dt>

                            <dd>{dados.telefoneComercial || 'Não informado'}</dd>

                        </div>

                        <div className="meus-dados-item">

                            <dt>Nome do pai</dt>

                            <dd>{dados.nomePai || 'Não informado'}</dd>

                        </div>

                        <div className="meus-dados-item">

                            <dt>Nome da mãe</dt>

                            <dd>{dados.nomeMae || 'Não informado'}</dd>

                        </div>

                        <div className="meus-dados-item">

                            <dt>Contato de referência</dt>

                            <dd>{dados.nomeReferencia || 'Não informado'}</dd>

                        </div>

                        <div className="meus-dados-item">

                            <dt>Telefone do contato</dt>

                            <dd>{dados.telefoneReferencia || 'Não informado'}</dd>

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

                        <button
                            type="button"
                            className="meus-dados-salvar"
                            onClick={() => setPhotoModalOpen(true)}
                        >
                            Alterar foto
                        </button>

                    </div>

                </div>

            </div>

            <PhotoUploadModal
                isOpen={photoModalOpen}
                onClose={() => setPhotoModalOpen(false)}
                onPhotoUpdate={handlePhotoUpdate}
                currentFoto={foto}
                username={session?.username}
            />

        </main>

    );

}

