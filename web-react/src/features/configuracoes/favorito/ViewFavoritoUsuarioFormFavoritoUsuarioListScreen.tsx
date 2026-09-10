import {PermissionGate} from '../../../shared/services/permissions';
import {DataTable} from '../../../shared/components/DataTable';

export default function ViewFavoritoUsuarioFormFavoritoUsuarioListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Form Favorito Usuario</h1><DataTable path="/api/view/favoritoUsuario/formFavoritoUsuario"/></main>
    </PermissionGate>
}
