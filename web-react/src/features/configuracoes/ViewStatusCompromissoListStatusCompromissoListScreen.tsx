import {PermissionGate} from '../permissions';
import {DataTable} from '../DataTable';

export default function ViewStatusCompromissoListStatusCompromissoListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Status Compromisso</h1><DataTable path="/api/view/statusCompromisso/listStatusCompromisso"/></main>
    </PermissionGate>
}