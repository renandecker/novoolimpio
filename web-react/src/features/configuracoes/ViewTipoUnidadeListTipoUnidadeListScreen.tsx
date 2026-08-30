import {PermissionGate} from '../permissions';
import {DataTable} from '../DataTable';

export default function ViewTipoUnidadeListTipoUnidadeListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Tipo Unidade</h1><DataTable path="/api/view/tipoUnidade/listTipoUnidade"/></main>
    </PermissionGate>
}