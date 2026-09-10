import {PermissionGate} from '../../../shared/services/permissions';
import {DataTable} from '../../../shared/components/DataTable';

export default function ViewProspectoCadastroProspectoListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Cadastro Prospecto</h1><DataTable path="/api/view/prospecto/cadastroProspecto"/></main>
    </PermissionGate>
}
