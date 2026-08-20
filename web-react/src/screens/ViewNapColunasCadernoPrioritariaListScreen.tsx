import {PermissionGate} from '../permissions';
import {DataTable} from '../DataTable';

export default function ViewNapColunasCadernoPrioritariaListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Colunas Caderno Prioritaria</h1><DataTable path="/api/view/nap/colunasCadernoPrioritaria"/></main>
    </PermissionGate>
}