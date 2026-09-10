import {PermissionGate} from '../../../shared/services/permissions';
import {DataTable} from '../../../shared/components/DataTable';

export default function ViewRelatoriosViewGraficoCircularListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>View Grafico Circular</h1><DataTable path="/api/relatorios/grafico"/></main>
    </PermissionGate>
}
