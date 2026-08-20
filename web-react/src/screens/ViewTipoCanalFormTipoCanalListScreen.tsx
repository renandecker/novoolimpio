import {PermissionGate} from '../permissions';
import {DataTable} from '../DataTable';

export default function ViewTipoCanalFormTipoCanalListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Form Tipo Canal</h1><DataTable path="/api/view/tipoCanal/formTipoCanal"/></main>
    </PermissionGate>
}