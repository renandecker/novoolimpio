import {PermissionGate} from '../permissions';
import {DataTable} from '../DataTable';

export default function ViewMensagemFormMensagemListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Form Mensagem</h1><DataTable path="/api/view/mensagem/formMensagem"/></main>
    </PermissionGate>
}