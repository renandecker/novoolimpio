import {PermissionGate} from '../../shared/services/permissions';
import {DataTable} from '../../shared/components/DataTable';

export default function ViewCampanhaListCampanhaListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Campanha</h1><DataTable path="/api/view/campanha/listCampanha"/></main>
    </PermissionGate>;
}