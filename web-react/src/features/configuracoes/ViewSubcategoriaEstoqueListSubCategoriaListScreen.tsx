import {PermissionGate} from '../permissions';
import {DataTable} from '../DataTable';

export default function ViewSubcategoriaEstoqueListSubCategoriaListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Sub Categoria Estoque</h1><DataTable path="/api/view/subcategoriaEstoque/listSubCategoria"/></main>
    </PermissionGate>
}
