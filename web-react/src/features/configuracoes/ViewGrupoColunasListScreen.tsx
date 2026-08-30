import {PermissionGate} from '../permissions';
import {DataTable} from '../DataTable';

export default function ViewGrupoColunasListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Colunas</h1><DataTable path="/api/view/grupo/colunas"/></main>
    </PermissionGate>
}