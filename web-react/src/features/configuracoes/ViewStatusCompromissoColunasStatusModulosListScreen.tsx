import {PermissionGate} from '../../shared/services/permissions';
import {DataTable} from '../../shared/components/DataTable';

export default function ViewStatusCompromissoColunasStatusModulosListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Colunas Status Modulos</h1><DataTable path="/api/view/statusCompromisso/colunasStatusModulos"/></main>
    </PermissionGate>
}
