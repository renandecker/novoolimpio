import {PermissionGate} from '../../shared/services/permissions';
import {DataTable} from '../../shared/components/DataTable';

export default function ViewFavoritoPerfilFormFavoritoPerfilListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Form Favorito Perfil</h1><DataTable path="/api/view/favoritoPerfil/formFavoritoPerfil"/></main>
    </PermissionGate>
}
