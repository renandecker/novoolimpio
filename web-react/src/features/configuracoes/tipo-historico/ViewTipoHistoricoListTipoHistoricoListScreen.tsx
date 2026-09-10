import {PermissionGate} from '../../../shared/services/permissions';
import {DataTable} from '../../../shared/components/DataTable';

export default function ViewTipoHistoricoListTipoHistoricoListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Tipo Historico</h1><DataTable path="/api/view/tipoHistorico/listTipoHistorico"/></main>
    </PermissionGate>
}
