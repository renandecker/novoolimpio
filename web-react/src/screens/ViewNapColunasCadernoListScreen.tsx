import {PermissionGate} from '../permissions';
import {DataTable} from '../DataTable';

export default function ViewNapColunasCadernoListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Colunas Caderno</h1><DataTable path="/api/view/nap/colunasCaderno"/></main>
    </PermissionGate>
}