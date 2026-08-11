package br.com.sol7.olimpio.educacao.tipocurso;
import java.util.List;
import io.quarkus.hibernate.reactive.panache.PanacheRepository; import jakarta.enterprise.context.ApplicationScoped;
import io.smallrye.mutiny.Uni;
@ApplicationScoped public class TipoCursoRepository implements PanacheRepository<TipoCurso> {

    // Migrado de TipoCursoRepository.autoComplete (legado) - HQL original:
    // select u from TipoCurso u where lower(u.descricao) like '%' || ?1 || '%'  OR str(u.id) = ?1 order by u.descricao
    public static final String SQL_AUTO_COMPLETE =
            "SELECT u.* FROM edc_tipo_curso u WHERE lower(u.descricao) like '%' || ?1 || '%' OR CAST(u.id AS text) = ?1 ORDER BY u.descricao";

    public Uni<java.util.List<TipoCurso>> autoComplete(String query) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_AUTO_COMPLETE, TipoCurso.class)
                    .setParameter(1, query)
                    .getResultList());
    }

}