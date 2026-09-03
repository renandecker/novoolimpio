import {PermissionGate} from '../../shared/services/permissions';
import {DataTable, type DataTableColumn} from '../../shared/components/DataTable';

const MOVIMENTACAO_COLUMNS: DataTableColumn[] = [
    {key: 'valor', label: 'Valor'},
    {key: 'quantidade', label: 'Quantidade'},
    {key: 'tipoMovimentacao', label: 'Tipo'},
    {key: 'dataMovimento', label: 'Data'},
    {key: 'produtoId', label: 'Produto'},
    {key: 'unidadeId', label: 'Unidade'},
    {key: 'usuarioId', label: 'Usuário'},
    {key: 'vendaProdutoId', label: 'Venda Produto'},
    {key: 'fornecedorId', label: 'Fornecedor'},
    {key: 'central', label: 'Central'},
];

export default function ViewMovimentacaoFormMovimentacaoEstoqueListScreen() {
    return (
        <PermissionGate permission="READ">
            <main>
                <h1>Form Movimentacao Estoque</h1>
                <DataTable path="/api/estoque/movimentacao-estoque" columns={MOVIMENTACAO_COLUMNS}/>
            </main>
        </PermissionGate>
    );
}
