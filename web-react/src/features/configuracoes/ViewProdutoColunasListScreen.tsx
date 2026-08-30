import {PermissionGate} from '../permissions';
import {DataTable} from '../DataTable';

export default function ViewProdutoColunasListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Colunas</h1><DataTable path="/api/view/produto/colunas"/></main>
    </PermissionGate>
}