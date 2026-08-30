import {PermissionGate} from '../../shared/services/permissions';
import {DataTable} from '../../shared/components/DataTable';

export default function ViewOferecimentoComponenteCurricularColunasOferecimentoListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Colunas Oferecimento</h1><DataTable
            path="/api/view/oferecimentoComponenteCurricular/colunasOferecimento"/></main>
    </PermissionGate>
}
