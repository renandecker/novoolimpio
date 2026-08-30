import {PermissionGate} from '../../shared/services/permissions';
import {DataTable} from '../../shared/components/DataTable';

export default function ViewImpressoraListImpressoraListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Impressora</h1><DataTable path="/api/view/impressora/listImpressora"/></main>
    </PermissionGate>
}
