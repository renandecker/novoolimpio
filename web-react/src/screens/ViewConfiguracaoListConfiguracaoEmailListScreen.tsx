import {PermissionGate} from '../permissions';
import {DataTable} from '../DataTable';

export default function ViewConfiguracaoListConfiguracaoEmailListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Configuracao Email</h1><DataTable path="/api/view/configuracao/listConfiguracaoEmail"/></main>
    </PermissionGate>
}