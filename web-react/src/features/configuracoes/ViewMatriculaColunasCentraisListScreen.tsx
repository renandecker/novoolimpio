import {PermissionGate} from '../../shared/services/permissions';
import {DataTable} from '../../shared/components/DataTable';

export default function ViewMatriculaColunasCentraisListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Colunas Centrais</h1><DataTable path="/api/view/matricula/colunasCentrais"/></main>
    </PermissionGate>
}
