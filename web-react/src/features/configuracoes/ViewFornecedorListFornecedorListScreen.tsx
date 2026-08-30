import {PermissionGate} from '../../shared/services/permissions';
import {DataTable} from '../../shared/components/DataTable';

export default function ViewFornecedorListFornecedorListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Fornecedor</h1><DataTable path="/api/view/fornecedor/listFornecedor"/></main>
    </PermissionGate>
}
