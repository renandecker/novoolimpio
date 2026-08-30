import {PermissionGate} from '../../shared/services/permissions';
import {DataTable} from '../../shared/components/DataTable';

export default function ViewNapColunasCadernoPrioritariaListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Colunas Caderno Prioritaria</h1><DataTable path="/api/view/nap/colunasCadernoPrioritaria"/></main>
    </PermissionGate>
}
