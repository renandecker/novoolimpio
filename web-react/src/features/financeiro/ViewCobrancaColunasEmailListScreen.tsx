import {PermissionGate} from '../permissions';
import {DataTable} from '../DataTable';

export default function ViewCobrancaColunasEmailListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Colunas Email</h1><DataTable path="/api/view/cobranca/colunasEmail"/></main>
    </PermissionGate>
}