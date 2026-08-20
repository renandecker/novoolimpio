import {useEffect, useRef, useState} from 'react';
import {Link, useNavigate} from 'react-router-dom';
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {
    countNaoLidas,
    listMinhasNotificacoes,
    marcarNotificacaoLida,
    subscribeNotificacoesStream,
    type
    Notificacao
} from './notificacoes';

const BellIcon = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
        <path
            d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2zm-2 1H8v-6c0-2.48 1.51-4.5 4-4.5s4 2.02 4 4.5v6z"/>
    </svg>
);

const formatTime = (iso: string) => {
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return '';
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'agora';
    if (minutes < 60) return `${minutes} min atrás`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} h atrás`;
    return date.toLocaleDateString('pt-BR', {day: '2-digit', month: '2-digit', year: 'numeric'});
};

export function NotificationBell() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [open, setOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const count = useQuery({
        queryKey: ['notificacoes', 'nao-lidas'],
        queryFn: countNaoLidas,
        refetchInterval: 30_000,
        refetchIntervalInBackground: true,
    });

    const list = useQuery({
        queryKey: ['notificacoes', 'minhas', 0, 10],
        queryFn: () => listMinhasNotificacoes(0, 10),
        enabled: open,
    });

    const markRead = useMutation({
        mutationFn: marcarNotificacaoLida,
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['notificacoes', 'nao-lidas']});
            queryClient.invalidateQueries({queryKey: ['notificacoes', 'minhas']});
        },
    });

    useEffect(() => {
        const unsubscribe = subscribeNotificacoesStream(() => {
            queryClient.invalidateQueries({queryKey: ['notificacoes', 'nao-lidas']});
            queryClient.invalidateQueries({queryKey: ['notificacoes', 'minhas']});
        });
        return unsubscribe;
    }, [queryClient]);

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

    const unread = count.data ? ? 0;
    const items = list.data?.content ? ? [];

    const handleItemClick = (notification: Notificacao) => {
        if (!notification.lida) markRead.mutate(notification.id);
        setOpen(false);
        if (notification.link) navigate(notification.link);
    };

    return (
        <div className="bell-container" ref={containerRef}>
            <button
                type="button"
                className="app-header-bell"
                title="Notificações"
                aria-label="Notificações"
                onClick={() => setOpen(!open)}
            >
                <BellIcon/>
                {unread > 0 && <span className="bell-badge">{unread > 99 ? '99+' : unread}</span>}
            </button>

            {open && (
                <div className="bell-dropdown">
                    <div className="bell-dropdown-header">
                        <span>Notificações</span>
                        <Link to="/view/notificacao/listNotificacao" onClick={() => setOpen(false)}>
                            Ver todas
                        </Link>
                    </div>
                    <div className="bell-dropdown-list">
                        {list.isLoading && items.length === 0 ? (
                            <p className="bell-empty">Carregando...</p>
                        ) : items.length === 0 ? (
                            <p className="bell-empty">Nenhuma notificação.</p>
                        ) : (
                            items.map((notification) => (
                                <button
                                    key={notification.id}
                                    type="button"
                                    className={`bell-item ${notification.lida ? 'bell-item-read' : 'bell-item-unread'}`}
                                    onClick={() => handleItemClick(notification)}
                                >
                                    <span className="bell-item-dot"/>
                                    <span className="bell-item-body">
                    <span className="bell-item-title">{notification.titulo}</span>
                                        {notification.mensagem && (
                                            <span className="bell-item-message">{notification.mensagem}</span>
                                        )}
                                        <span className="bell-item-time">{formatTime(notification.createdAt)}</span>
                  </span>
                                </button>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
