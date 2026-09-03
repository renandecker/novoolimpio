import {useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {useQuery, keepPreviousData} from '@tanstack/react-query';
import {api} from '../../shared/services/api';
import type {PagedResponse} from '../../features/auth/types';
import {PermissionGate} from '../../shared/services/permissions';

type FavoritoDisponivel = {
    id: number;
    nome: string;
    icon: string;
    outcome: string;
};

export default function ViewFavoritoUsuarioListFavoritoUsuarioListScreen() {
    const navigate = useNavigate();
    const [page, setPage] = useState(0);
    const [size, setSize] = useState(10);
    const [busca, setBusca] = useState('');

    const {data, isLoading, isError} = useQuery<PagedResponse<FavoritoDisponivel>>({
        queryKey: ['favoritos', page, size, busca],
        queryFn: async () => {
            const response = await api.get<PagedResponse<FavoritoDisponivel>>('/api/basico/usuario-logado/favoritos', {
                params: {page, size, ...(busca ? {busca} : {})},
            });
            return response.data;
        },
        placeholderData: keepPreviousData,
    });

    const items = data?.content ?? [];
    const totalElements = data?.totalElements ?? 0;
    const totalPages = Math.max(1, data?.totalPages ?? 0);

    const handleAcessar = (outcome: string) => {
        if (outcome) {
            navigate(outcome);
        }
    };

    return (
        <PermissionGate permission="READ">
            <main>
                <div className="data-table">
                    <h1>Gerenciar Favoritos</h1>
                    <div className="data-table-toolbar">
                        <input
                            type="text"
                            placeholder="Buscar..."
                            value={busca}
                            onChange={(e) => {
                                setBusca(e.target.value);
                                setPage(0);
                            }}
                            className="busca-input"
                            style={{marginRight: '10px', padding: '6px 10px', border: '1px solid #d3d3d3', borderRadius: '4px'}}
                        />
                    </div>
                    {isError ? (
                        <p>Erro ao carregar os favoritos.</p>
                    ) : (
                        <table>
                            <thead>
                                <tr>
                                    <th>Nome</th>
                                    <th>Ícone</th>
                                    <th className="col-actions">Acessar</th>
                                </tr>
                            </thead>
                            <tbody>
                                {isLoading && items.length === 0 ? (
                                    <tr>
                                        <td colSpan={3}>Carregando...</td>
                                    </tr>
                                ) : items.length === 0 ? (
                                    <tr>
                                        <td colSpan={3}>Nenhum favorito encontrado.</td>
                                    </tr>
                                ) : (
                                    items.map((item) => (
                                        <tr key={item.id}>
                                            <td>{item.nome}</td>
                                            <td><i className={`fa ${item.icon}`} /></td>
                                            <td className="col-actions">
                                                <button
                                                    className="btn-action btnyellow"
                                                    title="Acessar a tela"
                                                    onClick={() => handleAcessar(item.outcome)}
                                                >
                                                    Acessar a tela
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                            <tfoot>
                                <tr>
                                    <td colSpan={3} className="data-table-paginator">
                                        <button
                                            onClick={() => setPage((current) => Math.max(0, current - 1))}
                                            disabled={page === 0 || isLoading}
                                        >
                                            Anterior
                                        </button>
                                        <span>Página {page + 1} de {totalPages}</span>
                                        <button
                                            onClick={() => setPage((current) => Math.min(totalPages - 1, current + 1))}
                                            disabled={page >= totalPages - 1 || isLoading}
                                        >
                                            Próxima
                                        </button>
                                        <label>
                                            Registros por página
                                            <select
                                                value={size}
                                                onChange={(event) => {
                                                    setSize(Number(event.target.value));
                                                    setPage(0);
                                                }}
                                            >
                                                <option value={10}>10</option>
                                                <option value={20}>20</option>
                                                <option value={50}>50</option>
                                                <option value={100}>100</option>
                                            </select>
                                        </label>
                                        <span>Total: {totalElements}</span>
                                    </td>
                                </tr>
                            </tfoot>
                        </table>
                    )}
                </div>
            </main>
        </PermissionGate>
    );
}
