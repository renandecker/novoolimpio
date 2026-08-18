import { useEffect, useRef, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { listarFavoritos, type FavoritoDisponivel } from './favoritos';

const StarIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 .587l3.668 7.566 8.332 1.151-6.064 5.828 1.48 8.279L12 19.446l-7.416 3.966 1.48-8.279L3.332 9.305z" />
  </svg>
);

const SearchIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
);

const normalizeOutcome = (outcome: string) => outcome.replace(/(\.xhtml)+$/i, '').replace(/\/$/, '') || '/default';

const PAGE_SIZE = 10;
const MIN_SEARCH = 3;

export function FavoritosMenu() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [page, setPage] = useState(0);
  const [allItems, setAllItems] = useState<FavoritoDisponivel[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm.length >= MIN_SEARCH ? searchTerm : '');
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const isSearching = debouncedSearch.length > 0;

  const list = useQuery({
    queryKey: ['favoritos', 'usuarioLogado', page, debouncedSearch],
    queryFn: () => listarFavoritos(page, PAGE_SIZE, debouncedSearch || undefined),
    enabled: open,
  });

  useEffect(() => {
    if (page === 0) {
      setAllItems(list.data?.content ?? []);
    } else if (list.data?.content) {
      setAllItems((prev) => [...prev, ...list.data!.content]);
    }
  }, [list.data, page]);

  useEffect(() => {
    setPage(0);
    setAllItems([]);
  }, [debouncedSearch]);

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

  useEffect(() => {
    if (open && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [open]);

  const handleOpen = () => {
    setPage(0);
    setAllItems([]);
    setSearchTerm('');
    setDebouncedSearch('');
    setOpen(!open);
  };

  const totalElements = list.data?.totalElements ?? 0;
  const hasMore = allItems.length < totalElements;

  const handleLoadMore = () => {
    setPage((p) => p + 1);
  };

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
        onClick={handleOpen}
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
          <div className="bell-search">
            <span className="bell-search-icon"><SearchIcon /></span>
            <input
              ref={searchInputRef}
              type="text"
              className="bell-search-input"
              placeholder="Buscar favorito..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="bell-dropdown-list">
            {list.isLoading && allItems.length === 0 ? (
              <p className="bell-empty">Carregando...</p>
            ) : allItems.length === 0 ? (
              <p className="bell-empty">{isSearching ? 'Nenhum favorito encontrado.' : 'Nenhum favorito cadastrado.'}</p>
            ) : (
              <>
                {allItems.map((item, index) => (
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
                ))}
                {hasMore && (
                  <button
                    type="button"
                    className="bell-load-more"
                    onClick={handleLoadMore}
                    disabled={list.isFetching}
                  >
                    {list.isFetching ? 'Carregando...' : 'Carregar mais'}
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
