import {PermissionGate} from '../permissions';
import {DataTable} from '../DataTable';

export default function ViewTurnoEducacaoColunasTurnoEducacaoListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Colunas Turno Educacao</h1><DataTable path="/api/view/turnoEducacao/colunasTurnoEducacao"/></main>
    </PermissionGate>
}