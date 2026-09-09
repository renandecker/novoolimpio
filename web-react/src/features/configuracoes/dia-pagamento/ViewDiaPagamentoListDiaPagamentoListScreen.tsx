import {PermissionGate} from '../../shared/services/permissions';
import {DataTable} from '../../shared/components/DataTable';

export default function ViewDiaPagamentoListDiaPagamentoListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Dia Pagamento</h1><DataTable path="/api/view/diaPagamento/listDiaPagamento"/></main>
    </PermissionGate>
}
