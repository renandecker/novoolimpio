import {PermissionGate} from '../permissions';
import {DataTable} from '../DataTable';

export default function ViewPacoteListPacoteListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Pacote</h1><DataTable path="/api/view/pacote/listPacote"/></main>
    </PermissionGate>
}