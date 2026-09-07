import React, {useState} from 'react';
import {Alert} from 'react-native';
import {useQuery} from '@tanstack/react-query';
import {api} from '../api';
import {PermissionGate} from '../permissions';
import {Tabs, type TabItem} from '../Tabs';
import {ModuleList} from '../ModuleListScreen';

interface UnidadeRow {
    id: number;
    nome_fantasia?: string;
    razao_social?: string;
    fl_ativo?: boolean;
}

interface ControleEstoqueRow {
    id: number;
    valor?: number | null;
    quantidade: number;
    qtdeSolicitado: number;
    qtdeDefeito: number;
    qtdeFalta: number;
    qtdeNaoEncontrado: number;
    qtdeReservado: number;
    qtdeAprovadoNaoEntregue: number;
    produtoId?: number | null;
    unidadeId?: number | null;
    produtoNome?: string | null;
    produtoImagem?: string | null;
    produtoValor?: number | null;
    produtoQuantidade?: number;
    produtoCategoriaDescricao?: string | null;
    unidadeNome?: string | null;
    usuarioLogin?: string | null;
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

function ProdutosEstoqueTab({unidadeId}: { unidadeId: string }) {
    const {data, isLoading} = useQuery({
        queryKey: ['estoque-produto-controle', unidadeId],
        queryFn: async () => (await api.get<ControleEstoqueRow[]>('/api/estoque/estoque-produto/controle', {params: {unidadeId}})).data,
        enabled: !!unidadeId,
    });

    const itens = data ?? [];

    if (!unidadeId) return <p className="disp-aviso">Selecione uma unidade para visualizar o estoque.</p>;
    if (isLoading) return <p>Carregando...</p>;
    if (itens.length === 0) return <p>Nenhum item de controle de estoque encontrado.</p>;

    return (
        <div>
            <div className="estoque-legends">
                <span className="legenda-yellow">Solicitado</span>
                <span className="legenda-orange">Defeito</span>
                <span className="legenda-red">Falta</span>
                <span className="legenda-blue">Não encontrado</span>
                <span className="legenda-green">Encaminhando produto</span>
                <span className="legenda-black">Reservado</span>
            </div>
            <div className="estoque-cards">
                {itens.map((item) => (
                    <div key={item.id} className="estoque-card">
                        <div className="estoque-card-header">
                            <span className="estoque-card-id">{item.produtoId}</span>
                        </div>
                        <div className="estoque-card-body">
                            {item.produtoImagem && (
                                <img src={item.produtoImagem} alt={item.produtoNome || ''}
                                     className="estoque-card-img"/>
                            )}
                            <div className="estoque-card-info">
                                <span>Valor: {formatCurrency(item.produtoValor ?? item.valor)}</span>
                                <span>Qtde Produto: {item.quantidade}</span>
                                <span>Categoria: {item.produtoCategoriaDescricao || '-'}</span>
                                <div className="estoque-card-status">
                                    {item.qtdeSolicitado > 0 &&
                                    <span className="legenda-yellow">{item.qtdeSolicitado} Solicitado</span>}
                                    {item.qtdeDefeito > 0 &&
                                    <span className="legenda-orange">{item.qtdeDefeito} Defeito</span>}
                                    {item.qtdeFalta > 0 && <span className="legenda-red">{item.qtdeFalta} Falta</span>}
                                    {item.qtdeNaoEncontrado > 0 &&
                                    <span className="legenda-blue">{item.qtdeNaoEncontrado} Não Encontrado</span>}
                                    {item.qtdeAprovadoNaoEntregue > 0 && <span
                                        className="legenda-green">{item.qtdeAprovadoNaoEntregue} Aprovado N. Entregue</span>}
                                    {item.qtdeReservado > 0 &&
                                    <span className="legenda-black">{item.qtdeReservado} Reservado</span>}
                                </div>
                            </div>
                        </div>
                        <div className="estoque-card-actions">
                            <button className="btngreen" title="Solicitar Produto">Solicitar</button>
                            <button className="btnblue" title="Entrada Produto">Entrada</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function PendenciaVendaTab({unidadeId}: { unidadeId: string }) {
    const {data, isLoading} = useQuery({
        queryKey: ['estoque-pendencias', unidadeId],
        queryFn: async () => (await api.get<PendenciaVendaRow[]>('/api/estoque/estoque-produto/pendencias', {params: {unidadeId}})).data,
        enabled: !!unidadeId,
    });

    const itens = data ?? [];

    const handleExport = async (format: 'pdf' | 'docx' | 'excel') => {
        try {
            const response = await api.get(`/api/estoque/estoque-produto/exportar/${format}`, {params: {unidadeId}, responseType: 'blob'});
            Alert.alert('Sucesso', `Exportação ${format.toUpperCase()} iniciada`);
        } catch (e) {
            Alert.alert('Erro', `Erro ao exportar ${format.toUpperCase()}`);
        }
    };

    const exportOptions = [
        {key: 'pdf', label: 'PDF', icon: <i className="fa fa-file-pdf-o"/>, onClick: () => handleExport('pdf')},
        {key: 'docx', label: 'DOCX', icon: <i className="fa fa-file-word-o"/>, onClick: () => handleExport('docx')},
        {key: 'excel', label: 'Excel', icon: <i className="fa fa-file-excel-o"/>, onClick: () => handleExport('excel')},
    ];

    if (!unidadeId) return <p className="disp-aviso">Selecione uma unidade para visualizar as pendências.</p>;
    if (isLoading) return <p>Carregando...</p>;
    if (itens.length === 0) return <p>Nenhuma pendência de venda encontrada.</p>;

    return (
        <div>
            <div className="data-table-toolbar" style={{marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '10px'}}>

            </div>
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

export default function ViewEstoqueEstoqueprodutoListScreen() {
    const [unidadeId, setUnidadeId] = useState('');

    const unidadesQuery = useQuery({
        queryKey: ['unidades-estoque-produto'],
        queryFn: async () => (await api.get<UnidadeRow[]>('/api/view/unidade/listUnidade')).data,
    });

    const unidades = (unidadesQuery.data ?? []).filter((u) => u.fl_ativo !== false);

    const tabs: TabItem[] = [
        {key: 'produtosEstoque', label: 'Produtos Estoque', content: <ProdutosEstoqueTab unidadeId={unidadeId}/>},
        {key: 'pendenciaVenda', label: 'Pendência Venda', content: <PendenciaVendaTab unidadeId={unidadeId}/>},
    ];

    return (
        <PermissionGate permission="READ">
            <main>
                <h1>Estoque Produto</h1>
                <div className="disp-filtros">
                    <div className="disp-filtro">
                        <label htmlFor="estoque-unidade">Unidade</label>
                        <select
                            id="estoque-unidade"
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