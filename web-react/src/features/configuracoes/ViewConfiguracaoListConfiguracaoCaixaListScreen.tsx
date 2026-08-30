import {PermissionGate} from '../../shared/services/permissions';
import {DataTable} from '../../shared/components/DataTable';

export default function ViewConfiguracaoListConfiguracaoCaixaListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Configuracao Caixa</h1><DataTable path="/api/view/configuracao/listConfiguracaoCaixa"/></main>
    </PermissionGate>
}
