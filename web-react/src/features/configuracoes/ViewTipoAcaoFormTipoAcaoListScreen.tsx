import {PermissionGate} from '../../shared/services/permissions';
import {DataTable} from '../../shared/components/DataTable';

export default function ViewTipoAcaoFormTipoAcaoListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Form Tipo Acao</h1><DataTable path="/api/view/tipoAcao/formTipoAcao"/></main>
    </PermissionGate>
}
