import {PermissionGate} from '../../shared/services/permissions';
import {DataTable} from '../../shared/components/DataTable';

export default function ViewAuditoriaListAuditoriaHistoricoListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Auditoria Historico</h1><DataTable path="/api/view/auditoria/listAuditoriaHistorico"/></main>
    </PermissionGate>
}
