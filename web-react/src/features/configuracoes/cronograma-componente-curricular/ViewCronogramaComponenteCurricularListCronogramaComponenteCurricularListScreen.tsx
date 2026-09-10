import {PermissionGate} from '../../../shared/services/permissions';
import {DataTable} from '../../../shared/components/DataTable';

export default function ViewCronogramaComponenteCurricularListCronogramaComponenteCurricularListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Cronograma Componente Curricular</h1><DataTable
            path="/api/view/cronogramaComponenteCurricular/listCronogramaComponenteCurricular"/></main>
    </PermissionGate>
}
