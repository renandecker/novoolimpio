import {PermissionGate} from '../permissions';
import {DataTable} from '../DataTable';

export default function ViewConfiguracaoListConfiguracaoListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Configuracao</h1><DataTable path="/api/view/configuracao/listConfiguracao"/></main>
    </PermissionGate>
}