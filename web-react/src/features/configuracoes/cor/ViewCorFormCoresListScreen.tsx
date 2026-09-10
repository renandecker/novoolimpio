import {PermissionGate} from '../../../shared/services/permissions';
import {DataTable} from '../../../shared/components/DataTable';

export default function ViewCorFormCoresListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Form Cores</h1><DataTable path="/api/view/cor/formCores"/></main>
    </PermissionGate>
}
