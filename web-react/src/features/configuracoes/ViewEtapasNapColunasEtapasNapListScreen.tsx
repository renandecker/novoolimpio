import {PermissionGate} from '../../shared/services/permissions';
import {DataTable} from '../../shared/components/DataTable';

export default function ViewEtapasNapColunasEtapasNapListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Colunas Etapas Nap</h1><DataTable path="/api/view/etapasNap/colunasEtapasNap"/></main>
    </PermissionGate>
}
