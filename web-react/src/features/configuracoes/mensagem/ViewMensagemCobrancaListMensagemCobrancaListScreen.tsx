import {PermissionGate} from '../../../shared/services/permissions';
import {DataTable} from '../../../shared/components/DataTable';

export default function ViewMensagemCobrancaListMensagemCobrancaListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Mensagem Cobranca</h1><DataTable path="/api/view/mensagemCobranca/listMensagemCobranca"/></main>
    </PermissionGate>
}
