import {PermissionGate} from '../../shared/services/permissions';
import {DataTable} from '../../shared/components/DataTable';

export default function ViewProfessorColunasDisponibilidadeProfessorListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Colunas Disponibilidade Professor</h1><DataTable
            path="/api/view/professor/colunasDisponibilidadeProfessor"/></main>
    </PermissionGate>
}
