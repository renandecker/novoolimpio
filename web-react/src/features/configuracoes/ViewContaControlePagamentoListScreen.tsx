import {PermissionGate} from '../../shared/services/permissions';
import {DataTable} from '../../shared/components/DataTable';

export default function ViewContaControlePagamentoListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Controle Pagamento</h1><DataTable path="/api/view/conta/controlePagamento"/></main>
    </PermissionGate>
}
