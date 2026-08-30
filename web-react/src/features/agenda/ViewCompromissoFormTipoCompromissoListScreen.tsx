import {PermissionGate} from '../../shared/services/permissions';
import {DataTable} from '../../shared/components/DataTable';

export default function ViewCompromissoFormTipoCompromissoListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Form Tipo Compromisso</h1><DataTable path="/api/view/compromisso/formTipoCompromisso"/></main>
    </PermissionGate>
}
