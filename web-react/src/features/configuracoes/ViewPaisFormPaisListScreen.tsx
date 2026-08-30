import {PermissionGate} from '../permissions';
import {DataTable} from '../DataTable';

export default function ViewPaisFormPaisListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Form Pais</h1><DataTable path="/api/view/pais/formPais"/></main>
    </PermissionGate>
}