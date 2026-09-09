import {PermissionGate} from '../../shared/services/permissions';
import {DataTable} from '../../shared/components/DataTable';

export default function ViewCampoFormCampoListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Form Campo</h1><DataTable path="/api/view/campo/formCampo"/></main>
    </PermissionGate>
}
