import {PermissionGate} from '../permissions';
import {DataTable} from '../DataTable';

export default function ViewBaseTecnologicaColunasBaseTecnologicaListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Colunas Base Tecnologica</h1><DataTable path="/api/view/baseTecnologica/colunasBaseTecnologica"/>
        </main>
    </PermissionGate>
}