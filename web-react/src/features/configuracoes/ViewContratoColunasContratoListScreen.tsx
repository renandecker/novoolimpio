import {PermissionGate} from '../../shared/services/permissions';
import {DataTable} from '../../shared/components/DataTable';

export default function ViewContratoColunasContratoListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Colunas Contrato</h1><DataTable path="/api/view/contrato/colunasContrato"/></main>
    </PermissionGate>
}
