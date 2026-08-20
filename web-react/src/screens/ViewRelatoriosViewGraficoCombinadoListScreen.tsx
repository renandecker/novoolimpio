import {PermissionGate} from '../permissions';
import {DataTable} from '../DataTable';

export default function ViewRelatoriosViewGraficoCombinadoListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>View Grafico Combinado</h1><DataTable path="/api/view/relatorios/viewGraficoCombinado"/></main>
    </PermissionGate>
}