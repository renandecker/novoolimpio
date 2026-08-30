import {PermissionGate} from '../permissions';
import {DataTable} from '../DataTable';

export default function ViewFuncaoFormFuncaoListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Form Funcao</h1><DataTable path="/api/view/funcao/formFuncao"/></main>
    </PermissionGate>
}