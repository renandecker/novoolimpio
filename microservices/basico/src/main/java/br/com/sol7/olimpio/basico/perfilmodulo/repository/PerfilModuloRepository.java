package br.com.sol7.olimpio.basico.perfilmodulo.repository;

import br.com.sol7.olimpio.basico.usuarioperfil.repository.UsuarioPerfilRepository;
import io.quarkus.hibernate.reactive.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;

import java.util.List;

import br.com.sol7.olimpio.basico.perfilmodulo.entity.PerfilModulo;

@ApplicationScoped
public class PerfilModuloRepository implements PanacheRepository<PerfilModulo> {
    public List<PerfilModulo> findByPerfilId(Long perfilId) {
        return list("id_perfil", perfilId).await().indefinitely();
    }

    public List<PerfilModulo> findByModuloId(Long moduloId) {
        return list("id_modulo", moduloId).await().indefinitely();
    }
}