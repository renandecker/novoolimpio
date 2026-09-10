import {PermissionGate} from '../../../shared/services/permissions';
import {DataTable} from '../../../shared/components/DataTable';

export default function ViewTipoPagamentoFormTipoPagamentoListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Form Tipo Pagamento</h1><DataTable path="/api/view/tipoPagamento/formTipoPagamento"/></main>
    </PermissionGate>
}
