import {PermissionGate} from '../../shared/services/permissions';
import {DataTable} from '../../shared/components/DataTable';

export default function ViewMenuListMapaMenuListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Mapa Menu</h1><DataTable path="/api/view/menu/listMapaMenu"/></main>
    </PermissionGate>
}
