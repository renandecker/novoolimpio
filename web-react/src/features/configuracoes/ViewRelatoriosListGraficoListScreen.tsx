import {PermissionGate} from '../../shared/services/permissions';
import {DataTable} from '../../shared/components/DataTable';

export default function ViewRelatoriosListGraficoListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Grafico</h1><DataTable path="/api/view/relatorios/listGrafico"/></main>
    </PermissionGate>
}
