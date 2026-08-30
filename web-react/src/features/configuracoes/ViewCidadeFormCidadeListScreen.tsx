import {PermissionGate} from '../permissions';
import {DataTable} from '../DataTable';

export default function ViewCidadeFormCidadeListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Form Cidade</h1><DataTable path="/api/view/cidade/formCidade"/></main>
    </PermissionGate>
}