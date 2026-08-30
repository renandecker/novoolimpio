import {PermissionGate} from '../../shared/services/permissions';
import {DataTable} from '../../shared/components/DataTable';

export default function ViewRelatoriosColunasOrganogramaListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Colunas Organograma</h1><DataTable path="/api/view/relatorios/colunasOrganograma"/></main>
    </PermissionGate>
}
