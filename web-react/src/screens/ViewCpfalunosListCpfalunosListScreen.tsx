import {PermissionGate} from '../permissions';
import {DataTable} from '../DataTable';

export default function ViewCpfalunosListCpfalunosListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Cpfalunos</h1><DataTable path="/api/view/cpfalunos/listCpfalunos"/></main>
    </PermissionGate>
}