import {PermissionGate} from '../../shared/services/permissions';
import {DataTable} from '../../shared/components/DataTable';

export default function ViewTurnoTrabalhoColunasTurnoTrabalhoListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Colunas Turno Trabalho</h1><DataTable path="/api/view/turnoTrabalho/colunasTurnoTrabalho"/></main>
    </PermissionGate>
}
