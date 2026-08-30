import {PermissionGate} from '../permissions';
import {DataTable} from '../DataTable';

export default function ViewFornecedorColunasFornecedoresListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Colunas Fornecedores</h1><DataTable path="/api/view/fornecedor/colunasFornecedores"/></main>
    </PermissionGate>
}