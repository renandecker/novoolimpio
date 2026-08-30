import {PermissionGate} from '../../shared/services/permissions';
import {DataTable} from '../../shared/components/DataTable';

export default function ViewComunicacaoListComunicacaoListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Comunicacao</h1><DataTable path="/api/view/comunicacao/listComunicacao"/></main>
    </PermissionGate>
}
