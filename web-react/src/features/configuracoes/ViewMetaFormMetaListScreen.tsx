import {PermissionGate} from '../../shared/services/permissions';
import {DataTable} from '../../shared/components/DataTable';

export default function ViewMetaFormMetaListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Form Meta</h1><DataTable path="/api/view/meta/formMeta"/></main>
    </PermissionGate>
}
