import {PermissionGate} from '../../shared/services/permissions';
import {DataTable} from '../../shared/components/DataTable';

export default function ViewMensagemNapFormMensagemNapListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Form Mensagem Nap</h1><DataTable path="/api/view/mensagemNap/formMensagemNap"/></main>
    </PermissionGate>
}
