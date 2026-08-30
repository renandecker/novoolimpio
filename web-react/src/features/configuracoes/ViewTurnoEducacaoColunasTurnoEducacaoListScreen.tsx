import {PermissionGate} from '../../shared/services/permissions';
import {DataTable} from '../../shared/components/DataTable';

export default function ViewTurnoEducacaoColunasTurnoEducacaoListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Colunas Turno Educacao</h1><DataTable path="/api/view/turnoEducacao/colunasTurnoEducacao"/></main>
    </PermissionGate>
}
