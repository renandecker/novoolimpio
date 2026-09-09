import {PermissionGate} from '../../shared/services/permissions';
import {DataTable} from '../../shared/components/DataTable';

export default function ViewContaCorrenteFormContaCorrenteListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Form Conta Corrente</h1><DataTable path="/api/view/contaCorrente/formContaCorrente"/></main>
    </PermissionGate>
}
