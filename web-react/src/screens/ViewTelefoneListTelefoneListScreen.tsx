import {PermissionGate} from '../permissions';
import {DataTable} from '../DataTable';

export default function ViewTelefoneListTelefoneListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Telefone</h1><DataTable path="/api/view/telefone/listTelefone"/></main>
    </PermissionGate>
}