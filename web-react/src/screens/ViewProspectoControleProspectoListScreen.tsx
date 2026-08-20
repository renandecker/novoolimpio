import {PermissionGate} from '../permissions';
import {DataTable} from '../DataTable';

export default function ViewProspectoControleProspectoListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Controle Prospecto</h1><DataTable path="/api/view/prospecto/controleProspecto"/></main>
    </PermissionGate>
}