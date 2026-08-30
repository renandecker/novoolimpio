import {PermissionGate} from '../../shared/services/permissions';
import {DataTable} from '../../shared/components/DataTable';

export default function ViewRelatoriosColunasMapaListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Colunas Mapa</h1><DataTable path="/api/view/relatorios/colunasMapa"/></main>
    </PermissionGate>
}
