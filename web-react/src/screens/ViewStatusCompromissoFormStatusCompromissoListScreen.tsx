import {PermissionGate} from '../permissions';
import {DataTable} from '../DataTable';

export default function ViewStatusCompromissoFormStatusCompromissoListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Form Status Compromisso</h1><DataTable path="/api/view/statusCompromisso/formStatusCompromisso"/>
        </main>
    </PermissionGate>
}