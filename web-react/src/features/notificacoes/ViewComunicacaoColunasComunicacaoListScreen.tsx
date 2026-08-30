import {PermissionGate} from '../permissions';
import {DataTable} from '../DataTable';

export default function ViewComunicacaoColunasComunicacaoListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Colunas Comunicacao</h1><DataTable path="/api/view/comunicacao/colunasComunicacao"/></main>
    </PermissionGate>
}