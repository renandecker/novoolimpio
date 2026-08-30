import {PermissionGate} from '../../shared/services/permissions';
import {DataTable} from '../../shared/components/DataTable';

export default function ViewRelatoriosViewTabelaListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>View Tabela</h1><DataTable path="/api/view/relatorios/viewTabela"/></main>
    </PermissionGate>
}
