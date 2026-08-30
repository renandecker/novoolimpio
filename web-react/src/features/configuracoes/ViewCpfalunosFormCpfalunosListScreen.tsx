import {PermissionGate} from '../permissions';
import {DataTable} from '../DataTable';

export default function ViewCpfalunosFormCpfalunosListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Form Cpfalunos</h1><DataTable path="/api/view/cpfalunos/formCpfalunos"/></main>
    </PermissionGate>
}