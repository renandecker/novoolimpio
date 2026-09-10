import {PermissionGate} from '../../../shared/services/permissions';
import {DataTable} from '../../../shared/components/DataTable';

export default function ViewPagamentoCaixasaidaListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Caixasaida</h1><DataTable path="/api/view/pagamento/caixasaida"/></main>
    </PermissionGate>
}
