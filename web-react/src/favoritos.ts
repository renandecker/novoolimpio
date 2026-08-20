import {api} from './api';
import type {PagedResponse} from './types';

// Espelha br.com.sol7.olimpio.control.controllers.basico.UsuarioLogadoController#listFavoritos:
// combina FavoritoUsuario (favoritos do próprio usuário) + FavoritoPerfil (favoritos do perfil),
// cada um resolvido para {icon, outcome, nome} (classe FavoritosWapper).
export type FavoritoDisponivel = {
    nome: string;
    icon: string;
    outcome: string;
};

export const listarFavoritos = async (page = 0, size = 10, busca?: string): Promise<PagedResponse<FavoritoDisponivel>> =>
    (await api.get<PagedResponse<FavoritoDisponivel>>('/api/basico/usuario-logado/favoritos', {
        params: {
            page,
            size, ...(busca ? {busca} : {})
        }
    })).data;
