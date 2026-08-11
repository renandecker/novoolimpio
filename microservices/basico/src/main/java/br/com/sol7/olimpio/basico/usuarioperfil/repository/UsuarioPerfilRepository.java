package br.com.sol7.olimpio.basico.usuarioperfil.repository;

import br.com.sol7.olimpio.basico.usuarioperfil.entity.UsuarioPerfil;
import io.quarkus.hibernate.reactive.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;
import java.util.List;

@ApplicationScoped
public class UsuarioPerfilRepository implements PanacheRepository<UsuarioPerfil> {
    public List<UsuarioPerfil> findByUsuarioId(Long usuarioId) {
        return list("usuarioId", usuarioId).await().indefinitely();
    }
    public List<UsuarioPerfil> findByPerfilId(Long perfilId) {
        return list("perfilId", perfilId).await().indefinitely();
    }
}
