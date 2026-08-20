import {PermissionGate} from '../permissions';
import {DataTable} from '../DataTable';

export default function ViewFavoritoPerfilColunasFavoritoPerfilListScreen() {
    return <PermissionGate permission="READ">
        <main><h1>Colunas Favorito Perfil</h1><DataTable path="/api/view/favoritoPerfil/colunasFavoritoPerfil"/></main>
    </PermissionGate>
}