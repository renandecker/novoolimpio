import {PermissionGate} from '../../shared/services/permissions';
import {DataTable} from '../../shared/components/DataTable';

export default function ViewTempoAulaFormTempoAulaListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Form Tempo Aula</h1><DataTable path="/api/view/tempoAula/formTempoAula"/></main>
    </PermissionGate>
}
