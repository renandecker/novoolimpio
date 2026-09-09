import {PermissionGate} from '../../shared/services/permissions';
import {DataTable} from '../../shared/components/DataTable';

export default function ViewCronogramaComponenteCurricularFormCronogramaComponenteCurricularListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Form Cronograma Componente Curricular</h1><DataTable
            path="/api/view/cronogramaComponenteCurricular/formCronogramaComponenteCurricular"/></main>
    </PermissionGate>
}
