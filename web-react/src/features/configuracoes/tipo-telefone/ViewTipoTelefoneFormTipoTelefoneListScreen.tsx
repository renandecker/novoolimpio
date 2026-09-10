import {PermissionGate} from '../../../shared/services/permissions';
import {DataTable} from '../../../shared/components/DataTable';

export default function ViewTipoTelefoneFormTipoTelefoneListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Form Tipo Telefone</h1><DataTable path="/api/view/tipoTelefone/formTipoTelefone"/></main>
    </PermissionGate>
}
