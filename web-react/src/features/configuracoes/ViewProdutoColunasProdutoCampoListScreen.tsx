import {PermissionGate} from '../../shared/services/permissions';
import {DataTable} from '../../shared/components/DataTable';

export default function ViewProdutoColunasProdutoCampoListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Colunas Produto Campo</h1><DataTable path="/api/view/produto/colunasProdutoCampo"/></main>
    </PermissionGate>
}
