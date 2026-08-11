package br.com.sol7.olimpio.educacao.curso;
import java.util.List;
import io.quarkus.hibernate.reactive.panache.PanacheRepository; import jakarta.enterprise.context.ApplicationScoped;
import io.smallrye.mutiny.Uni;
@ApplicationScoped public class CursoRepository implements PanacheRepository<Curso> {

    // Migrado de CursoRepository.autoComplete (legado) - HQL original:
    // select c from Curso c where lower(c.nome) like '%' || ?1 || '%'  OR str(c.id) = ?1 order by c.nome
    public static final String SQL_AUTO_COMPLETE =
            "SELECT c.* FROM edc_curso c WHERE lower(c.nome) like '%' || ?1 || '%' OR CAST(c.id AS text) = ?1 ORDER BY c.nome";

    public Uni<java.util.List<Curso>> autoComplete(String lowerCase) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_AUTO_COMPLETE, Curso.class)
                    .setParameter(1, lowerCase)
                    .getResultList());
    }


    // Migrado de CursoRepository.compararNome (legado) - HQL original:
    // select c from Curso c where lower(c.nome) like ?1 order by c.nome
    public static final String SQL_COMPARAR_NOME =
            "SELECT c.* FROM edc_curso c WHERE lower(c.nome) like ?1 ORDER BY c.nome";

    public Uni<java.util.List<Curso>> compararNome(String lowerCase) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_COMPARAR_NOME, Curso.class)
                    .setParameter(1, lowerCase)
                    .getResultList());
    }

}