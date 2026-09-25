package br.com.sol7.olimpio.notificacoes.notificacao.repository;

import br.com.sol7.olimpio.notificacoes.notificacao.entity.UsuarioMobile;
import io.quarkus.hibernate.reactive.panache.PanacheRepository;
import io.smallrye.mutiny.Uni;

import jakarta.enterprise.context.ApplicationScoped;
import java.time.OffsetDateTime;
import java.util.List;

@ApplicationScoped
public class UsuarioMobileRepository implements PanacheRepository<UsuarioMobile> {

    public Uni<List<UsuarioMobile>> findByUsuarioAtivo(Integer idUsuario) {
        return find("idUsuario = ?1 and ativo = true", idUsuario).list();
    }

    public Uni<UsuarioMobile> findByUsuarioAndToken(Integer idUsuario, String token) {
        return find("idUsuario = ?1 and token = ?2", idUsuario, token).firstResult();
    }

    public Uni<Long> countByUsuario(Integer idUsuario) {
        return count("idUsuario = ?1", idUsuario);
    }

    public Uni<Long> deleteByUsuarioAndToken(Integer idUsuario, String token) {
        return delete("idUsuario = ?1 and token = ?2", idUsuario, token);
    }

    public Uni<Long> deleteInativosAntigos(OffsetDateTime cutoff) {
        return delete("ativo = false and updatedAt < ?1", cutoff);
    }
}