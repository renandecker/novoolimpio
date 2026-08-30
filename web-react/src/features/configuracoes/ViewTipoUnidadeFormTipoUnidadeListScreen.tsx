import {PermissionGate} from '../permissions';
import {DataTable} from '../DataTable';

export default function ViewTipoUnidadeFormTipoUnidadeListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Form Tipo Unidade</h1><DataTable path="/api/view/tipoUnidade/formTipoUnidade"/></main>
    </PermissionGate>
}