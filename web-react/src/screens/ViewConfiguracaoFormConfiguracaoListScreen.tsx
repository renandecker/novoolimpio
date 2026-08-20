import {PermissionGate} from '../permissions';
import {DataTable} from '../DataTable';

export default function ViewConfiguracaoFormConfiguracaoListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Form Configuracao</h1><DataTable path="/api/view/configuracao/formConfiguracao"/></main>
    </PermissionGate>
}