import {PermissionGate} from '../../shared/services/permissions';
import {DataTable} from '../../shared/components/DataTable';

export default function ViewComunicacaoColunasComunicacaoMensagemListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Colunas Comunicacao Mensagem</h1><DataTable path="/api/view/comunicacao/colunasComunicacaoMensagem"/>
        </main>
    </PermissionGate>
}
