import {PermissionGate} from '../../shared/services/permissions';
import {DataTable} from '../../shared/components/DataTable';

export default function ViewCustoServicoFormCustoServicoListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Form Custo Servico</h1><DataTable path="/api/view/custoServico/formCustoServico"/></main>
    </PermissionGate>
}
