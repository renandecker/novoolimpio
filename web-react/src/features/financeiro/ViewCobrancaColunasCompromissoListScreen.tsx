import {PermissionGate} from '../../shared/services/permissions';
import {DataTable} from '../../shared/components/DataTable';

export default function ViewCobrancaColunasCompromissoListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Colunas Compromisso</h1><DataTable path="/api/view/cobranca/colunasCompromisso"/></main>
    </PermissionGate>
}
