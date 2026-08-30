import {PermissionGate} from '../../shared/services/permissions';
import {DataTable} from '../../shared/components/DataTable';

export default function ViewConfiguracaoFinanceiraFormConfiguracaoFinanceiraListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Form Configuracao Financeira</h1><DataTable path="/api/view/configuracaoFinanceira/formConfiguracaoFinanceira"/></main>
    </PermissionGate>
}
