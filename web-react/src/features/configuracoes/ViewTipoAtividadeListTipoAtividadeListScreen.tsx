import {PermissionGate} from '../permissions';
import {DataTable} from '../DataTable';

export default function ViewTipoAtividadeListTipoAtividadeListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Tipo Atividade</h1><DataTable path="/api/view/tipoAtividade/listTipoAtividade"/></main>
    </PermissionGate>
}