import {PermissionGate} from '../../shared/services/permissions';
import {DataTable} from '../../shared/components/DataTable';

export default function ViewModuloFormModuloListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Form Modulo</h1><DataTable path="/api/view/modulo/formModulo"/></main>
    </PermissionGate>
}
