import {PermissionGate} from '../permissions';
import {DataTable} from '../DataTable';

export default function ViewCampoColunasCampoListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Colunas Campo</h1><DataTable path="/api/view/campo/colunasCampo"/></main>
    </PermissionGate>
}