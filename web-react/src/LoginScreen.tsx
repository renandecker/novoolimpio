import { FormEvent, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { api } from './api';
import { useAuth } from './auth';
import './LoginScreen.css';

export default function LoginScreen() {
  const { session, signIn } = useAuth();
  const location = useLocation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [bootstrap, setBootstrap] = useState(false);
  const [forgot, setForgot] = useState(false);
  const [forgotUsername, setForgotUsername] = useState('');
  const [forgotMessage, setForgotMessage] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (session) {
    return <Navigate to={(location.state as { from?: string } | null)?.from || session.defaultOutcome || '/default'} replace />;
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      await signIn(username, password, bootstrap);
    } catch (e: any) {
      setError(e.response?.data?.error || e.response?.data?.message || 'Não foi possível entrar.');
    } finally {
      setBusy(false);
    }
  }

  async function submitForgot(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setForgotMessage('');
    setError('');
    try {
      const { data } = await api.post<{ message: string }>('/api/login/forgot-password', { username: forgotUsername });
      setForgotMessage(data.message);
      setForgotUsername('');
    } catch (e: any) {
      setError(e.response?.data?.error || e.response?.data?.message || 'Não foi possível solicitar a redefinição de senha.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="login-page">
      <div className="login-topbar" />
      <div className="login-box">
        <div className="login-box-logo">
          <div className="logo-badge">O</div>
          <div className="logo-text">Olímpio</div>
        </div>
        {forgot ? (
          <>
            <p className="login-forgot-hint">
              Informe o seu usuário para receber por e-mail uma senha provisória.
            </p>
            <div className="login-box-input">
              <label>Usuário</label>
              <input
                required
                value={forgotUsername}
                onChange={(e) => setForgotUsername(e.target.value)}
                autoComplete="username"
                placeholder="Digite seu usuário"
              />
            </div>
            <div className="login-box-input">
              <button type="submit" className="login-button" disabled={busy} onClick={submitForgot}>
                {busy ? 'Aguarde...' : 'Enviar senha provisória'}
              </button>
            </div>
            {forgotMessage && (
              <div className="login-success" role="status">
                {forgotMessage}
              </div>
            )}
            {error && (
              <div className="login-error" role="alert">
                {error}
              </div>
            )}
            <button
              type="button"
              className="login-toggle"
              onClick={() => {
                setForgot(false);
                setForgotMessage('');
                setError('');
              }}
            >
              Voltar para o login
            </button>
          </>
        ) : (
          <>
            <div className="login-box-input">
              <label>Usuário</label>
              <input
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                placeholder="Digite seu usuário"
              />
            </div>
            <div className="login-box-input">
              <label>Senha</label>
              <input
                required
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete={bootstrap ? 'new-password' : 'current-password'}
                placeholder="Digite sua senha"
              />
            </div>
            <div className="login-box-input">
              <button type="submit" className="login-button" disabled={busy} onClick={submit}>
                {busy ? 'Aguarde...' : bootstrap ? 'Criar e entrar' : 'Entrar'}
              </button>
            </div>
            {error && (
              <div className="login-error" role="alert">
                {error}
              </div>
            )}
            <button
              type="button"
              className="login-toggle"
              onClick={() => {
                setBootstrap(!bootstrap);
                setError('');
              }}
            >
              {bootstrap ? 'Já tenho acesso' : 'Criar primeiro acesso'}
            </button>
            <button
              type="button"
              className="login-toggle"
              onClick={() => {
                setForgot(true);
                setError('');
              }}
            >
              Esqueci minha senha
            </button>
          </>
        )}
      </div>
      <div className="login-bottombar" />
    </main>
  );
}
