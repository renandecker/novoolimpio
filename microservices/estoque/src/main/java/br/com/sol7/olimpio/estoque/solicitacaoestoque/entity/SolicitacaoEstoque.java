package br.com.sol7.olimpio.estoque.solicitacaoestoque;

import br.com.sol7.olimpio.shared.enums.Motivo;
import io.quarkus.hibernate.reactive.panache.PanacheEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import jakarta.persistence.Temporal;
import jakarta.persistence.TemporalType;

import java.math.BigDecimal;
import java.util.Date;

@Entity
@Table(name = "est_solicitacao_estoque")
public class SolicitacaoEstoque extends PanacheEntity {

    @Column(name = "valor")
    public BigDecimal valor;
    @Column(name = "quantidade")
    public int quantidade;
    @Column(name = "id_venda")
    public Long vendaProdutoId;  // referencia a VendaProduto (id, cross-service)
    @Column(name = "id_usuario")
    public Long usuarioId;  // referencia a Usuario (id, cross-service)
    @Column(name = "id_produto")
    public Long produtoId;  // referencia a Produto (id, cross-service)
    @Column(name = "id_unidade")
    public Long unidadeId;  // referencia a Unidade (id, cross-service)
    @Temporal(TemporalType.TIMESTAMP)
    @Column(name = "dt_solicitacao")
    public Date dataSolicitacao;
    @Column(name = "ativo")
    public boolean ativo;
    @Enumerated(EnumType.STRING)
    @Column(name = "motivo")
    public Motivo motivo;
    @Column(name = "id_motivo")
    public Long idMotivo;
}
