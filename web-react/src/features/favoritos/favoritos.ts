import {api} from '../../shared/services/api';
import type {PagedResponse} from '../../shared/types/types';

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

export const removerFavorito = async (outcome: string): Promise<void> => {
    await api.delete('/api/basico/favorito-usuario', {params: {outcome}});
};
