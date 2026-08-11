package br.com.sol7.olimpio.educacao.grau;
import java.util.List;
import io.quarkus.hibernate.reactive.panache.PanacheRepository; import jakarta.enterprise.context.ApplicationScoped;
import io.smallrye.mutiny.Uni;
@ApplicationScoped public class GrauRepository implements PanacheRepository<Grau> {

    // Migrado de GrauRepository.buscarGrauComNota (legado) - HQL original:
    // select g from Grau g left join fetch g.grauNota n where g = ?1 order by n.numeroNota
    public static final String SQL_BUSCAR_GRAU_COM_NOTA =
            "SELECT g.* FROM edc_grau g LEFT JOIN edc_grau_nota n ON n.id_grau = g.id WHERE g.id = ?1 ORDER BY n.numero_nota";

    public Uni<java.util.List<Grau>> buscarGrauComNota(Long grauId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_BUSCAR_GRAU_COM_NOTA, Grau.class)
                    .setParameter(1, grauId)
                    .getResultList());
    }


    // Migrado de GrauRepository.buscarGrauComConceito (legado) - HQL original:
    // select g from Grau g left join fetch g.grauConceito c where g = ?1 order by c.ordem
    public static final String SQL_BUSCAR_GRAU_COM_CONCEITO =
            "SELECT g.* FROM edc_grau g LEFT JOIN edc_grau_conceito c ON c.id_grau = g.id WHERE g.id = ?1 ORDER BY c.ordem";

    public Uni<java.util.List<Grau>> buscarGrauComConceito(Long grauId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_BUSCAR_GRAU_COM_CONCEITO, Grau.class)
                    .setParameter(1, grauId)
                    .getResultList());
    }

}