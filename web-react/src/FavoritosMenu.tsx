import { useEffect, useRef, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { listarFavoritos } from './favoritos';

const StarIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 .587l3.668 7.566 8.332 1.151-6.064 5.828 1.48 8.279L12 19.446l-7.416 3.966 1.48-8.279L3.332 9.305z" />
  </svg>
);

const normalizeOutcome = (outcome: string) => outcome.replace(/(\.xhtml)+$/i, '').replace(/\/$/, '') || '/default';

/**
 * Ícone de estrela entre o botão de Relatórios e o menu do usuário, listando os atalhos
 * favoritados pelo usuário — equivalente ao bloco <c:forEach var="favoritos"
 * items="#{usuarioLogadoController.listFavoritos}"><po:panel .../></c:forEach> de header.xhtml
 * (olimpio.zip). Não confundir com o link "Favoritos" do menu de usuário, que abre a tela de
 * gerenciamento (listFavoritoUsuario) — aqui é a lista de atalhos em si.
 */
export function FavoritosMenu() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const list = useQuery({
    queryKey: ['favoritos', 'usuarioLogado'],
    queryFn: listarFavoritos,
    enabled: open,
  });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) setOpen(false);
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

  const items = list.data ?? [];

  const handleItemClick = (outcome: string) => {
    setOpen(false);
    navigate(normalizeOutcome(outcome));
  };

  return (
    <div className="report-container" ref={containerRef}>
      <button
        type="button"
        className="app-header-bell"
        title="Favoritos"
        aria-label="Favoritos"
        onClick={() => setOpen(!open)}
      >
        <StarIcon />
      </button>

      {open && (
        <div className="report-dropdown favoritos-dropdown">
          <div className="bell-dropdown-header">
            <span>Favoritos</span>
            <Link to="/view/favoritoUsuario/listFavoritoUsuario" onClick={() => setOpen(false)}>
              Gerenciar
            </Link>
          </div>
          <div className="bell-dropdown-list">
            {list.isLoading && items.length === 0 ? (
              <p className="bell-empty">Carregando...</p>
            ) : items.length === 0 ? (
              <p className="bell-empty">Nenhum favorito cadastrado.</p>
            ) : (
              items.map((item, index) => (
                <button
                  key={`${item.outcome}-${index}`}
                  type="button"
                  className="favoritos-item"
                  onClick={() => handleItemClick(item.outcome)}
                >
                  <span className="favoritos-item-icon">
                    <i className={item.icon} aria-hidden="true" />
                  </span>
                  <span className="favoritos-item-nome">{item.nome}</span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
