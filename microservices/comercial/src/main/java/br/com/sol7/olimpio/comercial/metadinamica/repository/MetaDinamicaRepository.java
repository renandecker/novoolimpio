package br.com.sol7.olimpio.comercial.metadinamica;
import java.util.List;
import io.quarkus.hibernate.reactive.panache.PanacheRepository; import jakarta.enterprise.context.ApplicationScoped;
import io.smallrye.mutiny.Uni;
@ApplicationScoped public class MetaDinamicaRepository implements PanacheRepository<MetaDinamica> {

    // Migrado de MetaDinamicaRepository.verificarMetaAnoMesUnidade (legado) - HQL original:
    // select m from MetaDinamica m where m.mes = ?1 and m.ano = ?2 and m.indicador = ?3 and m.unidade = ?4
    public static final String SQL_VERIFICAR_META_ANO_MES_UNIDADE =
            "SELECT m.* FROM com_meta_dinamica m WHERE m.mes = ?1 and m.ano = ?2 and m.id_indicador = ?3 and m.id_unidade = ?4";

    public Uni<java.util.List<MetaDinamica>> verificarMetaAnoMesUnidade(Integer mes, Integer ano, Long indicadorId, Long unidadeId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_VERIFICAR_META_ANO_MES_UNIDADE, MetaDinamica.class)
                    .setParameter(1, mes)
                    .setParameter(2, ano)
                    .setParameter(3, indicadorId)
                    .setParameter(4, unidadeId)
                    .getResultList());
    }


    // Migrado de MetaDinamicaRepository.verificarMetaAnoUnidade (legado) - HQL original:
    // select m from MetaDinamica m where m.ano = ?1 and m.indicador = ?2 and m.unidade = ?3
    public static final String SQL_VERIFICAR_META_ANO_UNIDADE =
            "SELECT m.* FROM com_meta_dinamica m WHERE m.ano = ?1 and m.id_indicador = ?2 and m.id_unidade = ?3";

    public Uni<java.util.List<MetaDinamica>> verificarMetaAnoUnidade(Integer ano, Long indicadorId, Long unidadeId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_VERIFICAR_META_ANO_UNIDADE, MetaDinamica.class)
                    .setParameter(1, ano)
                    .setParameter(2, indicadorId)
                    .setParameter(3, unidadeId)
                    .getResultList());
    }


    // Migrado de MetaDinamicaRepository.verificarMetaUnidade (legado) - HQL original:
    // select m from MetaDinamica m where m.indicador = ?2 and m.unidade = ?3
    public static final String SQL_VERIFICAR_META_UNIDADE =
            "SELECT m.* FROM com_meta_dinamica m WHERE m.id_indicador = ?2 and m.id_unidade = ?3";

    public Uni<java.util.List<MetaDinamica>> verificarMetaUnidade(Long indicadorId, Long unidadeId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_VERIFICAR_META_UNIDADE, MetaDinamica.class)
                    .setParameter(1, indicadorId)
                    .setParameter(2, unidadeId)
                    .getResultList());
    }


    // Migrado de MetaDinamicaRepository.getMetaDinamicasByIndicador (legado) - HQL original:
    // select m from MetaDinamica m where m.indicador = ?1 order by m.id desc
    public static final String SQL_GET_META_DINAMICAS_BY_INDICADOR =
            "SELECT m.* FROM com_meta_dinamica m WHERE m.id_indicador = ?1 ORDER BY m.id desc";

    public Uni<java.util.List<MetaDinamica>> getMetaDinamicasByIndicador(Long indicadorId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_GET_META_DINAMICAS_BY_INDICADOR, MetaDinamica.class)
                    .setParameter(1, indicadorId)
                    .getResultList());
    }

}