import {PermissionGate} from '../../../shared/services/permissions';
import {DataTable} from '../../../shared/components/DataTable';

export default function ViewTipoPagamentoListTipoPagamentoListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Tipo Pagamento</h1><DataTable path="/api/view/tipoPagamento/listTipoPagamento"/></main>
    </PermissionGate>
}
