import {PermissionGate} from '../../shared/services/permissions';
import {DataTable} from '../../shared/components/DataTable';

export default function ViewCompromissoListTipoCompromissoListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Tipo Compromisso</h1><DataTable path="/api/view/compromisso/listTipoCompromisso"/></main>
    </PermissionGate>
}
