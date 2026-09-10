import {PermissionGate} from '../../../shared/services/permissions';
import {DataTable} from '../../../shared/components/DataTable';

export default function ViewTipoHistoricoFormTipoHistoricoListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Form Tipo Historico</h1><DataTable path="/api/view/tipoHistorico/formTipoHistorico"/></main>
    </PermissionGate>
}
