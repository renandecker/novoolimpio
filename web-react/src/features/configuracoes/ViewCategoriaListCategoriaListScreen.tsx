import {PermissionGate} from '../permissions';
import {DataTable} from '../DataTable';

export default function ViewCategoriaListCategoriaListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Categoria</h1><DataTable path="/api/view/categoria/listCategoria"/></main>
    </PermissionGate>
}