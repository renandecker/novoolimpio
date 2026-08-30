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

interface SolicitacaoRow {
    id: number;
    valor?: number | null;
    quantidade: number;
    usuarioId?: number | null;
    produtoId?: number | null;
    unidadeId?: number | null;
    dataSolicitacao?: string | null;
    ativo: boolean;
    motivo?: string | null;
    produtoNome?: string | null;
    produtoImagem?: string | null;
    produtoCategoriaDescricao?: string | null;
    unidadeNome?: string | null;
    usuarioLogin?: string | null;
}

interface ControlePedidosRow {
    id: number;
    dataEntrega?: string | null;
    aprovado: boolean;
    dataAprovacao?: string | null;
    dataPrevisao?: string | null;
    valor?: number | null;
    quantidade: number;
    usuarioId?: number | null;
    solicitacaoEstoqueId?: number | null;
    produtoId?: number | null;
    unidadeId?: number | null;
    produtoNome?: string | null;
    produtoImagem?: string | null;
    produtoCategoriaDescricao?: string | null;
    unidadeNome?: string | null;
    usuarioLogin?: string | null;
}

interface ControleEntregaRow {
    id: number;
    ativo: boolean;
    quantidade: number;
    status?: string | null;
    dataSaida?: string | null;
    rastreio?: string | null;
    entregaId?: number | null;
    usuarioId?: number | null;
    entregaDescricao?: string | null;
    usuarioLogin?: string | null;
}

function formatCurrency(value: number | null | undefined): string {
    if (value === null || value === undefined) return '';
    return new Intl.NumberFormat('pt-BR', {style: 'currency', currency: 'BRL'}).format(value);
}

function formatDate(value: string | null | undefined): string {
    if (!value) return '';
    const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(value));
    if (!match) return String(value);
    return `${match[3]}/${match[2]}/${match[1]}`;
}

function formatDateTime(value: string | null | undefined): string {
    if (!value) return '';
    const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/.exec(String(value));
    if (!match) return formatDate(value);
    return `${match[3]}/${match[2]}/${match[1]} ${match[4]}:${match[5]}`;
}

function ProdutosEstoqueCentralTab({unidadeId}: { unidadeId: string }) {
    const {data, isLoading} = useQuery({
        queryKey: ['controle-estoque-central', unidadeId],
        queryFn: async () => (await api.get<ControleEstoqueRow[]>('/api/estoque/controle-estoque', {params: {unidadeId}})).data,
        enabled: !!unidadeId,
    });

    const itens = data ?? [];

    if (!unidadeId) return <p className="disp-aviso">Selecione uma unidade para visualizar o estoque central.</p>;
    if (isLoading) return <p>Carregando...</p>;
    if (itens.length === 0) return <p>Nenhum produto encontrado no estoque central.</p>;

    return (
        <div className="estoque-grid">
            <div className="estoque-legends">
                <span className="legenda-yellow">Solicitado</span>
                <span className="legenda-orange">Defeito</span>
                <span className="legenda-red">Falta</span>
                <span className="legenda-blue">Não encontrado</span>
                <span className="legenda-green">Previsão Entrega</span>
                <span className="legenda-black">Reservado</span>
            </div>
            <div className="estoque-cards">
                {itens.map((item) => (
                    <div key={item.id} className="estoque-card">
                        <div className="estoque-card-header">
                            <span className="estoque-card-id">{item.produtoId}</span>
                            <span className="estoque-card-nome">{item.produtoNome || `Produto #${item.produtoId}`}</span>
                        </div>
                        <div className="estoque-card-body">
                            {item.produtoImagem && (
                                <img src={item.produtoImagem} alt={item.produtoNome || ''}
                                     className="estoque-card-img"/>
                            )}
                            <div className="estoque-card-info">
                                <span>Categoria: {item.produtoCategoriaDescricao || '-'}</span>
                                <span>Valor: {formatCurrency(item.produtoValor ?? item.valor)}</span>
                                <span>Quantidade Estoque: {item.quantidade}</span>
                            </div>
                        </div>
                        <div className="estoque-card-actions">
                            <button className="btnblue" title="Entrada Produto">Entrada</button>
                            <button className="btngreen" title="Saída Produto">Saída</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function SolicitacoesTab({unidadeId}: { unidadeId: string }) {
    const {data, isLoading} = useQuery({
        queryKey: ['solicitacoes-estoque', unidadeId],
        queryFn: async () => (await api.get<SolicitacaoRow[]>('/api/estoque/solicitacao-estoque')).data,
    });

    const itens = (data ?? []).filter(item => !unidadeId || String(item.unidadeId) === unidadeId);

    const handleExport = async (format: 'pdf' | 'docx' | 'excel') => {
        try {
            const response = await api.get(`/api/estoque/solicitacao-estoque/exportar/${format}`, {params: {unidadeId}, responseType: 'blob'});
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

    if (!unidadeId) return <p className="disp-aviso">Selecione uma unidade para visualizar as solicitações.</p>;
    if (isLoading) return <p>Carregando...</p>;
    if (itens.length === 0) return <p>Nenhuma solicitação encontrada.</p>;

    return (
        <div>
            <div className="estoque-legends">
                <span className="legenda-blue">Não encontrado</span>
                <span className="legenda-yellow">Solicitado</span>
                <span className="legenda-red">Falta</span>
                <span className="legenda-black">Reservado</span>
                <span className="legenda-purple">Aprovado não entregue</span>
            </div>
            <div className="data-table-toolbar" style={{marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '10px'}}>
                <ExportDropdown options={exportOptions} triggerLabel="Exportar" triggerIcon={<i className="fa fa-download"/>}/>
            </div>
            <table className="data-table">
                <thead>
                <tr>
                    <th>Id</th>
                    <th>Usuário</th>
                    <th>Produto</th>
                    <th>Categoria</th>
                    <th>Data Solicitação</th>
                    <th>Valor</th>
                    <th>Qtde Solicitada</th>
                    <th>Motivo</th>
                    <th>Ações</th>
                </tr>
                </thead>
                <tbody>
                {itens.map((item) => (
                    <tr key={item.id}>
                        <td>{item.id}</td>
                        <td>{item.usuarioLogin || `#${item.usuarioId}`}</td>
                        <td>{item.produtoNome || `#${item.produtoId}`}</td>
                        <td>{item.produtoCategoriaDescricao || '-'}</td>
                        <td>{formatDateTime(item.dataSolicitacao)}</td>
                        <td>{formatCurrency(item.valor)}</td>
                        <td>{item.quantidade}</td>
                        <td>{item.motivo || '-'}</td>
                        <td>
                            <button className="btnblue" title="Aprovar Solicitação">Aprovar</button>
                            <button className="btnred" title="Negar Solicitação">Negar</button>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
}

function PedidosTab({unidadeId}: { unidadeId: string }) {
    const {data, isLoading} = useQuery({
        queryKey: ['controle-pedidos', unidadeId],
        queryFn: async () => (await api.get<ControlePedidosRow[]>('/api/estoque/controle-pedidos')).data,
    });

    const itens = (data ?? []).filter(item => !unidadeId || String(item.unidadeId) === unidadeId);

    if (!unidadeId) return <p className="disp-aviso">Selecione uma unidade para visualizar os pedidos.</p>;
    if (isLoading) return <p>Carregando...</p>;
    if (itens.length === 0) return <p>Nenhum pedido encontrado.</p>;

    return (
        <div>
            <div className="estoque-legends">
                <span className="legenda-yellow">Previsão</span>
                <span className="legenda-black">Entregue</span>
                <span className="legenda-red">Negados</span>
                <span className="legenda-blue">Aprovados</span>
                <span className="legenda-green">Outro</span>
            </div>
            <div className="estoque-actions">
                <button className="btnblue" disabled={!unidadeId}>Preparar Entrega</button>
                <button className="btngreen" disabled={!unidadeId}>Ajuste Entrega</button>
            </div>
            <table className="data-table">
                <thead>
                <tr>
                    <th>Id</th>
                    <th>Usuário</th>
                    <th>Produto</th>
                    <th>Data Aprovação</th>
                    <th>Data Previsão</th>
                    <th>Data Entrega</th>
                    <th>Quantidade</th>
                    <th>Aprovado</th>
                </tr>
                </thead>
                <tbody>
                {itens.map((item) => (
                    <tr key={item.id}>
                        <td>{item.id}</td>
                        <td>{item.usuarioLogin || `#${item.usuarioId}`}</td>
                        <td>{item.produtoNome || `#${item.produtoId}`}</td>
                        <td>{formatDateTime(item.dataAprovacao)}</td>
                        <td>{formatDateTime(item.dataPrevisao)}</td>
                        <td>{formatDateTime(item.dataEntrega)}</td>
                        <td>{item.quantidade}</td>
                        <td>{item.aprovado ? 'Sim' : 'Não'}</td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
}

function EntregasTab({unidadeId}: { unidadeId: string }) {
    const {data, isLoading} = useQuery({
        queryKey: ['controle-entregas', unidadeId],
        queryFn: async () => (await api.get<ControleEntregaRow[]>('/api/estoque/controle-entrega/entregas-por-unidade', {params: {unidadeId}})).data,
        enabled: !!unidadeId,
    });

    const itens = (data ?? []);

    if (!unidadeId) return <p className="disp-aviso">Selecione uma unidade para visualizar as entregas.</p>;
    if (isLoading) return <p>Carregando...</p>;
    if (itens.length === 0) return <p>Nenhuma entrega encontrada.</p>;

    return (
        <div>
            <table className="data-table">
                <thead>
                <tr>
                    <th>Id</th>
                    <th>Entrega</th>
                    <th>Quantidade</th>
                    <th>Status</th>
                    <th>Data Saída</th>
                    <th>Rastreio</th>
                    <th>Usuário</th>
                </tr>
                </thead>
                <tbody>
                {itens.map((item) => (
                    <tr key={item.id}>
                        <td>{item.id}</td>
                        <td>{item.entregaDescricao || `#${item.entregaId}`}</td>
                        <td>{item.quantidade}</td>
                        <td>{item.status || '-'}</td>
                        <td>{formatDateTime(item.dataSaida)}</td>
                        <td>{item.rastreio || '-'}</td>
                        <td>{item.usuarioLogin || `#${item.usuarioId}`}</td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
}

function ProdutosUnidadeTab({unidadeId}: { unidadeId: string }) {
    const {data, isLoading} = useQuery({
        queryKey: ['estoque-produto-controle', unidadeId],
        queryFn: async () => (await api.get<ControleEstoqueRow[]>('/api/estoque/estoque-produto/controle', {params: {unidadeId}})).data,
        enabled: !!unidadeId,
    });

    const itens = data ?? [];

    if (!unidadeId) return <p className="disp-aviso">Selecione uma unidade para visualizar os produtos.</p>;
    if (isLoading) return <p>Carregando...</p>;
    if (itens.length === 0) return <p>Nenhum produto encontrado na unidade.</p>;

    return (
        <div>
            <div className="estoque-legends">
                <span className="legenda-yellow">Solicitado</span>
                <span className="legenda-orange">Defeito</span>
                <span className="legenda-red">Falta</span>
                <span className="legenda-blue">Não encontrado</span>
                <span className="legenda-green">Previsão Entrega</span>
                <span className="legenda-black">Reservado</span>
            </div>
            <table className="data-table">
                <thead>
                <tr>
                    <th>Foto</th>
                    <th>Id</th>
                    <th>Produto</th>
                    <th>Quantidade Estoque</th>
                    <th>Solicitado</th>
                    <th>Defeito</th>
                    <th>Falta</th>
                    <th>Não Encontrado</th>
                    <th>Reservado</th>
                    <th>Aprovado N. Entregue</th>
                </tr>
                </thead>
                <tbody>
                {itens.map((item) => (
                    <tr key={item.id}>
                        <td>
                            {item.produtoImagem && (
                                <img src={item.produtoImagem} alt="" style={{maxHeight: 32, maxWidth: 32}}/>
                            )}
                        </td>
                        <td>{item.produtoId}</td>
                        <td>{item.produtoNome || `#${item.produtoId}`}</td>
                        <td>{item.quantidade}</td>
                        <td>{item.qtdeSolicitado}</td>
                        <td>{item.qtdeDefeito}</td>
                        <td>{item.qtdeFalta}</td>
                        <td>{item.qtdeNaoEncontrado}</td>
                        <td>{item.qtdeReservado}</td>
                        <td>{item.qtdeAprovadoNaoEntregue}</td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
}

export default function ViewEstoqueControleestoqueListScreen() {
    const [unidadeId, setUnidadeId] = useState('');

    const unidadesQuery = useQuery({
        queryKey: ['unidades-estoque-central'],
        queryFn: async () => (await api.get<UnidadeRow[]>('/api/view/unidade/listUnidade')).data,
    });

    const unidades = (unidadesQuery.data ?? []).filter((u) => u.fl_ativo !== false);

    const tabs: TabItem[] = [
        {
            key: 'produtosEstoqueCentral',
            label: 'Produtos Estoque Central',
            content: <ProdutosEstoqueCentralTab unidadeId={unidadeId}/>
        },
        {key: 'solicitacoes', label: 'Solicitações', content: <SolicitacoesTab unidadeId={unidadeId}/>},
        {key: 'pedidos', label: 'Pedidos', content: <PedidosTab unidadeId={unidadeId}/>},
        {key: 'entregas', label: 'Entregas', content: <EntregasTab unidadeId={unidadeId}/>},
        {key: 'produtosUnidade', label: 'Produtos Unidade', content: <ProdutosUnidadeTab unidadeId={unidadeId}/>},
    ];

    return (
        <PermissionGate permission="READ">
            <main>
                <h1>Controle Estoque</h1>
                <div className="disp-filtros">
                    <div className="disp-filtro">
                        <label htmlFor="central-unidade">Unidade</label>
                        <select
                            id="central-unidade"
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