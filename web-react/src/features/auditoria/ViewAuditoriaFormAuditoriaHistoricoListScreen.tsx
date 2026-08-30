import {PermissionGate} from '../../shared/services/permissions';
import {DataTable} from '../../shared/components/DataTable';

export default function ViewAuditoriaFormAuditoriaHistoricoListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Form Auditoria Historico</h1><DataTable path="/api/view/auditoria/formAuditoriaHistorico"/></main>
    </PermissionGate>
}
