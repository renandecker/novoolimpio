import {PermissionGate} from '../../shared/services/permissions';
import {DataTable} from '../../shared/components/DataTable';

export default function ViewRelatoriosViewGraficoBarrasHorizontalListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>View Grafico Barras Horizontal</h1><DataTable
            path="/api/view/relatorios/viewGraficoBarrasHorizontal"/></main>
    </PermissionGate>
}
