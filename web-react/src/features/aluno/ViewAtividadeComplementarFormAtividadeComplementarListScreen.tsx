import {PermissionGate} from '../../shared/services/permissions';
import {DataTable} from '../../shared/components/DataTable';

export default function ViewAtividadeComplementarFormAtividadeComplementarListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Form Atividade Complementar</h1><DataTable
            path="/api/view/atividadeComplementar/formAtividadeComplementar"/></main>
    </PermissionGate>
}
