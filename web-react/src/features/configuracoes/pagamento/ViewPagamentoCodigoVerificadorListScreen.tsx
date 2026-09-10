import {PermissionGate} from '../../../shared/services/permissions';
import {DataTable} from '../../../shared/components/DataTable';

export default function ViewPagamentoCodigoVerificadorListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Codigo Verificador</h1><DataTable path="/api/view/pagamento/codigoVerificador"/></main>
    </PermissionGate>
}
