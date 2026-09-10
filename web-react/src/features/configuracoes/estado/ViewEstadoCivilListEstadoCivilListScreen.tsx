import {PermissionGate} from '../../../shared/services/permissions';
import {DataTable} from '../../../shared/components/DataTable';

export default function ViewEstadoCivilListEstadoCivilListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Estado Civil</h1><DataTable path="/api/view/estadoCivil/listEstadoCivil"/></main>
    </PermissionGate>
}
