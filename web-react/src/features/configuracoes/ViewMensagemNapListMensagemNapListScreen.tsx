import {PermissionGate} from '../../shared/services/permissions';
import {DataTable} from '../../shared/components/DataTable';

export default function ViewMensagemNapListMensagemNapListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Mensagem Nap</h1><DataTable path="/api/view/mensagemNap/listMensagemNap"/></main>
    </PermissionGate>
}
