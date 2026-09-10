import {PermissionGate} from '../../../shared/services/permissions';
import {DataTable} from '../../../shared/components/DataTable';

export default function ViewCategoriaCampoFormCategoriaCampoListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Form Categoria Campo</h1><DataTable path="/api/view/categoriaCampo/formCategoriaCampo"/></main>
    </PermissionGate>
}
