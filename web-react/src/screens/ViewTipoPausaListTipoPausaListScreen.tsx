import {PermissionGate} from '../permissions';
import {DataTable} from '../DataTable';

export default function ViewTipoPausaListTipoPausaListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Tipo Pausa</h1><DataTable path="/api/view/tipoPausa/listTipoPausa"/></main>
    </PermissionGate>
}