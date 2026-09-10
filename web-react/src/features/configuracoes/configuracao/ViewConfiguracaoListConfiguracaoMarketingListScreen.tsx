import {PermissionGate} from '../../../shared/services/permissions';
import {DataTable} from '../../../shared/components/DataTable';

export default function ViewConfiguracaoListConfiguracaoMarketingListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Configuracao Marketing</h1><DataTable path="/api/view/configuracao/listConfiguracaoMarketing"/></main>
    </PermissionGate>
}
