import {PermissionGate} from '../../shared/services/permissions';
import {DataTable} from '../../shared/components/DataTable';

export default function ViewComunicacaoListComunicacaoMensagemListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Comunicacao Mensagem</h1><DataTable path="/api/view/comunicacao/listComunicacaoMensagem"/></main>
    </PermissionGate>
}
