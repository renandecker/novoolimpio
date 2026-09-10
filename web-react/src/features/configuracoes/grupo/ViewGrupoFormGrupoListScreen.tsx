import {PermissionGate} from '../../../shared/services/permissions';
import {DataTable} from '../../../shared/components/DataTable';

export default function ViewGrupoFormGrupoListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Form Grupo</h1><DataTable path="/api/view/grupo/formGrupo"/></main>
    </PermissionGate>
}
