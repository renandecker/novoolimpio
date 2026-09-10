import {PermissionGate} from '../../../shared/services/permissions';
import {DataTable} from '../../../shared/components/DataTable';

export default function ViewContratoSituacaoListContratoSituacaoListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Contrato Situacao</h1><DataTable path="/api/view/contratoSituacao/listContratoSituacao"/></main>
    </PermissionGate>
}
