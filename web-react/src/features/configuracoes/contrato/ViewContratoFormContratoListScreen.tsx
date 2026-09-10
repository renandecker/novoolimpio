import {PermissionGate} from '../../../shared/services/permissions';
import {DataTable} from '../../../shared/components/DataTable';

export default function ViewContratoFormContratoListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Form Contrato</h1><DataTable path="/api/view/contrato/formContrato"/></main>
    </PermissionGate>
}
