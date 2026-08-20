import {PermissionGate} from '../permissions';
import {DataTable} from '../DataTable';

export default function ViewBaseTecnologicaFormBaseTecnologicaListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Form Base Tecnologica</h1><DataTable path="/api/view/baseTecnologica/formBaseTecnologica"/></main>
    </PermissionGate>
}