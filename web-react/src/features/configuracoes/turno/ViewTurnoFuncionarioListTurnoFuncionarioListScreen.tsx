import {PermissionGate} from '../../shared/services/permissions';
import {DataTable} from '../../shared/components/DataTable';

export default function ViewTurnoFuncionarioListTurnoFuncionarioListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Turno Funcionario</h1><DataTable path="/api/view/turnoFuncionario/listTurnoFuncionario"/></main>
    </PermissionGate>
}
