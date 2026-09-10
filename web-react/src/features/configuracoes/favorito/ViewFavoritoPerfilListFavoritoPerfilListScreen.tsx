import {PermissionGate} from '../../../shared/services/permissions';
import {DataTable} from '../../../shared/components/DataTable';

export default function ViewFavoritoPerfilListFavoritoPerfilListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Favorito Perfil</h1><DataTable path="/api/view/favoritoPerfil/listFavoritoPerfil"/></main>
    </PermissionGate>
}
