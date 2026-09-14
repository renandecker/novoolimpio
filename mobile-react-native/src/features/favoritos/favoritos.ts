import {api} from '../../shared/services/api';

// Espelha br.com.sol7.olimpio.control.controllers.basico.UsuarioLogadoController#listFavoritos:
// combina FavoritoUsuario (favoritos do próprio usuário) + FavoritoPerfil (favoritos do perfil),
// cada um resolvido para {icon, outcome, nome} (classe FavoritosWapper).
export type FavoritoDisponivel = {
    nome: string;
    icon: string;
    outcome: string;
};

export const listarFavoritos = async (): Promise<FavoritoDisponivel[]> =>
    (await api.get<FavoritoDisponivel[]>('/api/basico/usuarioLogado/favoritos')).data;
