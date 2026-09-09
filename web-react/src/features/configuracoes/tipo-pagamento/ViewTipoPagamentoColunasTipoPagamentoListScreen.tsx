import {PermissionGate} from '../../shared/services/permissions';
import {DataTable} from '../../shared/components/DataTable';

export default function ViewTipoPagamentoColunasTipoPagamentoListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Colunas Tipo Pagamento</h1><DataTable path="/api/view/tipoPagamento/colunasTipoPagamento"/></main>
    </PermissionGate>
}
