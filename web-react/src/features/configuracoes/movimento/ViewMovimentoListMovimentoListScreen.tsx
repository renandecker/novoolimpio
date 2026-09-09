import {PermissionGate} from '../../shared/services/permissions';
import {DataTable} from '../../shared/components/DataTable';

export default function ViewMovimentoListMovimentoListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Movimento</h1><DataTable path="/api/view/movimento/listMovimento"/></main>
    </PermissionGate>
}
