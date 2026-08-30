import {PermissionGate} from '../../shared/services/permissions';
import {DataTable} from '../../shared/components/DataTable';

export default function ViewFavoritoPerfilColunasFavoritoPerfilListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Colunas Favorito Perfil</h1><DataTable path="/api/view/favoritoPerfil/colunasFavoritoPerfil"/></main>
    </PermissionGate>
}
