import {PermissionGate} from '../../shared/services/permissions';
import {DataTable} from '../../shared/components/DataTable';

export default function ViewTelefoneColunasTelefoneListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Colunas Telefone</h1><DataTable path="/api/view/telefone/colunasTelefone"/></main>
    </PermissionGate>
}
