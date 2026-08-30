import {PermissionGate} from '../permissions';
import {DataTable} from '../DataTable';

export default function ViewContratoSituacaoFormContratoSituacaoListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Form Contrato Situacao</h1><DataTable path="/api/view/contratoSituacao/formContratoSituacao"/></main>
    </PermissionGate>
}