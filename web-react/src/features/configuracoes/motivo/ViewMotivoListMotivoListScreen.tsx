import {PermissionGate} from '../../../shared/services/permissions';
import {DataTable} from '../../../shared/components/DataTable';

export default function ViewMotivoListMotivoListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Motivo</h1><DataTable path="/api/view/motivo/listMotivo"/></main>
    </PermissionGate>
}
