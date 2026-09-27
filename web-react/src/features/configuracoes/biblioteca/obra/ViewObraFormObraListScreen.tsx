import {PermissionGate} from '../../../../../shared/services/permissions';
import {DataTable} from '../../../../../shared/components/DataTable';

export default function ViewObraFormObraListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Form Obra</h1><DataTable path="/api/biblioteca/obra/formObra"/></main>
    </PermissionGate>;
}