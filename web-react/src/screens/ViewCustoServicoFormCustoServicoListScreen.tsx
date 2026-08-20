import {PermissionGate} from '../permissions';
import {DataTable} from '../DataTable';

export default function ViewCustoServicoFormCustoServicoListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Form Custo Servico</h1><DataTable path="/api/view/custoServico/formCustoServico"/></main>
    </PermissionGate>
}