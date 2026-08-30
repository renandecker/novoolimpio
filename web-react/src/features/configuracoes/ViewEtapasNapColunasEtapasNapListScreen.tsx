import {PermissionGate} from '../permissions';
import {DataTable} from '../DataTable';

export default function ViewEtapasNapColunasEtapasNapListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Colunas Etapas Nap</h1><DataTable path="/api/view/etapasNap/colunasEtapasNap"/></main>
    </PermissionGate>
}