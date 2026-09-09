import {PermissionGate} from '../../shared/services/permissions';
import {DataTable} from '../../shared/components/DataTable';

export default function ViewMetaListMetaDinamicaListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Meta</h1><DataTable path="/api/view/meta/listMeta"/></main>
    </PermissionGate>;
}
