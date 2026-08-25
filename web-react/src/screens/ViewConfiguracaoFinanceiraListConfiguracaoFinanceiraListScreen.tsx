import {PermissionGate} from '../permissions';
import {DataTable} from '../DataTable';

export default function ViewConfiguracaoFinanceiraListConfiguracaoFinanceiraListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Configuracao Financeira</h1><DataTable path="/api/view/configuracaoFinanceira/listConfiguracaoFinanceira"/></main>
    </PermissionGate>
}
