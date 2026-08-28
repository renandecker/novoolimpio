package br.com.sol7.olimpio.central.operacionalusuario;

import io.quarkus.hibernate.reactive.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;
import io.smallrye.mutiny.Uni;

import java.util.List;

@ApplicationScoped
public class OperacionalUsuarioRepository implements PanacheRepository<OperacionalUsuario> {

    public Uni<List<OperacionalUsuario>> findByOperacionalId(Long operacionalId) {
        return find("operacionalId = ?1", operacionalId).list();
    }

    public Uni<OperacionalUsuario> findByOperacionalIdAndUsuarioId(Long operacionalId, Long usuarioId) {
        return find("operacionalId = ?1 and usuarioId = ?2", operacionalId, usuarioId).firstResult();
    }

    public Uni<Void> deleteByOperacionalIdAndUsuarioId(Long operacionalId, Long usuarioId) {
        return delete("operacionalId = ?1 and usuarioId = ?2", operacionalId, usuarioId).replaceWithVoid();
    }

    public Uni<Long> countByOperacionalId(Long operacionalId) {
        return count("operacionalId = ?1", operacionalId);
    }
}