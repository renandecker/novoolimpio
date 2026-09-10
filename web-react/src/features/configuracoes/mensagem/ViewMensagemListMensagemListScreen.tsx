import {PermissionGate} from '../../../shared/services/permissions';
import {DataTable} from '../../../shared/components/DataTable';

export default function ViewMensagemListMensagemListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Mensagem</h1><DataTable path="/api/view/mensagem/listMensagem"/></main>
    </PermissionGate>
}
