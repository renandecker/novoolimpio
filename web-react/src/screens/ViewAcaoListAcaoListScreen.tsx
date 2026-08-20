import {PermissionGate} from '../permissions';
import {DataTable} from '../DataTable';

export default function ViewAcaoListAcaoListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Acao</h1><DataTable path="/api/view/acao/listAcao"/></main>
    </PermissionGate>
}