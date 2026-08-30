import {PermissionGate} from '../../shared/services/permissions';
import {DataTable} from '../../shared/components/DataTable';

export default function ViewFiltrosListFiltrosListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Filtros</h1><DataTable path="/api/view/filtros/listFiltros"/></main>
    </PermissionGate>
}
