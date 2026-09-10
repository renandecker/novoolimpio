import {PermissionGate} from '../../../shared/services/permissions';
import {DataTable} from '../../../shared/components/DataTable';

export default function ViewEscolaridadeFormEscolaridadeListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Form Escolaridade</h1><DataTable path="/api/view/escolaridade/formEscolaridade"/></main>
    </PermissionGate>
}
