import {PermissionGate} from '../../../shared/services/permissions';
import {DataTable} from '../../../shared/components/DataTable';

export default function ViewCategoriaListCategoriaListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Categoria</h1><DataTable path="/api/view/categoria/listCategoria"/></main>
    </PermissionGate>
}
