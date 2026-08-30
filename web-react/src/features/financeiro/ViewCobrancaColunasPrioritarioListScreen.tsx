import {PermissionGate} from '../../shared/services/permissions';
import {DataTable} from '../../shared/components/DataTable';

export default function ViewCobrancaColunasPrioritarioListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Colunas Prioritario</h1><DataTable path="/api/view/cobranca/colunasPrioritario"/></main>
    </PermissionGate>
}
