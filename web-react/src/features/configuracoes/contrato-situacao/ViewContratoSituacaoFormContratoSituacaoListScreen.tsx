import {PermissionGate} from '../../../shared/services/permissions';
import {DataTable} from '../../../shared/components/DataTable';

export default function ViewContratoSituacaoFormContratoSituacaoListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Form Contrato Situacao</h1><DataTable path="/api/view/contratoSituacao/formContratoSituacao"/></main>
    </PermissionGate>
}
