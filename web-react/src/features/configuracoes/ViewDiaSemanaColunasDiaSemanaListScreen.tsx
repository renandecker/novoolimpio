import {PermissionGate} from '../../shared/services/permissions';
import {DataTable} from '../../shared/components/DataTable';

export default function ViewDiaSemanaColunasDiaSemanaListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Colunas Dia Semana</h1><DataTable path="/api/view/diaSemana/colunasDiaSemana"/></main>
    </PermissionGate>
}
