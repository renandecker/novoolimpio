import {FormEvent, useState} from 'react';
import {api} from '../../shared/services/api';
import {useAuth} from './auth';
import '../AlterarSenha.css';

export default function ViewAlterarSenhaAlterarSenhaListScreen() {
    const {refreshSession} = useAuth();
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');
    const [busy, setBusy] = useState(false);

    async function submit(event: FormEvent) {
        event.preventDefault();
        if (newPassword.length < 6) {
            setError('A nova senha deve ter no mínimo 6 caracteres.');
            return;
        }
        if (newPassword !== confirmPassword) {
            setError('A confirmação da nova senha não confere.');
            return;
        }
        setBusy(true);
        setSuccess('');
        setError('');
        try {
            const {data} = await api.post<{ accessToken: string; expiresAt: number; username: string; permissions: string[] }>('/api/login/change-password', {
                currentPassword,
                newPassword,
            });
            refreshSession({
                accessToken: data.accessToken,
                expiresAt: data.expiresAt,
                username: data.username,
                permissions: data.permissions
            });
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
            setSuccess('Senha alterada com sucesso.');
        } catch (e: any) {
            setError(e.response?.data?.error || e.response?.data?.message || 'Não foi possível alterar a senha.');
        } finally {
            setBusy(false);
        }
    }

    return (
        <main>
            <h1>Trocar Senha</h1>
            <form className="alterar-senha-form" onSubmit={submit}>
                <div className="alterar-senha-field">
                    <label htmlFor="senha-atual">Senha atual</label>
                    <input
                        id="senha-atual"
                        type="password"
                        required
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        autoComplete="current-password"
                        placeholder="Digite sua senha atual"
                    />
                </div>
                <div className="alterar-senha-field">
                    <label htmlFor="nova-senha">Nova senha</label>
                    <input
                        id="nova-senha"
                        type="password"
                        required
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        autoComplete="new-password"
                        placeholder="Digite a nova senha"
                    />
                </div>
                <div className="alterar-senha-field">
                    <label htmlFor="confirmar-senha">Confirmar nova senha</label>
                    <input
                        id="confirmar-senha"
                        type="password"
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        autoComplete="new-password"
                        placeholder="Confirme a nova senha"
                    />
                </div>
                <button type="submit" className="alterar-senha-submit" disabled={busy}>
                    {busy ? 'Aguarde...' : 'Alterar senha'}
                </button>
                {success && (
                    <div className="alterar-senha-success" role="status">
                        {success}
                    </div>
                )}
                {error && (
                    <div className="alterar-senha-error" role="alert">
                        {error}
                    </div>
                )}
            </form>
        </main>
    );
}
