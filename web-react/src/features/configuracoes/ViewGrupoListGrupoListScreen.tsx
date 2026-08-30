import {PermissionGate} from '../../shared/services/permissions';
import {DataTable} from '../../shared/components/DataTable';

export default function ViewGrupoListGrupoListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Grupo</h1><DataTable path="/api/view/grupo/listGrupo"/></main>
    </PermissionGate>
}
