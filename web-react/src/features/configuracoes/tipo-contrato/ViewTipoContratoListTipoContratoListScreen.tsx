import {PermissionGate} from '../../../shared/services/permissions';
import {DataTable} from '../../../shared/components/DataTable';

export default function ViewTipoContratoListTipoContratoListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Tipo Contrato</h1><DataTable path="/api/view/tipoContrato/listTipoContrato"/></main>
    </PermissionGate>
}
