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

    // Select distinct m from OperacionalUsuario m where m.operacional <> ?1 and m.operador = ?2 and m.status <> 'CONCLUIDO' and m.status <> 'EXPIRADO'
    public static final String SQL_BUSCAR_PACOTES_DISPONIVEIS =
            "SELECT DISTINCT ou.* FROM cen_operacional_usuario ou "
            + "WHERE ou.id_operacional <> ?1 AND ou.id_usuario = ?2 "
            + "AND ou.status <> 'CONCLUIDO' AND ou.status <> 'EXPIRADO'";

    public Uni<List<OperacionalUsuario>> buscarPacotesDisponiveis(Long operacionalId, Long usuarioId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_BUSCAR_PACOTES_DISPONIVEIS, OperacionalUsuario.class)
                        .setParameter(1, operacionalId)
                        .setParameter(2, usuarioId)
                        .getResultList());
    }
}