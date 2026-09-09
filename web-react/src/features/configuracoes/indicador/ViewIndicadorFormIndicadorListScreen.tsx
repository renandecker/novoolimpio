import {PermissionGate} from '../../shared/services/permissions';
import {DataTable} from '../../shared/components/DataTable';

export default function ViewIndicadorFormIndicadorListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Form Indicador</h1><DataTable path="/api/view/indicador/formIndicador"/></main>
    </PermissionGate>
}
