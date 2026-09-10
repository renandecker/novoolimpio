import {PermissionGate} from '../../../shared/services/permissions';
import {DataTable} from '../../../shared/components/DataTable';

export default function ViewDiaPagamentoFormDiaPagamentoListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Form Dia Pagamento</h1><DataTable path="/api/view/diaPagamento/formDiaPagamento"/></main>
    </PermissionGate>
}
