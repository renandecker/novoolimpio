package br.com.sol7.olimpio.educacao.grupo;
import java.util.List;
import io.quarkus.hibernate.reactive.panache.PanacheRepository; import jakarta.enterprise.context.ApplicationScoped;
import io.smallrye.mutiny.Uni;
@ApplicationScoped public class GrupoRepository implements PanacheRepository<Grupo> {

    // Migrado de GrupoRepository.listarGrupos (legado) - HQL original:
    // select distinct o from Grupo o where o.curriculo = ?1  and  o.unidade = ?2 order by o.nome
    public static final String SQL_LISTAR_GRUPOS =
            "SELECT DISTINCT o.* FROM edc_grupo o WHERE o.id_curriculo = ?1 and o.id_unidade = ?2 ORDER BY o.nome";

    public Uni<java.util.List<Grupo>> listarGrupos(Long curriculoId, Long unidadeId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_LISTAR_GRUPOS, Grupo.class)
                    .setParameter(1, curriculoId)
                    .setParameter(2, unidadeId)
                    .getResultList());
    }


    // Migrado de GrupoRepository.listarGruposExistente (legado) - HQL original:
    // select distinct o from Grupo o where o.curriculo = ?1  and  o.unidade = ?2 and o.nome = ?3 order by o.nome
    public static final String SQL_LISTAR_GRUPOS_EXISTENTE =
            "SELECT DISTINCT o.* FROM edc_grupo o WHERE o.id_curriculo = ?1 and o.id_unidade = ?2 and o.nome = ?3 ORDER BY o.nome";

    public Uni<java.util.List<Grupo>> listarGruposExistente(Long curriculoId, Long unidadeId, String nome) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_LISTAR_GRUPOS_EXISTENTE, Grupo.class)
                    .setParameter(1, curriculoId)
                    .setParameter(2, unidadeId)
                    .setParameter(3, nome)
                    .getResultList());
    }


    // Migrado de GrupoRepository.listarOferecimentos (legado) - HQL original:
    // select o from OferecimentoComponenteCurricular o where o.grupo = ?1  order by o.dataInicio desc
    public static final String SQL_LISTAR_OFERECIMENTOS =
            "SELECT o.* FROM edc_oferecimento_componente_curricular o WHERE o.id_grupo = ?1 ORDER BY o.data_inicio desc";

    // Atencao: a query original seleciona 'OferecimentoComponenteCurricular', nao 'Grupo'.
    // Se 'OferecimentoComponenteCurricular' existir como entidade neste microsservico, troque Object por OferecimentoComponenteCurricular.class abaixo.
    public Uni<java.util.List<Object>> listarOferecimentos(Long grupoId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_LISTAR_OFERECIMENTOS)
                    .setParameter(1, grupoId)
                    .getResultList());
    }


    // Migrado de GrupoRepository.autoComplete (legado) - HQL original:
    // select c from Grupo c where lower(c.nome) like '%' || ?1 || '%'  OR str(c.id) = ?1 order by c.nome
    public static final String SQL_AUTO_COMPLETE =
            "SELECT c.* FROM edc_grupo c WHERE lower(c.nome) like '%' || ?1 || '%' OR CAST(c.id AS text) = ?1 ORDER BY c.nome";

    public Uni<java.util.List<Grupo>> autoComplete(String lowerCase) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_AUTO_COMPLETE, Grupo.class)
                    .setParameter(1, lowerCase)
                    .getResultList());
    }


    // Migrado de GrupoRepository.autoCompleteComUnidades (legado) - HQL original:
    // select c from Grupo c where (lower(c.nome) like '%' || ?1 || '%'  OR str(c.id) = ?1) and c.unidade in (?2) order by c.nome
    public static final String SQL_AUTO_COMPLETE_COM_UNIDADES =
            "SELECT c.* FROM edc_grupo c WHERE (lower(c.nome) like '%' || ?1 || '%' OR CAST(c.id AS text) = ?1) and c.id_unidade in (?2) ORDER BY c.nome";

    public Uni<java.util.List<Grupo>> autoCompleteComUnidades(String lowerCase, List<Long> unidadeIds) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_AUTO_COMPLETE_COM_UNIDADES, Grupo.class)
                    .setParameter(1, lowerCase)
                    .setParameter(2, unidadeIds)
                    .getResultList());
    }


    // Migrado de GrupoRepository.unidadesGrupo (legado) - HQL original:
    // select c from Grupo c where c.unidade in (?1) order by c.nome
    public static final String SQL_UNIDADES_GRUPO =
            "SELECT c.* FROM edc_grupo c WHERE c.id_unidade in (?1) ORDER BY c.nome LIMIT 10";

    public Uni<java.util.List<Grupo>> unidadesGrupo(List<Long> unidadeIds) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_UNIDADES_GRUPO, Grupo.class)
                    .setParameter(1, unidadeIds)
                    .getResultList());
    }


    // Migrado de GrupoRepository.autoCompleteComCurriculo (legado) - HQL original:
    // select c from Grupo c where (lower(c.nome) like '%' || ?1 || '%'  OR str(c.id) = ?1) and c.curriculo = ?2 order by c.nome
    public static final String SQL_AUTO_COMPLETE_COM_CURRICULO =
            "SELECT c.* FROM edc_grupo c WHERE (lower(c.nome) like '%' || ?1 || '%' OR CAST(c.id AS text) = ?1) and c.id_curriculo = ?2 ORDER BY c.nome";

    public Uni<java.util.List<Grupo>> autoCompleteComCurriculo(String lowerCase, Long curriculoId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_AUTO_COMPLETE_COM_CURRICULO, Grupo.class)
                    .setParameter(1, lowerCase)
                    .setParameter(2, curriculoId)
                    .getResultList());
    }


    // Migrado de GrupoRepository.grupoCurriculo (legado) - HQL original:
    // select c from Grupo c where c.curriculo = ?1 order by c.nome
    public static final String SQL_GRUPO_CURRICULO =
            "SELECT c.* FROM edc_grupo c WHERE c.id_curriculo = ?1 ORDER BY c.nome LIMIT 10";

    public Uni<java.util.List<Grupo>> grupoCurriculo(Long curriculoId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_GRUPO_CURRICULO, Grupo.class)
                    .setParameter(1, curriculoId)
                    .getResultList());
    }

}