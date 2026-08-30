import {PermissionGate} from '../permissions';
import {DataTable} from '../DataTable';

export default function ViewAtividadeComplementarFormAtividadeComplementarListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Form Atividade Complementar</h1><DataTable
            path="/api/view/atividadeComplementar/formAtividadeComplementar"/></main>
    </PermissionGate>
}