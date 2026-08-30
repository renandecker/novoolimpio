import {PermissionGate} from '../permissions';
import {DataTable} from '../DataTable';

export default function ViewConfiguracaoFinanceiraFormConfiguracaoFinanceiraListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Form Configuracao Financeira</h1><DataTable path="/api/view/configuracaoFinanceira/formConfiguracaoFinanceira"/></main>
    </PermissionGate>
}
