import {useState, useEffect} from 'react';
import {api} from '../../../shared/services/api';
import type {ApiItem} from '../../../shared/types/types';

interface ProdutoSelectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (produto: ApiItem) => void;
    selectedCategoriaId?: number;
}

export function ProdutoSelectionModal({isOpen, onClose, onSelect, selectedCategoriaId}: ProdutoSelectionModalProps) {
    const [categorias, setCategorias] = useState<ApiItem[]>([]);
    const [produtos, setProdutos] = useState<ApiItem[]>([]);
    const [categoriaSelecionada, setCategoriaSelecionada] = useState<number | ''>(selectedCategoriaId ?? '');
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const pageSize = 20;

    useEffect(() => {
        api.get<ApiItem[]>('/api/view/categoriaEstoque/listCategoria')
            .then(r => setCategorias(r.data ?? []))
            .catch(() => setCategorias([]));
    }, []);

    const fetchProdutos = async () => {
        setLoading(true);
        try {
            const params: Record<string, unknown> = {
                page,
                size: pageSize,
            };
            if (categoriaSelecionada) params.id_categoria = categoriaSelecionada;
            if (search) params.nome = search;

            const response = await api.get<{content: ApiItem[], totalElements: number, totalPages: number}>('/api/view/produto/listProduto', {params});
            setProdutos(response.data.content ?? []);
            setTotalPages(response.data.totalPages ?? 1);
        } catch {
            setProdutos([]);
            setTotalPages(1);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen) {
            fetchProdutos();
        }
    }, [isOpen, categoriaSelecionada, search, page]);

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal form-modal" style={{maxWidth: '900px', width: '95%'}} onClick={e => e.stopPropagation()}>
                <div className="div_form">
                    <div className="form-title">Selecionar Produto</div>
                    <div className="table_form">
                        <div className="form-grid" style={{marginBottom: 16}}>
                            <label className="form-field" style={{gridColumn: 'span 2'}}>
                                <span className="form-label">Filtrar por Categoria</span>
                                <select className="form-input form-select"
                                        value={categoriaSelecionada}
                                        onChange={e => {
                                            const val = e.target.value;
                                            setCategoriaSelecionada(val ? Number(val) : '');
                                            setPage(0);
                                        }}>
                                    <option value="">Todas as categorias</option>
                                    {categorias.map(cat => (
                                        <option key={cat.id} value={cat.id}>
                                            {cat.descricao}
                                        </option>
                                    ))}
                                </select>
                            </label>
                            <label className="form-field" style={{gridColumn: 'span 2'}}>
                                <span className="form-label">Buscar Produto</span>
                                <input className="form-input"
                                       placeholder="Digite o nome do produto..."
                                       value={search}
                                       onChange={e => {
                                           setSearch(e.target.value);
                                           setPage(0);
                                       }}
                                       onKeyDown={e => e.key === 'Enter' && fetchProdutos()}/>
                            </label>
                        </div>

                        {loading ? (
                            <div style={{textAlign: 'center', padding: 20}}>Carregando produtos...</div>
                        ) : produtos.length === 0 ? (
                            <div style={{textAlign: 'center', padding: 20, color: '#666'}}>
                                Nenhum produto encontrado.
                            </div>
                        ) : (
                            <>
                                <div style={{overflowX: 'auto'}}>
                                    <table className="data-table" style={{width: '100%'}}>
                                        <thead>
                                        <tr>
                                            <th style={{width: 60}}>ID</th>
                                            <th>Produto</th>
                                            <th style={{width: 120}}>Valor</th>
                                            <th style={{width: 100}}>Categoria</th>
                                            <th style={{width: 80}}>Estoque</th>
                                            <th style={{width: 80}}></th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {produtos.map(prod => (
                                            <tr key={prod.id}>
                                                <td>{prod.id}</td>
                                                <td>{prod.nome}</td>
                                                <td>{prod.valor ? Number(prod.valor).toFixed(2) : '-'}</td>
                                                <td>{prod.categoria_descricao ?? '-'}</td>
                                                <td>{prod.quantidade ?? '-'}</td>
                                                <td>
                                                    <button type="button"
                                                            className="btn-action btngreen"
                                                            onClick={() => {
                                                                onSelect(prod);
                                                                onClose();
                                                            }}>
                                                        Selecionar
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                        </tbody>
                                    </table>
                                </div>

                                {totalPages > 1 && (
                                    <div style={{display: 'flex', justifyContent: 'center', gap: 8, marginTop: 16}}>
                                        <button className="btn-primary btnyellow"
                                                disabled={page === 0 || loading}
                                                onClick={() => setPage(p => Math.max(0, p - 1))}>
                                            Anterior
                                        </button>
                                        <span style={{display: 'flex', alignItems: 'center'}}>
                                            Página {page + 1} de {totalPages}
                                        </span>
                                        <button className="btn-primary btnyellow"
                                                disabled={page >= totalPages - 1 || loading}
                                                onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}>
                                            Próxima
                                        </button>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}