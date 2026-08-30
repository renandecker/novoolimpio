import {PermissionGate} from '../../shared/services/permissions';
import {DataTable} from '../../shared/components/DataTable';

export default function ViewStatusCompromissoColunasStatusCompromissoListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Colunas Status Compromisso</h1><DataTable
            path="/api/view/statusCompromisso/colunasStatusCompromisso"/></main>
    </PermissionGate>
}
