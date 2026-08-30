import {PermissionGate} from '../../shared/services/permissions';
import {DataTable} from '../../shared/components/DataTable';

export default function ViewTelefoneFormTelefoneListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Form Telefone</h1><DataTable path="/api/view/telefone/formTelefone"/></main>
    </PermissionGate>
}
