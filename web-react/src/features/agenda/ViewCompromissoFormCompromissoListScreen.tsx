import {PermissionGate} from '../../shared/services/permissions';
import {DataTable} from '../../shared/components/DataTable';

export default function ViewCompromissoFormCompromissoListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Form Compromisso</h1><DataTable path="/api/view/compromisso/formCompromisso"/></main>
    </PermissionGate>
}
