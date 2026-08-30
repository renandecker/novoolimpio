import {PermissionGate} from '../../shared/services/permissions';
import {DataTable} from '../../shared/components/DataTable';

export default function ViewTipoAtividadeListTipoAtividadeListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Tipo Atividade</h1><DataTable path="/api/view/tipoAtividade/listTipoAtividade"/></main>
    </PermissionGate>
}
