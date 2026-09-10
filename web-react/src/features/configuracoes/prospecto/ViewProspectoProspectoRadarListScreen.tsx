import {PermissionGate} from '../../../shared/services/permissions';
import {DataTable} from '../../../shared/components/DataTable';

export default function ViewProspectoProspectoRadarListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Prospecto Radar</h1><DataTable path="/api/view/prospecto/prospectoRadar"/></main>
    </PermissionGate>
}
