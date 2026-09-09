import {PermissionGate} from '../../shared/services/permissions';
import {DataTable} from '../../shared/components/DataTable';

export default function ViewRelatoriosViewGraficoLinhasListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>View Grafico Linhas</h1><DataTable path="/api/view/relatorios/viewGraficoLinhas"/></main>
    </PermissionGate>
}
