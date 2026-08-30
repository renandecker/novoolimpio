import {PermissionGate} from '../../shared/services/permissions';
import {DataTable} from '../../shared/components/DataTable';

export default function ViewPerfilListPerfilListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Perfil</h1><DataTable path="/api/basico/perfil"/></main>
    </PermissionGate>
}
