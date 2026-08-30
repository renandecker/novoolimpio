import {PermissionGate} from '../../shared/services/permissions';
import {DataTable} from '../../shared/components/DataTable';

export default function ViewRelatoriosViewMapaListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>View Mapa</h1><DataTable path="/api/view/relatorios/viewMapa"/></main>
    </PermissionGate>
}
