import {PermissionGate} from '../../shared/services/permissions';
import {DataTable} from '../../shared/components/DataTable';

export default function ViewNapColunasPrioritarioListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Colunas Prioritario</h1><DataTable path="/api/view/nap/colunasPrioritario"/></main>
    </PermissionGate>
}
