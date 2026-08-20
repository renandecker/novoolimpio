package br.com.sol7.olimpio.estoque.controleepedidos;

import io.quarkus.hibernate.reactive.panache.PanacheRepository;
import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;

import java.util.Date;
import java.util.List;

@ApplicationScoped
public class ControlePedidosRepository implements PanacheRepository<ControlePedidos> {

    // Migrado de ControlePedidosRepository.listarPedidos (legado) - pedidos da unidade no periodo
    public static final String SQL_LISTAR_PEDIDOS =
            "SELECT c.* FROM est_controle_pedidos c JOIN est_solicitacao_estoque s ON s.id = c.id_solicitacao_estoque " +
                    "WHERE s.id_unidade = ?1 AND s.dt_solicitacao BETWEEN ?2 AND ?3 AND s.ativo = false";

    public Uni<List<ControlePedidos>> listarPedidos(Long unidadeId, Date inicio, Date fim) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_LISTAR_PEDIDOS, ControlePedidos.class)
                        .setParameter(1, unidadeId).setParameter(2, inicio).setParameter(3, fim).getResultList());
    }

    // Migrado de ControlePedidosRepository.listarPedidosSemEntrega (legado)
    public static final String SQL_LISTAR_PEDIDOS_SEM_ENTREGA =
            "SELECT c.* FROM est_controle_pedidos c JOIN est_solicitacao_estoque s ON s.id = c.id_solicitacao_estoque " +
                    "WHERE s.id_unidade = ?1 AND s.ativo = false AND c.dt_previsao IS NULL AND c.fl_aprovado = true AND c.dt_entrega IS NULL " +
                    "AND c.id NOT IN (SELECT ep.id_pedido FROM est_entrega_pedido ep)";

    public Uni<List<ControlePedidos>> listarPedidosSemEntrega(Long unidadeId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_LISTAR_PEDIDOS_SEM_ENTREGA, ControlePedidos.class)
                        .setParameter(1, unidadeId).getResultList());
    }

    // Migrado de ControlePedidosRepository.buscaSolicitacaoEstoque (legado) - contador itemAprovadoNaoEntregue
    public static final String SQL_BUSCA_SOLICITACAO_ESTOQUE =
            "SELECT c.* FROM est_controle_pedidos c JOIN est_solicitacao_estoque s ON s.id = c.id_solicitacao_estoque " +
                    "WHERE s.id_unidade = ?1 AND c.id_produto = ?2 AND s.ativo = false AND c.dt_previsao >= current_date AND c.dt_entrega IS NULL AND c.dt_aprovacao IS NOT NULL";

    public Uni<List<ControlePedidos>> buscaSolicitacaoEstoque(Long unidadeId, Long produtoId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_BUSCA_SOLICITACAO_ESTOQUE, ControlePedidos.class)
                        .setParameter(1, unidadeId).setParameter(2, produtoId).getResultList());
    }

    public Uni<List<ControlePedidos>> listBySolicitacao(Long solicitacaoEstoqueId) {
        return find("solicitacaoEstoqueId = ?1", solicitacaoEstoqueId).list();
    }
}
