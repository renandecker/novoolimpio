import {PermissionGate} from '../permissions';
import {DataTable} from '../DataTable';

export default function ViewLogradouroFormLogradouroListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Form Logradouro</h1><DataTable path="/api/view/logradouro/formLogradouro"/></main>
    </PermissionGate>
}