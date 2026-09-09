import {PermissionGate} from '../../shared/services/permissions';
import {DataTable} from '../../shared/components/DataTable';

export default function ViewPagamentoCaixaentradaListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Caixaentrada</h1><DataTable path="/api/view/pagamento/caixaentrada"/></main>
    </PermissionGate>
}
