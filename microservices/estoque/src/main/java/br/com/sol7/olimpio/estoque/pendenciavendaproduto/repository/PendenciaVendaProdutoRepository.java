package br.com.sol7.olimpio.estoque.pendenciavendaproduto;

import io.quarkus.hibernate.reactive.panache.PanacheRepository;
import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import java.util.List;

@ApplicationScoped
public class PendenciaVendaProdutoRepository implements PanacheRepository<PendenciaVendaProduto> {

    // Migrado de PendenciaVendaProdutoRepository.buscaPendencias (legado):
    // Select c from PendenciaVendaProduto c inner join c.vendaProduto v where v.unidade = ?1 and c.dataEntrega is not null
    public static final String SQL_BUSCA_PENDENCIAS =
            "SELECT c.* FROM est_pendencia_venda_produto c " +
            "INNER JOIN fin_venda_produto v ON v.id = c.id_venda " +
            "WHERE v.id_unidade = ?1 AND c.dt_entrega IS NOT NULL";

    public Uni<List<PendenciaVendaProduto>> buscaPendencias(Long unidadeId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_BUSCA_PENDENCIAS, PendenciaVendaProduto.class)
                        .setParameter(1, unidadeId).getResultList());
    }

    // Todas as pendencias (entregues ou nao) da unidade, via venda
    public static final String SQL_LISTAR_POR_UNIDADE =
            "SELECT c.* FROM est_pendencia_venda_produto c " +
            "INNER JOIN fin_venda_produto v ON v.id = c.id_venda " +
            "WHERE v.id_unidade = ?1 ORDER BY c.dt_entrega ASC NULLS FIRST";

    public Uni<List<PendenciaVendaProduto>> listarPorUnidade(Long unidadeId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_LISTAR_POR_UNIDADE, PendenciaVendaProduto.class)
                        .setParameter(1, unidadeId).getResultList());
    }
}
