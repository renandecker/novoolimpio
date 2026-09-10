import {PermissionGate} from '../../../shared/services/permissions';
import {DataTable} from '../../../shared/components/DataTable';

export default function ViewEstadoCivilFormEstadoCivilListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Form Estado Civil</h1><DataTable path="/api/view/estadoCivil/formEstadoCivil"/></main>
    </PermissionGate>
}
