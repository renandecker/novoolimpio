package br.com.sol7.olimpio.estoque.controleentrega;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.IdClass;
import jakarta.persistence.Table;
import java.io.Serializable;
import java.util.Objects;

// Tabela de join est_entrega_pedido (id_entrega + id_pedido, chave composta)
@Entity
@Table(name = "est_entrega_pedido")
@IdClass(EntregaPedido.EntregaPedidoId.class)
public class EntregaPedido {

    @Id
    @Column(name = "id_entrega")
    public Long entregaId;

    @Id
    @Column(name = "id_pedido")
    public Long pedidoId;

    public static class EntregaPedidoId implements Serializable {
        public Long entregaId;
        public Long pedidoId;

        public EntregaPedidoId() {}

        public EntregaPedidoId(Long entregaId, Long pedidoId) {
            this.entregaId = entregaId;
            this.pedidoId = pedidoId;
        }

        @Override
        public boolean equals(Object o) {
            if (this == o) return true;
            if (o == null || getClass() != o.getClass()) return false;
            EntregaPedidoId that = (EntregaPedidoId) o;
            return Objects.equals(entregaId, that.entregaId) && Objects.equals(pedidoId, that.pedidoId);
        }

        @Override
        public int hashCode() {
            return Objects.hash(entregaId, pedidoId);
        }
    }
}
