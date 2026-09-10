import {PermissionGate} from '../../../shared/services/permissions';
import {DataTable} from '../../../shared/components/DataTable';

export default function ViewGrupoComponenteCurricularFormGrupoComponenteCurricularListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Form Grupo Componente Curricular</h1><DataTable
            path="/api/view/grupoComponenteCurricular/formGrupoComponenteCurricular"/></main>
    </PermissionGate>
}
