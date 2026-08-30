import {PermissionGate} from '../../shared/services/permissions';
import {DataTable} from '../../shared/components/DataTable';

export default function ViewFuncaoFormFuncaoListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Form Funcao</h1><DataTable path="/api/view/funcao/formFuncao"/></main>
    </PermissionGate>
}
