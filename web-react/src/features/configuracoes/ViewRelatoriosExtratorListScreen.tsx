import {PermissionGate} from '../../shared/services/permissions';
import {DataTable} from '../../shared/components/DataTable';

export default function ViewRelatoriosExtratorListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Extrator</h1><DataTable path="/api/view/relatorios/extrator"/></main>
    </PermissionGate>
}
