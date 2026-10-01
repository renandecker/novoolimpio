import {useState} from 'react';
import {useQuery} from '@tanstack/react-query';
import {api} from '../../../shared/services/api';
import {PermissionGate} from '../../../shared/services/permissions';
import {Tabs, type TabItem} from '../../../shared/components/Tabs';

interface UnidadeRow {
    id: number;
    nome_fantasia?: string;
    razao_social?: string;
    fl_ativo?: boolean;
}

interface VendaProdutoRow {
    id: number;
    quantidade: number;
    dataCompra?: string | null;
    valor?: number | null;
    produtoId?: number | null;
    pessoaId?: number | null;
    unidadeId?: number | null;
    usuarioId?: number | null;
    produtoNome?: string | null;
    produtoImagem?: string | null;
    produtoCategoriaDescricao?: string | null;
    pessoaNome?: string | null;
}

interface PendenciaVendaRow {
    id: number;
    quantidade: number;
    vendaProdutoId?: number | null;
    produtoId?: number | null;
    dataEntrega?: string | null;
    produtoNome?: string | null;
    produtoImagem?: string | null;
    produtoCategoriaDescricao?: string | null;
    vendaDataCompra?: string | null;
    vendaValor?: number | null;
    pessoaNome?: string | null;
}

const formatCurrency = (value: number | null | undefined): string => {
    if (value === null || value === undefined) return '';
    return new Intl.NumberFormat('pt-BR', {style: 'currency', currency: 'BRL'}).format(value);
};

const formatDate = (value: string | null | undefined): string => {
    if (!value) return '';
    const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(value));
    if (!match) return String(value);
    return `${match[3]}/${match[2]}/${match[1]}`;
};

const formatDateTime = (value: string | null | undefined): string => {
    if (!value) return '';
    const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/.exec(String(value));
    if (!match) return formatDate(value);
    return `${match[3]}/${match[2]}/${match[1]} ${match[4]}:${match[5]}`;
};

function VendasTab({unidadeId}: { unidadeId: string }) {
    const unidadeIdNum = Number(unidadeId);
    const {data, isLoading} = useQuery({
        queryKey: ['venda-produto-list', unidadeId],
        queryFn: async () => (await api.get<VendaProdutoRow[]>('/api/financeiro/venda-produto', {params: {unidadeId: unidadeIdNum}})).data,
        enabled: !!unidadeId,
    });

    const itens = data ?? [];

    if (!unidadeId) return <p className="disp-aviso">Selecione uma unidade para visualizar as vendas.</p>;
    if (isLoading) return <p>Carregando...</p>;
    if (itens.length === 0) return <p>Nenhuma venda de produto encontrada.</p>;

    return (
        <div>
            <table className="data-table">
                <thead>
                <tr>
                    <th>Foto</th>
                    <th>Produto</th>
                    <th>Data Venda</th>
                    <th>Valor</th>
                    <th>Qtde</th>
                    <th>Aluno/Cliente</th>
                </tr>
                </thead>
                <tbody>
                {itens.map((item) => (
                    <tr key={item.id}>
                        <td>
                            {item.produtoImagem && (
                                <img src={item.produtoImagem} alt="" style={{maxHeight: 64, maxWidth: 64}}/>
                            )}
                        </td>
                        <td>
                            <div>Produto: {item.produtoNome || `#${item.produtoId}`}</div>
                            <div>Categoria: {item.produtoCategoriaDescricao || '-'}</div>
                        </td>
                        <td>{formatDateTime(item.dataCompra)}</td>
                        <td>{formatCurrency(item.valor)}</td>
                        <td>{item.quantidade}</td>
                        <td>{item.pessoaNome || '-'}</td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
}

function PendenciasTab({unidadeId}: { unidadeId: string }) {
    const unidadeIdNum = Number(unidadeId);
    const {data, isLoading} = useQuery({
        queryKey: ['estoque-pendencias-venda', unidadeId],
        queryFn: async () => (await api.get<PendenciaVendaRow[]>('/api/estoque/estoque-produto/pendencias', {params: {unidadeId: unidadeIdNum}})).data,
        enabled: !!unidadeId,
    });

    const itens = data ?? [];

    if (!unidadeId) return <p className="disp-aviso">Selecione uma unidade para visualizar as pendências.</p>;
    if (isLoading) return <p>Carregando...</p>;
    if (itens.length === 0) return <p>Nenhuma pendência de venda encontrada.</p>;

    return (
        <div>
            <table className="data-table">
                <thead>
                <tr>
                    <th>Foto</th>
                    <th>Produto</th>
                    <th>Data Venda</th>
                    <th>Valor</th>
                    <th>Qtde</th>
                    <th>Aluno</th>
                    <th>Ações</th>
                </tr>
                </thead>
                <tbody>
                {itens.map((item) => (
                    <tr key={item.id}>
                        <td>
                            {item.produtoImagem && (
                                <img src={item.produtoImagem} alt="" style={{maxHeight: 64, maxWidth: 64}}/>
                            )}
                        </td>
                        <td>
                            <div>Produto: {item.produtoNome || `#${item.produtoId}`}</div>
                            <div>Categoria: {item.produtoCategoriaDescricao || '-'}</div>
                        </td>
                        <td>
                            <div>Data venda: {formatDateTime(item.vendaDataCompra)}</div>
                            <div>Valor: {formatCurrency(item.vendaValor)}</div>
                            <div>Qtde: {item.quantidade}</div>
                        </td>
                        <td>{item.pessoaNome || '-'}</td>
                        <td>
                            <button
                                className="btnblue"
                                title="Entregar Pendência Produto"
                                disabled={!!item.dataEntrega}
                            >
                                Entregar
                            </button>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
}

export default function ViewEstoqueVendaProdutoListScreen() {
    const [unidadeId, setUnidadeId] = useState('');

    const unidadesQuery = useQuery({
        queryKey: ['unidades-venda-produto'],
        queryFn: async () => (await api.get<UnidadeRow[]>('/api/view/unidade/listUnidade')).data,
    });

    const unidades = (unidadesQuery.data ?? []).filter((u) => u.fl_ativo !== false);

    const tabs: TabItem[] = [
        {key: 'vendas', label: 'Vendas', content: <VendasTab unidadeId={unidadeId}/>},
        {key: 'pendencias', label: 'Pendências', content: <PendenciasTab unidadeId={unidadeId}/>},
    ];

    return (
        <PermissionGate permission="READ">
            <main>
                <h1>Venda Produtos</h1>
                <div className="disp-filtros">
                    <div className="disp-filtro">
                        <label htmlFor="venda-produto-unidade">Unidade</label>
                        <select
                            id="venda-produto-unidade"
                            className="disp-select"
                            value={unidadeId}
                            onChange={(e) => setUnidadeId(e.target.value)}
                        >
                            <option value="">Selecione a unidade</option>
                            {unidades.map((u) => (
                                <option key={u.id} value={u.id}>
                                    {u.nome_fantasia || u.razao_social || `Unidade ${u.id}`}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
                <Tabs tabs={tabs}/>
            </main>
        </PermissionGate>
    );
}