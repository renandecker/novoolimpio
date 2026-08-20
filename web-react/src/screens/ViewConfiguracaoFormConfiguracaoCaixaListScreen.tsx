import {PermissionGate} from '../permissions';
import {DataTable} from '../DataTable';

export default function ViewConfiguracaoFormConfiguracaoCaixaListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Form Configuracao Caixa</h1><DataTable path="/api/view/configuracao/formConfiguracaoCaixa"/></main>
    </PermissionGate>
}