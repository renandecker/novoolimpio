import {PermissionGate} from '../permissions';
import {DataTable} from '../DataTable';

export default function ViewEtapasCobrancaColunasEtapasCobrancaListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Colunas Etapas Cobranca</h1><DataTable path="/api/view/etapasCobranca/colunasEtapasCobranca"/></main>
    </PermissionGate>
}