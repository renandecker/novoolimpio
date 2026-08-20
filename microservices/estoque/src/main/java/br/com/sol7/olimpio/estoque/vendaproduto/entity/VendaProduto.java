package br.com.sol7.olimpio.estoque.vendaproduto;

import io.quarkus.hibernate.reactive.panache.PanacheEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

import java.math.BigDecimal;
import java.util.Date;

@Entity
@Table(name = "fin_venda_produto")
public class VendaProduto extends PanacheEntity {

    @Column(name = "data_compra")
    public Date dataCompra;
    @Column(name = "id_unidade")
    public Long unidadeId;  // referencia a Unidade (id, cross-service)
    @Column(name = "id_usuario")
    public Long usuarioId;  // referencia a Usuario (id, cross-service)
    @Column(name = "id_pessoa")
    public Long pessoaId;  // referencia a Pessoa (id, cross-service)
    @Column(name = "forma_pagamento")
    public String tipoFormaPagamento;  // era TipoFormaPagamento (enum/embeddable) no legado
    @Column(name = "valor")
    public BigDecimal valor;
    @Column(name = "id_forma_pagamento")
    public Long formaPagamentoId;  // referencia a ValorProduto (id, cross-service)
    @Column(name = "quantidade")
    public int quantidade;
}
