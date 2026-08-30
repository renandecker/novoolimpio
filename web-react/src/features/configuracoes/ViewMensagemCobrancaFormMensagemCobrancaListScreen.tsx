import {PermissionGate} from '../../shared/services/permissions';
import {DataTable} from '../../shared/components/DataTable';

export default function ViewMensagemCobrancaFormMensagemCobrancaListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Form Mensagem Cobranca</h1><DataTable path="/api/view/mensagemCobranca/formMensagemCobranca"/></main>
    </PermissionGate>
}
