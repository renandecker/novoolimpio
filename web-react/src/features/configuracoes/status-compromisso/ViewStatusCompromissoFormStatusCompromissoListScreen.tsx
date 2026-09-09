import {PermissionGate} from '../../shared/services/permissions';
import {DataTable} from '../../shared/components/DataTable';

export default function ViewStatusCompromissoFormStatusCompromissoListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Form Status Compromisso</h1><DataTable path="/api/view/statusCompromisso/formStatusCompromisso"/>
        </main>
    </PermissionGate>
}
