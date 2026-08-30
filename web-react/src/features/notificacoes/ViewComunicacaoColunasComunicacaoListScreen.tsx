import {PermissionGate} from '../../shared/services/permissions';
import {DataTable} from '../../shared/components/DataTable';

export default function ViewComunicacaoColunasComunicacaoListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Colunas Comunicacao</h1><DataTable path="/api/view/comunicacao/colunasComunicacao"/></main>
    </PermissionGate>
}
