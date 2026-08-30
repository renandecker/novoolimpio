import {PermissionGate} from '../../shared/services/permissions';
import {DataTable} from '../../shared/components/DataTable';

export default function ViewContaGestaoContaListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Gestao Conta</h1><DataTable path="/api/view/conta/gestaoConta"/></main>
    </PermissionGate>
}
