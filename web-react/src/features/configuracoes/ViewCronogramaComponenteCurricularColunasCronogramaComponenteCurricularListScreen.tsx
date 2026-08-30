import {PermissionGate} from '../../shared/services/permissions';
import {DataTable} from '../../shared/components/DataTable';

export default function ViewCronogramaComponenteCurricularColunasCronogramaComponenteCurricularListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Colunas Cronograma Componente Curricular</h1><DataTable
            path="/api/view/cronogramaComponenteCurricular/colunasCronogramaComponenteCurricular"/></main>
    </PermissionGate>
}
