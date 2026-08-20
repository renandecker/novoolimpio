import {PermissionGate} from '../permissions';
import {DataTable} from '../DataTable';

export default function ViewCampoFormCampoListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Form Campo</h1><DataTable path="/api/view/campo/formCampo"/></main>
    </PermissionGate>
}