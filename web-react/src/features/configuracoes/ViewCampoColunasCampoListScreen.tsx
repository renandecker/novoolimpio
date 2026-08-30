import {PermissionGate} from '../../shared/services/permissions';
import {DataTable} from '../../shared/components/DataTable';

export default function ViewCampoColunasCampoListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Colunas Campo</h1><DataTable path="/api/view/campo/colunasCampo"/></main>
    </PermissionGate>
}
