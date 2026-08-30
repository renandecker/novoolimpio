import {PermissionGate} from '../../shared/services/permissions';
import {DataTable} from '../../shared/components/DataTable';

export default function ViewConfiguracaoColunasMarketingCampoListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Colunas Marketing Campo</h1><DataTable path="/api/view/configuracao/colunasMarketingCampo"/></main>
    </PermissionGate>
}
