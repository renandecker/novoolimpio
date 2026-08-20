import {PermissionGate} from '../permissions';
import {DataTable} from '../DataTable';

export default function ViewModuloFormModuloListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Form Modulo</h1><DataTable path="/api/view/modulo/formModulo"/></main>
    </PermissionGate>
}