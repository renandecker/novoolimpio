import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from './auth';
import './UserMenu.css';

const StarIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M12 .587l3.668 7.566 8.332 1.151-6.064 5.828 1.48 8.279L12 19.446l-7.416 3.966 1.48-8.279L3.332 9.305z"/></svg>
);
const KeyIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M12 1L3 6v12l9 7 9-7V6l-9-5zM12 7c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 1.8c-.66 0-1.2.54-1.2 1.2 0 .66.54 1.2 1.2 1.2.66 0 1.2-.54 1.2-1.2 0-.66-.54-1.2-1.2-1.2zM12 2C7.58 2 4 5.58 4 10c0 2.28 1.18 4.37 3 5.53V14c0-2.76 2.24-5 5-5h2V6.41C11.93 6.13 12.94 6 12 6c-4.42 0-8 3.58-8 8 0 1.86.61 3.58 1.66 4.93.15.2.33.38.51.54L8 20.5V22c0 .55.45 1 1 1h2c.28 0 .5-.22.5-.5v-3.36l2.3-2.3c2.65-.93 4.5-3.5 4.5-6.64C19 8.58 15.42 2 12 2zm0 2c.34 0 .67.06 1 .17V6c0 1.66-1.34 3-3 3s-3-1.34-3-3S8.34 4 12 4z"/></svg>
);
const UserIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
);
const PowerIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M13 3a1 1 0 0 0-1 1v8a1 1 0 0 0 2 0V4a1 1 0 0 0-1-1zm7.99 7h-.01c0-.28.01-.56.01-.83A9 9 0 0 1 17 3.34v2.13c2.19 1.4 3.65 3.87 3.98 6.69h-.01c-.28 0-.56.01-.83.01C16 12 12 8 8 12c0 .28-.01.56-.02.83v-.01c0 3.86 3.14 7 7 7s7-3.14 7-7zm-3.99 4.71c-.43 0-.77.42-.77.95S16.57 18 17 18s.77-.42.77-.95c0-.53-.34-.95-.77-.95zm-1.41-3.09c0-.77.63-1.4 1.4-1.4.55 0 .99.44.99.99 0 .78-.63 1.4-1.4 1.4-.55 0-.99-.44-.99-.99z"/></svg>
);

export function UserMenu() {
  const { session, signOut } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };

    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [open]);

  if (!session) return null;

  const displayName = session.nome || session.username || 'Usuário';
  const displayEmail = session.email || 'Não informado';
  const displayCpf = session.cpf || 'Não informado';
  const avatarInitial = (session.nome || session.username || '?').charAt(0).toUpperCase();
  const hasFoto = !!session.foto;

  const handleLogout = () => {
    setOpen(false);
    signOut();
    navigate('/login');
  };

  return (
    <div className="user-menu-container" ref={containerRef}>
      <button
        className="user-menu-trigger"
        onClick={() => setOpen(!open)}
        type="button"
      >
        <span className="user-avatar">
          {hasFoto ? (
            <img src={session.foto} alt={displayName} className="user-avatar-img" />
          ) : (
            avatarInitial
          )}
        </span>
        <span className="user-name">{displayName}</span>
      </button>

      {open && (
        <div className="user-menu-dropdown">
          <div className="user-menu-header">
            <div className="user-info-row">
              <div className="user-photo-wrapper">
                {hasFoto ? (
                  <img src={session.foto} alt={displayName} className="user-photo-large" />
                ) : (
                  <div className="user-photo-large-avatar">{avatarInitial}</div>
                )}
              </div>
              <div className="user-details">
                <div className="user-name-display">{displayName}</div>
                <div className="user-field"><span className="user-field-label">E-mail:</span> {displayEmail}</div>
                <div className="user-field"><span className="user-field-label">CPF:</span> {displayCpf}</div>
              </div>
            </div>
          </div>

          <div className="user-menu-divider" />

          <div className="user-menu-actions">
            <Link
              to="/view/favoritoUsuario/listFavoritoUsuario"
              className="user-menu-action action-favorites"
              title="Favoritos"
              onClick={() => setOpen(false)}
            >
              <span className="action-icon"><StarIcon /></span>
              <span className="action-label">Favoritos</span>
            </Link>

            <Link
              to="/view/alterarSenha/alterarSenha"
              className="user-menu-action action-password"
              title="Trocar senha"
              onClick={() => setOpen(false)}
            >
              <span className="action-icon"><KeyIcon /></span>
              <span className="action-label">Trocar senha</span>
            </Link>

            <Link
              to="/meus-dados"
              className="user-menu-action action-data"
              title="Meus dados"
              onClick={() => setOpen(false)}
            >
              <span className="action-icon"><UserIcon /></span>
              <span className="action-label">Meus dados</span>
            </Link>

            <button
              type="button"
              className="user-menu-action action-logout"
              title="Deslogar"
              onClick={handleLogout}
            >
              <span className="action-icon"><PowerIcon /></span>
              <span className="action-label">Deslogar</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
