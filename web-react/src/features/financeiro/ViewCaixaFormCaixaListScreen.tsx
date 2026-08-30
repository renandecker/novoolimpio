import {PermissionGate} from '../../shared/services/permissions';
import {DataTable} from '../../shared/components/DataTable';

export default function ViewCaixaFormCaixaListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Form Caixa</h1><DataTable path="/api/view/caixa/formCaixa"/></main>
    </PermissionGate>
}
