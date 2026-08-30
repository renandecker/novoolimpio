import {PermissionGate} from '../permissions';
import {DataTable} from '../DataTable';

export default function ViewMensagemNapListMensagemNapListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Mensagem Nap</h1><DataTable path="/api/view/mensagemNap/listMensagemNap"/></main>
    </PermissionGate>
}