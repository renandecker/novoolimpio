import {PermissionGate} from '../../shared/services/permissions';
import {DataTable} from '../../shared/components/DataTable';

export default function ViewOferecimentoComponenteCurricularColunasDiaAulaListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Colunas Dia Aula</h1><DataTable path="/api/view/oferecimentoComponenteCurricular/colunasDiaAula"/>
        </main>
    </PermissionGate>
}
