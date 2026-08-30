import {PermissionGate} from '../../shared/services/permissions';
import {DataTable} from '../../shared/components/DataTable';

export default function ViewValorCursoColunasRetencoesListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Colunas Retencoes</h1><DataTable path="/api/view/valorCurso/colunasRetencoes"/></main>
    </PermissionGate>
}
