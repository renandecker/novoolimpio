import {PermissionGate} from '../permissions';
import {DataTable} from '../DataTable';

export default function ViewCategoriaFormCategoriaListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Form Categoria</h1><DataTable path="/api/view/categoria/formCategoria"/></main>
    </PermissionGate>
}