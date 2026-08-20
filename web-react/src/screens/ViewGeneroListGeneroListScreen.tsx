import {PermissionGate} from '../permissions';
import {DataTable} from '../DataTable';

export default function ViewGeneroListGeneroListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Genero</h1><DataTable path="/api/view/genero/listGenero"/></main>
    </PermissionGate>
}
