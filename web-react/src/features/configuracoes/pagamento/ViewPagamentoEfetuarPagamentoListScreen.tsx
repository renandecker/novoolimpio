import {PermissionGate} from '../../../shared/services/permissions';
import {DataTable} from '../../../shared/components/DataTable';

export default function ViewPagamentoEfetuarPagamentoListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Efetuar Pagamento</h1><DataTable path="/api/view/pagamento/efetuarPagamento"/></main>
    </PermissionGate>
}
