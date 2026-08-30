import {PermissionGate} from '../permissions';
import {DataTable} from '../DataTable';

export default function ViewTurnoFuncionarioListTurnoFuncionarioListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Turno Funcionario</h1><DataTable path="/api/view/turnoFuncionario/listTurnoFuncionario"/></main>
    </PermissionGate>
}