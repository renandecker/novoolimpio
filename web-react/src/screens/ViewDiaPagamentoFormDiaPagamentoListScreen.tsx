import {PermissionGate} from '../permissions';
import {DataTable} from '../DataTable';

export default function ViewDiaPagamentoFormDiaPagamentoListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Form Dia Pagamento</h1><DataTable path="/api/view/diaPagamento/formDiaPagamento"/></main>
    </PermissionGate>
}