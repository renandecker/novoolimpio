import {PermissionGate} from '../../../../../shared/services/permissions';
import {DataTable} from '../../../../../shared/components/DataTable';

export default function ViewProvedorFormProvedorListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Form Provedor</h1><DataTable path="/api/biblioteca-virtual/provedor/formProvedor"/></main>
    </PermissionGate>;
}