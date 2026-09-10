import {PermissionGate} from '../../../shared/services/permissions';
import {DataTable} from '../../../shared/components/DataTable';

export default function ViewCategoriaEstoqueListCategoriaListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Categoria Estoque</h1><DataTable path="/api/view/categoriaEstoque/listCategoria"/></main>
    </PermissionGate>
}
