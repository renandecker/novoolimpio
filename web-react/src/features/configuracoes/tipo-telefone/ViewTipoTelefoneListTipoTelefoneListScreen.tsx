import {PermissionGate} from '../../shared/services/permissions';
import {DataTable} from '../../shared/components/DataTable';

export default function ViewTipoTelefoneListTipoTelefoneListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Tipo Telefone</h1><DataTable path="/api/view/tipoTelefone/listTipoTelefone"/></main>
    </PermissionGate>
}
