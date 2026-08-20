import {PermissionGate} from '../permissions';
import {DataTable} from '../DataTable';

export default function ViewRelatoriosViewTabelaListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>View Tabela</h1><DataTable path="/api/view/relatorios/viewTabela"/></main>
    </PermissionGate>
}