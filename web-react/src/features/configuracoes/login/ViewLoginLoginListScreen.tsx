import {PermissionGate} from '../../shared/services/permissions';
import {DataTable} from '../../shared/components/DataTable';

export default function ViewLoginLoginListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Login</h1><DataTable path="/api/view/login/login"/></main>
    </PermissionGate>
}
