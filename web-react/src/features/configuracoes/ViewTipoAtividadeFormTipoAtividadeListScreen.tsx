import {PermissionGate} from '../permissions';
import {DataTable} from '../DataTable';

export default function ViewTipoAtividadeFormTipoAtividadeListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Form Tipo Atividade</h1><DataTable path="/api/view/tipoAtividade/formTipoAtividade"/></main>
    </PermissionGate>
}