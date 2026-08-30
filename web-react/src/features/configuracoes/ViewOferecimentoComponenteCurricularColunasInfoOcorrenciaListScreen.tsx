import {PermissionGate} from '../../shared/services/permissions';
import {DataTable} from '../../shared/components/DataTable';

export default function ViewOferecimentoComponenteCurricularColunasInfoOcorrenciaListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Colunas Info Ocorrencia</h1><DataTable
            path="/api/view/oferecimentoComponenteCurricular/colunasInfoOcorrencia"/></main>
    </PermissionGate>
}
