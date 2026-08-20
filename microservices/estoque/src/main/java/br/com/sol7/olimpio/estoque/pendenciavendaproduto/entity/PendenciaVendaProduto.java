package br.com.sol7.olimpio.estoque.pendenciavendaproduto;

import io.quarkus.hibernate.reactive.panache.PanacheEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.persistence.Temporal;
import jakarta.persistence.TemporalType;

import java.util.Date;

@Entity
@Table(name = "est_pendencia_venda_produto")
public class PendenciaVendaProduto extends PanacheEntity {

    @Column(name = "quantidade")
    public int quantidade;
    @Column(name = "id_venda")
    public Long vendaProdutoId;  // referencia a VendaProduto (id, cross-service)
    @Column(name = "id_produto")
    public Long produtoId;  // referencia a Produto (id, cross-service)
    @Temporal(TemporalType.TIMESTAMP)
    @Column(name = "dt_entrega")
    public Date dataEntrega;
}
