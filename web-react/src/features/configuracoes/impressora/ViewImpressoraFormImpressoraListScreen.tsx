import {PermissionGate} from '../../shared/services/permissions';
import {DataTable} from '../../shared/components/DataTable';

export default function ViewImpressoraFormImpressoraListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Form Impressora</h1><DataTable path="/api/view/impressora/formImpressora"/></main>
    </PermissionGate>
}
