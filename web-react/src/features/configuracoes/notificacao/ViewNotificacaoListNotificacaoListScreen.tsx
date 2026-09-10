import {useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {PermissionGate} from '../../../shared/services/permissions';
import {listMinhasNotificacoes, marcarNotificacaoLida} from '../../notificacoes/notificacoes';
import '../../notificacoes/NotificacaoScreen.css';

const PAGE_SIZES = [10, 20, 50];

const formatTime = (iso: string) => {
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return '';
    return date.toLocaleDateString('pt-BR', {day: '2-digit', month: '2-digit', year: 'numeric'}) +
        ' ' +
        date.toLocaleTimeString('pt-BR', {hour: '2-digit', minute: '2-digit'});
};

export default function ViewNotificacaoListNotificacaoListScreen() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [page, setPage] = useState(0);
    const [size, setSize] = useState(PAGE_SIZES[0]);

    const query = useQuery({
        queryKey: ['notificacoes', 'minhas', page, size],
        queryFn: () => listMinhasNotificacoes(page, size),
    });

    const markRead = useMutation({
        mutationFn: marcarNotificacaoLida,
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['notificacoes', 'nao-lidas']});
            queryClient.invalidateQueries({queryKey: ['notificacoes', 'minhas']});
        },
    });

    const items = query.data?.content ?? [];
    const totalElements = query.data?.totalElements ?? 0;
    const totalPages = Math.max(1, query.data?.totalPages ?? 0);

    return (
        <PermissionGate permission="READ">
            <main>
                <h1>Notificações</h1>
                <div className="notificacao-list">
                    {query.isLoading && items.length === 0 ? (
                        <p className="notificacao-empty">Carregando...</p>
                    ) : items.length === 0 ? (
                        <div className="notificacao-empty">
                            <p>Nenhuma notificação no momento.</p>
                        </div>
                    ) : (
                        items.map((notification) => (
                            <div
                                key={notification.id}
                                className={`notificacao-item ${notification.lida ? 'notificacao-item-read' : 'notificacao-item-unread'}`}
                            >
                                <div className="notificacao-item-content">
                                    <div className="notificacao-item-title">{notification.titulo}</div>
                                    {notification.mensagem && (
                                        <div className="notificacao-item-message">{notification.mensagem}</div>
                                    )}
                                    <div className="notificacao-item-meta">
                                        <span
                                            className="notificacao-item-time">{formatTime(notification.createdAt)}</span>
                                        {!notification.lida &&
                                        <span className="notificacao-item-unread-tag">não lida</span>}
                                    </div>
                                </div>
                                <div className="notificacao-item-actions">
                                    {!notification.lida && (
                                        <button type="button" onClick={() => markRead.mutate(notification.id)}>
                                            Marcar como lida
                                        </button>
                                    )}
                                    {notification.link && (
                                        <button
                                            type="button"
                                            className="notificacao-item-open"
                                            onClick={() => navigate(notification.link as string)}
                                        >
                                            Abrir
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))
                    )}

                    {!query.isLoading && items.length > 0 && (
                        <div className="notificacao-paginator">
                            <button
                                onClick={() => setPage((current) => Math.max(0, current - 1))}
                                disabled={page === 0 || query.isFetching}
                            >
                                Anterior
                            </button>
                            <span>
                Página {page + 1} de {totalPages}
              </span>
                            <button
                                onClick={() => setPage((current) => Math.min(totalPages - 1, current + 1))}
                                disabled={page >= totalPages - 1 || query.isFetching}
                            >
                                Próxima
                            </button>
                            <label>
                                Por página
                                <select
                                    value={size}
                                    onChange={(event) => {
                                        setSize(Number(event.target.value));
                                        setPage(0);
                                    }}
                                >
                                    {PAGE_SIZES.map((option) => (
                                        <option key={option} value={option}>
                                            {option}
                                        </option>
                                    ))}
                                </select>
                            </label>
                            <span>Total: {totalElements}</span>
                        </div>
                    )}
                </div>
            </main>
        </PermissionGate>
    );
}
