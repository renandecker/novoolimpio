import {PermissionGate} from '../permissions';
import {DataTable} from '../DataTable';

export default function ViewAuditoriaListAuditoriaListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Auditoria</h1><DataTable path="/api/view/auditoria/listAuditoria"/></main>
    </PermissionGate>
}