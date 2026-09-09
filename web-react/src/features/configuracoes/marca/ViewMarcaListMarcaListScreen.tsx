import {PermissionGate} from '../../shared/services/permissions';
import {DataTable} from '../../shared/components/DataTable';

export default function ViewMarcaListMarcaListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Marca</h1><DataTable path="/api/view/marca/listMarca"/></main>
    </PermissionGate>
}
