import {PermissionGate} from '../../../../shared/services/permissions';
import {DataTable} from '../../../../shared/components/DataTable';

export default function ViewLicencaFormLicencaListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Form Licença</h1><DataTable path="/api/biblioteca-virtual/licenca/formLicenca"/></main>
    </PermissionGate>;
}