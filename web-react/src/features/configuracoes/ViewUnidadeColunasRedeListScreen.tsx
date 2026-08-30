import {PermissionGate} from '../../shared/services/permissions';
import {DataTable} from '../../shared/components/DataTable';

export default function ViewUnidadeColunasRedeListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Colunas Rede</h1><DataTable path="/api/view/unidade/colunasRede"/></main>
    </PermissionGate>
}
