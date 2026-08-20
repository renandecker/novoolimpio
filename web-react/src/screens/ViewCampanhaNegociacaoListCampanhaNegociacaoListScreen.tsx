import {PermissionGate} from '../permissions';
import {DataTable} from '../DataTable';

export default function ViewCampanhaNegociacaoListCampanhaNegociacaoListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Campanha Negociacao</h1><DataTable path="/api/view/campanhaNegociacao/listCampanhaNegociacao"/></main>
    </PermissionGate>
}