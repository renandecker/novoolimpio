import {PermissionGate} from '../../shared/services/permissions';
import {DataTable} from '../../shared/components/DataTable';

export default function ViewRelatoriosColunasGraficoListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Colunas Grafico</h1><DataTable path="/api/view/relatorios/colunasGrafico"/></main>
    </PermissionGate>
}
