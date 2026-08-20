import {PermissionGate} from '../permissions';
import {DataTable} from '../DataTable';

export default function ViewMatriculaColunasContratoListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Colunas Contrato</h1><DataTable path="/api/view/matricula/colunasContrato"/></main>
    </PermissionGate>
}