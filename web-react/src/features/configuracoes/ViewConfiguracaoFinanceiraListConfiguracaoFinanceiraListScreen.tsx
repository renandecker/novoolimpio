import {PermissionGate} from '../../shared/services/permissions';
import {DataTable, type DataTableColumn} from '../../shared/components/DataTable';

const COLUMNS: DataTableColumn[] = [
    {key: 'id', label: 'Id'},
    {key: 'nome', label: 'Nome'},
    {key: 'descricao', label: 'Descrição'},
    {key: 'tipo', label: 'Tipo'},
    {key: 'ativo', label: 'Ativo'},
];

export default function ViewConfiguracaoFinanceiraListConfiguracaoFinanceiraListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Configuracao Financeira</h1><DataTable path="/api/view/configuracaoFinanceira/listConfiguracaoFinanceira" columns={COLUMNS}/></main>
    </PermissionGate>;
}
