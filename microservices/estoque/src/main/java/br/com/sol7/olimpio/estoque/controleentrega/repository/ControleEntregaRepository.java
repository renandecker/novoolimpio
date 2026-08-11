package br.com.sol7.olimpio.estoque.controleentrega;

import io.quarkus.hibernate.reactive.panache.PanacheRepository;
import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import java.util.List;

@ApplicationScoped
public class ControleEntregaRepository implements PanacheRepository<ControleEntrega> {

    // Migrado de ControleEntregaRepository.entregasproUnidade (legado) - entregas ativas com pedido na unidade
    public static final String SQL_ENTREGAS_POR_UNIDADE =
            "SELECT DISTINCT ce.* FROM est_controle_entrega ce " +
            "INNER JOIN est_entrega_pedido ep ON ep.id_entrega = ce.id " +
            "INNER JOIN est_controle_pedidos c ON c.id = ep.id_pedido " +
            "WHERE c.id_unidade = ?1 AND ce.fl_ativo = true";

    public Uni<List<ControleEntrega>> entregasPorUnidade(Long unidadeId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_ENTREGAS_POR_UNIDADE, ControleEntrega.class)
                        .setParameter(1, unidadeId).getResultList());
    }

    // Migrado de ControleEntregaRepository.entregasNaUnidade (legado) - pedidos de uma entrega
    public static final String SQL_ENTREGAS_NA_UNIDADE =
            "SELECT c.* FROM est_controle_entrega ce " +
            "INNER JOIN est_entrega_pedido ep ON ep.id_entrega = ce.id " +
            "INNER JOIN est_controle_pedidos c ON c.id = ep.id_pedido " +
            "WHERE ce.id = ?1";

    public Uni<List<ControleEntrega>> entregasNaUnidade(Long controleEntregaId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_ENTREGAS_NA_UNIDADE, ControleEntrega.class)
                        .setParameter(1, controleEntregaId).getResultList());
    }
}
