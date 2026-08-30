import {PermissionGate} from '../permissions';
import {DataTable} from '../DataTable';

export default function ViewMenuListMapaMenuListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Mapa Menu</h1><DataTable path="/api/view/menu/listMapaMenu"/></main>
    </PermissionGate>
}