import {PermissionGate} from '../../shared/services/permissions';
import {DataTable} from '../../shared/components/DataTable';

export default function ViewTipoUnidadeListTipoUnidadeListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Tipo Unidade</h1><DataTable path="/api/view/tipoUnidade/listTipoUnidade"/></main>
    </PermissionGate>
}
