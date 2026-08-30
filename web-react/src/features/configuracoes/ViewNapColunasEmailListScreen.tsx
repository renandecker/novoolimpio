import {PermissionGate} from '../../shared/services/permissions';
import {DataTable} from '../../shared/components/DataTable';

export default function ViewNapColunasEmailListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Colunas Email</h1><DataTable path="/api/view/nap/colunasEmail"/></main>
    </PermissionGate>
}
