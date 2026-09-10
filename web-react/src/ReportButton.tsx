import {useEffect, useRef, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {useQuery} from '@tanstack/react-query';
import {listarRelatoriosDisponiveis, type RelatorioDisponivel} from './features/relatorios/relatorios';
import {useAuth} from './features/auth/auth';
import {usePermissions} from './shared/services/permissions';

const ReportIcon = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
        <path
            d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm2 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
    </svg>
);

const SearchIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="11" cy="11" r="8"/>
        <line x1="21" y1="21" x2="16.65" y2="16.65"/>
    </svg>
);

const tipoRota: Record<string, string> = {
    TABELA: '/view/relatorios/viewTabela',
    GRAFICO: '/view/relatorios/viewGraficoBarrasVertical',
    MAPA: '/view/relatorios/viewMapa',
    DASHBOARD: '/view/relatorios/viewDashboard',
    PIZZA: '/view/relatorios/viewGraficoPizza',
    LINHA: '/view/relatorios/viewGraficoLinhas',
    COMBINADO: '/view/relatorios/viewGraficoCombinado',
    CIRCULAR: '/view/relatorios/viewGraficoCircular',
    BARRA_VERTICAL: '/view/relatorios/viewGraficoBarrasVertical',
    BARRA_HORIZONTAL: '/view/relatorios/viewGraficoBarrasHorizontal',
};

const PAGE_SIZE = 10;
const MIN_SEARCH = 3;

export function ReportButton() {
    const navigate = useNavigate();
    const {can} = usePermissions();
    const {session} = useAuth();
    const [open, setOpen] = useState(false);
    const [page, setPage] = useState(0);
    const [allItems, setAllItems] = useState<RelatorioDisponivel[]>([]);
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

    const isAdmin = session?.perfis?.includes('ADMIN') || false;

    const list = useQuery({
        queryKey: ['relatorios', 'disponiveis', page, debouncedSearch],
        queryFn: () => listarRelatoriosDisponiveis(page, PAGE_SIZE, debouncedSearch || undefined),
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
            document.addEventListener('click', handleClickOutside);
            document.addEventListener('keydown', handleEscape);
        }
        return () => {
            document.removeEventListener('click', handleClickOutside);
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

    const handleItemClick = (item: RelatorioDisponivel) => {
        setOpen(false);
        const tipoKey = (item.tipo || '').toUpperCase();
        const baseRoute = tipoRota[tipoKey] ?? '/view/relatorios/viewTabela';
        if (tipoKey === 'TABELA') {
            navigate(`/view/relatorios/viewTabela/${item.id}`);
        } else {
            navigate(`${baseRoute}?id=${item.id}`);
        }
    };

    return (
        <div className="report-container" ref={containerRef}>
            <button
                type="button"
                className="app-header-bell"
                title="Relatórios"
                aria-label="Relatórios"
                onClick={handleOpen}
            >
                <ReportIcon/>
            </button>

            {open && (
                <div className="report-dropdown">
                    <div className="bell-dropdown-header">
                        <span>Relatórios</span>
                    </div>
                    <div className="bell-search">
                        <span className="bell-search-icon"><SearchIcon/></span>
                        <input
                            ref={searchInputRef}
                            type="text"
                            className="bell-search-input"
                            placeholder="Buscar relatório..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="bell-dropdown-list">
                        {list.isLoading && allItems.length === 0 ? (
                            <p className="bell-empty">Carregando...</p>
                        ) : allItems.length === 0 ? (
                            <p className="bell-empty">{isSearching ? 'Nenhum relatório encontrado.' : 'Nenhum relatório disponível.'}</p>
                        ) : (
                            <>
                                {allItems.map((item) => (
                                    <button
                                        key={`${item.tipo}-${item.id}`}
                                        type="button"
                                        className="report-item"
                                        onClick={() => handleItemClick(item)}
                                    >
                                        <span className="report-item-tipo">{item.tipo}</span>
                                        <span className="report-item-nome">{item.nome}</span>
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
