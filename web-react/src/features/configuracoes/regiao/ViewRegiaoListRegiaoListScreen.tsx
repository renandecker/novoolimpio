import {PermissionGate} from '../../../shared/services/permissions';
import {DataTable} from '../../../shared/components/DataTable';

export default function ViewRegiaoListRegiaoListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Regiao</h1><DataTable path="/api/view/regiao/listRegiao"/></main>
    </PermissionGate>
}
