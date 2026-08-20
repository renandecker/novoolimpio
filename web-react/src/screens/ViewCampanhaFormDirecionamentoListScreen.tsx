import {PermissionGate} from '../permissions';
import {DataTable} from '../DataTable';

export default function ViewCampanhaFormDirecionamentoListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Form Direcionamento</h1><DataTable path="/api/view/campanha/formDirecionamento"/></main>
    </PermissionGate>
}