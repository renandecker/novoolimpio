import {PermissionGate} from '../../shared/services/permissions';
import {DataTable} from '../../shared/components/DataTable';

export default function ViewBaseTecnologicaListBaseTecnologicaListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Base Tecnologica</h1><DataTable path="/api/view/baseTecnologica/listBaseTecnologica"/></main>
    </PermissionGate>
}
