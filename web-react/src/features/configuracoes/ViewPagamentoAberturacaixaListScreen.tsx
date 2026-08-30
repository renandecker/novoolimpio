import {PermissionGate} from '../../shared/services/permissions';
import {DataTable} from '../../shared/components/DataTable';

export default function ViewPagamentoAberturacaixaListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Aberturacaixa</h1><DataTable path="/api/view/pagamento/aberturacaixa"/></main>
    </PermissionGate>
}
