import {PermissionGate} from '../permissions';
import {DataTable} from '../DataTable';

export default function ViewMovimentoListMovimentoListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Movimento</h1><DataTable path="/api/view/movimento/listMovimento"/></main>
    </PermissionGate>
}