package br.com.sol7.olimpio.financeiro.impressora;
import java.util.List;
import io.quarkus.hibernate.reactive.panache.PanacheRepository; import jakarta.enterprise.context.ApplicationScoped;
import io.smallrye.mutiny.Uni;
@ApplicationScoped public class ImpressoraRepository implements PanacheRepository<Impressora> {

    // Migrado de ImpressoraRepository.buscarImpressorasUnidade (legado) - HQL original:
    // Select i from Impressora i where i.unidade = ?1 order by i.dataAlteracao desc
    public static final String SQL_BUSCAR_IMPRESSORAS_UNIDADE =
            "SELECT i.* FROM fin_impressora i WHERE i.id_unidade = ?1 ORDER BY i.data_alteracao desc";

    public Uni<java.util.List<Impressora>> buscarImpressorasUnidade(Long unidadeId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_BUSCAR_IMPRESSORAS_UNIDADE, Impressora.class)
                    .setParameter(1, unidadeId)
                    .getResultList());
    }


    // Migrado de ImpressoraRepository.verificarImpressorasComUnidade (legado) - HQL original:
    // Select i from Impressora i where i.unidade = ?1 and i.id <> ?2 order by i.dataAlteracao desc
    public static final String SQL_VERIFICAR_IMPRESSORAS_COM_UNIDADE =
            "SELECT i.* FROM fin_impressora i WHERE i.id_unidade = ?1 and i.id <> ?2 ORDER BY i.data_alteracao desc";

    public Uni<java.util.List<Impressora>> verificarImpressorasComUnidade(Long unidadeId, int id) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_VERIFICAR_IMPRESSORAS_COM_UNIDADE, Impressora.class)
                    .setParameter(1, unidadeId)
                    .setParameter(2, id)
                    .getResultList());
    }

}