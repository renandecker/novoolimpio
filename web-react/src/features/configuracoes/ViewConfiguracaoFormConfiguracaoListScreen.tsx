import {PermissionGate} from '../../shared/services/permissions';
import {DataTable} from '../../shared/components/DataTable';

export default function ViewConfiguracaoFormConfiguracaoListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Form Configuracao</h1><DataTable path="/api/view/configuracao/formConfiguracao"/></main>
    </PermissionGate>
}
