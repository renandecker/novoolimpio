package br.com.sol7.olimpio.estoque.controleentrega;

import io.quarkus.hibernate.reactive.panache.PanacheRepository;
import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;

import java.util.List;

@ApplicationScoped
public class EntregaPedidoRepository implements PanacheRepository<EntregaPedido> {

    public Uni<List<EntregaPedido>> listByEntrega(Long entregaId) {
        return find("entregaId", entregaId).list();
    }

    public Uni<Long> countByPedido(Long pedidoId) {
        return count("pedidoId", pedidoId);
    }

    public Uni<Void> deleteByEntregaPedido(Long entregaId, Long pedidoId) {
        return delete("entregaId = ?1 and pedidoId = ?2", entregaId, pedidoId).replaceWithVoid();
    }
}
