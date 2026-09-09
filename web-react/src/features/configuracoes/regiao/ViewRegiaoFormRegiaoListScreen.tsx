import {PermissionGate} from '../../shared/services/permissions';
import {DataTable} from '../../shared/components/DataTable';

export default function ViewRegiaoFormRegiaoListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Form Regiao</h1><DataTable path="/api/view/regiao/formRegiao"/></main>
    </PermissionGate>
}
