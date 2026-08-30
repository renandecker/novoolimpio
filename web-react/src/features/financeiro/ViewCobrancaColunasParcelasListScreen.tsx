import {PermissionGate} from '../../shared/services/permissions';
import {DataTable} from '../../shared/components/DataTable';

export default function ViewCobrancaColunasParcelasListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Colunas Parcelas</h1><DataTable path="/api/view/cobranca/colunasParcelas"/></main>
    </PermissionGate>
}
