import {PermissionGate} from '../permissions';
import {DataTable} from '../DataTable';

export default function ViewTipoAcaoFormTipoAcaoListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Form Tipo Acao</h1><DataTable path="/api/view/tipoAcao/formTipoAcao"/></main>
    </PermissionGate>
}