import {PermissionGate} from '../../../shared/services/permissions';
import {DataTable} from '../../../shared/components/DataTable';

export default function ViewMensagemMetaListMensagemMetaListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Mensagem Meta</h1><DataTable path="/api/view/mensagemMeta/listMensagemMeta"/></main>
    </PermissionGate>
}
