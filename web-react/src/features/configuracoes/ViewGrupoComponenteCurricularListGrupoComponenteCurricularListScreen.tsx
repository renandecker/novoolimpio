import {PermissionGate} from '../../shared/services/permissions';
import {DataTable} from '../../shared/components/DataTable';

export default function ViewGrupoComponenteCurricularListGrupoComponenteCurricularListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Grupo Componente Curricular</h1><DataTable
            path="/api/view/grupoComponenteCurricular/listGrupoComponenteCurricular"/></main>
    </PermissionGate>
}
