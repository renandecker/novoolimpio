import {PermissionGate} from '../permissions';
import {DataTable} from '../DataTable';

export default function ViewContaControlePagamentoListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Controle Pagamento</h1><DataTable path="/api/view/conta/controlePagamento"/></main>
    </PermissionGate>
}