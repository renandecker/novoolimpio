import {PermissionGate} from '../../shared/services/permissions';
import {DataTable} from '../../shared/components/DataTable';

export default function ViewTipoAtividadeFormTipoAtividadeListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Form Tipo Atividade</h1><DataTable path="/api/view/tipoAtividade/formTipoAtividade"/></main>
    </PermissionGate>
}
