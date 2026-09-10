import {PermissionGate} from '../../../shared/services/permissions';
import {DataTable} from '../../../shared/components/DataTable';

export default function ViewMotivoFormMotivoListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Form Motivo</h1><DataTable path="/api/view/motivo/formMotivo"/></main>
    </PermissionGate>
}
