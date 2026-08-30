import {PermissionGate} from '../../shared/services/permissions';
import {DataTable} from '../../shared/components/DataTable';

export default function ViewRelatoriosColunasTabelaListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Colunas Tabela</h1><DataTable path="/api/view/relatorios/colunasTabela"/></main>
    </PermissionGate>
}
