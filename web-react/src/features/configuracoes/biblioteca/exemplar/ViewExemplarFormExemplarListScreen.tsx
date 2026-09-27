import {PermissionGate} from '../../../../shared/services/permissions';
import {DataTable} from '../../../../shared/components/DataTable';

export default function ViewExemplarFormExemplarListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Form Exemplar</h1><DataTable path="/api/biblioteca/exemplar/formExemplar"/></main>
    </PermissionGate>;
}