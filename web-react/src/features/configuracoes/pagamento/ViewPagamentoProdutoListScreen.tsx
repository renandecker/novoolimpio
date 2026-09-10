import {PermissionGate} from '../../../shared/services/permissions';
import {DataTable} from '../../../shared/components/DataTable';

export default function ViewPagamentoProdutoListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Produto</h1><DataTable path="/api/view/pagamento/produto"/></main>
    </PermissionGate>
}
