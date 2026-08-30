import {PermissionGate} from '../permissions';
import {DataTable} from '../DataTable';

export default function ViewFuncaoListFuncaoListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Funcao</h1><DataTable path="/api/view/funcao/listFuncao"/></main>
    </PermissionGate>
}