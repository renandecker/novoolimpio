import {PermissionGate} from '../../shared/services/permissions';
import {DataTable} from '../../shared/components/DataTable';

export default function ViewSalaFormSalaListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Form Sala</h1><DataTable path="/api/view/sala/formSala"/></main>
    </PermissionGate>
}
