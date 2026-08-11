package br.com.sol7.olimpio.educacao.sala;
import java.util.List;
import io.quarkus.hibernate.reactive.panache.PanacheRepository; import jakarta.enterprise.context.ApplicationScoped;
import io.smallrye.mutiny.Uni;
@ApplicationScoped public class SalaRepository implements PanacheRepository<Sala> {

    // Migrado de SalaRepository.buscarSalasDaUnidade (legado) - HQL original:
    // Select c from Sala c where c.unidade = ?1 order by c.sucinto
    public static final String SQL_BUSCAR_SALAS_DA_UNIDADE =
            "SELECT c.* FROM edc_sala c WHERE c.id_unidade = ?1 ORDER BY c.sucinto";

    public Uni<java.util.List<Sala>> buscarSalasDaUnidade(Long unidadeId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_BUSCAR_SALAS_DA_UNIDADE, Sala.class)
                    .setParameter(1, unidadeId)
                    .getResultList());
    }

}