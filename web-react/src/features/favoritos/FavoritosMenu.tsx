import {useEffect, useRef, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {useQuery} from '@tanstack/react-query';
import {listarFavoritos} from './favoritos';
import {normalizeOutcome} from '../../shared/services/permissions';

const StarIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path
            d="M12 .587l3.668 7.566 8.332 1.151-6.064 5.828 1.48 8.279L12 19.446l-7.416 3.966 1.48-8.279L3.332 9.305z"/>
    </svg>
);

export function FavoritosMenu() {
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const list = useQuery({
        queryKey: ['favoritos', 'usuarioLogado'],
        queryFn: () => listarFavoritos(0, 100),
        enabled: open,
    });

    const items = list.data?.content ?? [];

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) setOpen(false);
        };
        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') setOpen(false);
        };
        if (open) {
            document.addEventListener('click', handleClickOutside);
            document.addEventListener('keydown', handleEscape);
        }
        return () => {
            document.removeEventListener('click', handleClickOutside);
            document.removeEventListener('keydown', handleEscape);
        };
    }, [open]);

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
                <StarIcon/>
            </button>

            {open && (
                <div className="report-dropdown favoritos-dropdown">
                    <div className="bell-dropdown-header">
                        <span>Favoritos</span>
                    </div>
                    <div className="bell-dropdown-list">
                        {list.isLoading ? (
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
                                        <i className={item.icon} aria-hidden="true"/>
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
