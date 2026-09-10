import {PermissionGate} from '../../../shared/services/permissions';
import {DataTable} from '../../../shared/components/DataTable';

export default function ViewContaCorrenteListContaCorrenteListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Conta Corrente</h1><DataTable path="/api/view/contaCorrente/listContaCorrente"/></main>
    </PermissionGate>
}
