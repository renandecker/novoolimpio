import {PermissionGate} from '../permissions';
import {DataTable} from '../DataTable';

export default function ViewUnidadeColunasRedeListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Colunas Rede</h1><DataTable path="/api/view/unidade/colunasRede"/></main>
    </PermissionGate>
}