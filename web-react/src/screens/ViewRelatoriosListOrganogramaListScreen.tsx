import {PermissionGate} from '../permissions';
import {DataTable} from '../DataTable';

export default function ViewRelatoriosListOrganogramaListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Organograma</h1><DataTable path="/api/view/relatorios/listOrganograma"/></main>
    </PermissionGate>
}