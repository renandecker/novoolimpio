import {PermissionGate} from '../../../shared/services/permissions';
import {DataTable} from '../../../shared/components/DataTable';

export default function ViewBaseTecnologicaFormBaseTecnologicaListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Form Base Tecnologica</h1><DataTable path="/api/view/baseTecnologica/formBaseTecnologica"/></main>
    </PermissionGate>
}
