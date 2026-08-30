import {PermissionGate} from '../../shared/services/permissions';
import {DataTable} from '../../shared/components/DataTable';

export default function ViewRelatoriosListMapaListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Mapa</h1><DataTable path="/api/view/relatorios/listMapa"/></main>
    </PermissionGate>
}
