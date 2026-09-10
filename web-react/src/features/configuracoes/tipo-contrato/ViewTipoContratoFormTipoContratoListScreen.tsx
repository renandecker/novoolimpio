import {PermissionGate} from '../../../shared/services/permissions';
import {DataTable} from '../../../shared/components/DataTable';

export default function ViewTipoContratoFormTipoContratoListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Form Tipo Contrato</h1><DataTable path="/api/view/tipoContrato/formTipoContrato"/></main>
    </PermissionGate>
}
