import {PermissionGate} from '../permissions';
import {DataTable} from '../DataTable';

export default function ViewOperacionalFormOperacionalListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Form Operacional</h1><DataTable path="/api/view/operacional/formOperacional"/></main>
    </PermissionGate>
}