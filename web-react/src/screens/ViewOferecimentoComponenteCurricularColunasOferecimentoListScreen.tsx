import {PermissionGate} from '../permissions';
import {DataTable} from '../DataTable';

export default function ViewOferecimentoComponenteCurricularColunasOferecimentoListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Colunas Oferecimento</h1><DataTable
            path="/api/view/oferecimentoComponenteCurricular/colunasOferecimento"/></main>
    </PermissionGate>
}