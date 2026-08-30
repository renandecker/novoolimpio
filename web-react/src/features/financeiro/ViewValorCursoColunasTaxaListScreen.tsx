import {PermissionGate} from '../../shared/services/permissions';
import {DataTable} from '../../shared/components/DataTable';

export default function ViewValorCursoColunasTaxaListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Colunas Taxa</h1><DataTable path="/api/view/valorCurso/colunasTaxa"/></main>
    </PermissionGate>
}
