import {PermissionGate} from '../../shared/services/permissions';
import {DataTable} from '../../shared/components/DataTable';

export default function ViewTempoAulaListTempoAulaListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Tempo Aula</h1><DataTable path="/api/view/tempoAula/listTempoAula"/></main>
    </PermissionGate>
}
