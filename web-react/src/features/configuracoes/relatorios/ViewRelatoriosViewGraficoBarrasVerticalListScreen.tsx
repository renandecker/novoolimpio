import {PermissionGate} from '../../../shared/services/permissions';
import {DataTable} from '../../../shared/components/DataTable';

export default function ViewRelatoriosViewGraficoBarrasVerticalListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>View Grafico Barras Vertical</h1><DataTable path="/api/relatorios/grafico"/>
        </main>
    </PermissionGate>
}
