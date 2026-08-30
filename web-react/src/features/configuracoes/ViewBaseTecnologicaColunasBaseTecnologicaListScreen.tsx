import {PermissionGate} from '../../shared/services/permissions';
import {DataTable} from '../../shared/components/DataTable';

export default function ViewBaseTecnologicaColunasBaseTecnologicaListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Colunas Base Tecnologica</h1><DataTable path="/api/view/baseTecnologica/colunasBaseTecnologica"/>
        </main>
    </PermissionGate>
}
