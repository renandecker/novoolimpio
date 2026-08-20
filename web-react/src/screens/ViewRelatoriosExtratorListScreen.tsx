import {PermissionGate} from '../permissions';
import {DataTable} from '../DataTable';

export default function ViewRelatoriosExtratorListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Extrator</h1><DataTable path="/api/view/relatorios/extrator"/></main>
    </PermissionGate>
}