import { useEffect, useState } from 'react';
import { useAuth } from '../auth';
import { alunoApi, formatarData } from '../aluno';
import { api } from '../api';
import { Base64FileUpload } from '../Base64FileUpload';
import '../MeusDados.css';

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
};

export default function MeusDadosScreen() {
  const { session, refreshSession } = useAuth();
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
      const { data } = await api.put<{ foto: string }>('/api/basico/usuario/foto-base64', { foto });
      const fotoFinal = data.foto ?? foto;
      setFoto(fotoFinal);
      setDados((prev) => ({ ...prev, foto: fotoFinal }));
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
            <img src={foto} alt={nomeExibido} />
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
              label="Foto do perfil (JPG/PNG, máx. 5 MB)"
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
