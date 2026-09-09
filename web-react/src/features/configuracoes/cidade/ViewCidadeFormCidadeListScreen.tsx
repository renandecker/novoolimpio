import {PermissionGate} from '../../shared/services/permissions';
import {DataTable} from '../../shared/components/DataTable';

export default function ViewCidadeFormCidadeListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Form Cidade</h1><DataTable path="/api/view/cidade/formCidade"/></main>
    </PermissionGate>
}
