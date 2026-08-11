package br.com.sol7.olimpio.estoque.controleepedidos;

import io.quarkus.hibernate.reactive.panache.PanacheEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.persistence.Temporal;
import jakarta.persistence.TemporalType;
import java.math.BigDecimal;
import java.util.Date;

@Entity
@Table(name = "est_controle_pedidos")
public class ControlePedidos extends PanacheEntity {

    @Temporal(TemporalType.TIMESTAMP)
    @Column(name = "dt_entrega")
    public Date dataEntrega;
    @Column(name = "fl_aprovado")
    public boolean aprovado;
    @Temporal(TemporalType.TIMESTAMP)
    @Column(name = "dt_aprovacao")
    public Date dataAprovacao;
    @Temporal(TemporalType.TIMESTAMP)
    @Column(name = "dt_previsao")
    public Date dataPrevisao;
    @Column(name = "valor")
    public BigDecimal valor;
    @Column(name = "quantidade")
    public int quantidade;
    @Column(name = "id_usuario")
    public Long usuarioId;  // referencia a Usuario (id, cross-service)
    @Column(name = "id_solicitacao_estoque")
    public Long solicitacaoEstoqueId;  // referencia a SolicitacaoEstoque (id, cross-service)
    @Column(name = "id_movimentacao_estoque")
    public Long movimentacaoEstoqueId;  // referencia a MovimentacaoEstoque (id, cross-service)
    @Column(name = "id_produto")
    public Long produtoId;  // referencia a Produto (id, cross-service)
    @Column(name = "id_unidade")
    public Long unidadeId;  // referencia a Unidade (id, cross-service)
}
