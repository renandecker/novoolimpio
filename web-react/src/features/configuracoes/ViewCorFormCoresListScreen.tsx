import {PermissionGate} from '../permissions';
import {DataTable} from '../DataTable';

export default function ViewCorFormCoresListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Form Cores</h1><DataTable path="/api/view/cor/formCores"/></main>
    </PermissionGate>
}