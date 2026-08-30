import {PermissionGate} from '../../shared/services/permissions';
import {DataTable} from '../../shared/components/DataTable';

export default function ViewBairroFormBairroListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Form Bairro</h1><DataTable path="/api/view/bairro/formBairro"/></main>
    </PermissionGate>
}
