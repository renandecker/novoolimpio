import {PermissionGate} from '../permissions';
import {DataTable} from '../DataTable';

export default function ViewCampanhaColunasAcaoDeCampanhaListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Colunas Acao De Campanha</h1><DataTable path="/api/view/campanha/colunasAcaoDeCampanha"/></main>
    </PermissionGate>
}