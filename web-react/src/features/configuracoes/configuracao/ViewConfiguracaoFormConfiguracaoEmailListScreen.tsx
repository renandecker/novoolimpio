import {PermissionGate} from '../../../shared/services/permissions';
import {DataTable} from '../../../shared/components/DataTable';

export default function ViewConfiguracaoFormConfiguracaoEmailListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Form Configuracao Email</h1><DataTable path="/api/view/configuracao/formConfiguracaoEmail"/></main>
    </PermissionGate>
}
