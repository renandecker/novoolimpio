import {PermissionGate} from '../../shared/services/permissions';
import {DataTable} from '../../shared/components/DataTable';

export default function ViewNapColunasCompromissoListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Colunas Compromisso</h1><DataTable path="/api/view/nap/colunasCompromisso"/></main>
    </PermissionGate>
}
