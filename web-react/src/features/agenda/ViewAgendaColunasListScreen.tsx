import {PermissionGate} from '../permissions';
import {DataTable} from '../DataTable';

export default function ViewAgendaColunasListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Colunas</h1><DataTable path="/api/view/agenda/colunas"/></main>
    </PermissionGate>
}