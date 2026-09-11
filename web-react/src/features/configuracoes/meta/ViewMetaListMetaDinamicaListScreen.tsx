import {PermissionGate} from '../../../shared/services/permissions';
import {DataTable} from '../../../shared/components/DataTable';

export default function ViewMetaListMetaDinamicaListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Meta Dinâmica</h1><DataTable path="/api/view/meta/listMetaDinamica" createNavigateTo="/view/meta/formMetaDinamica"/></main>
    </PermissionGate>;
}
