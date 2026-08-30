import {PermissionGate} from '../../shared/services/permissions';
import {DataTable} from '../../shared/components/DataTable';

export default function ViewRelatoriosViewGraficoCombinadoListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>View Grafico Combinado</h1><DataTable path="/api/view/relatorios/viewGraficoCombinado"/></main>
    </PermissionGate>
}
