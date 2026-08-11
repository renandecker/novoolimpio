package br.com.sol7.olimpio.estoque.movimentacaoestoque;

import br.com.sol7.olimpio.shared.enums.TipoMovimentacao;
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
@Table(name = "est_movimentacao_estoque")
public class MovimentacaoEstoque extends PanacheEntity {

    @Column(name = "valor")
    public BigDecimal valor;
    @Column(name = "quantidade")
    public int quantidade;
    @Enumerated(EnumType.STRING)
    @Column(name = "tipo")
    public TipoMovimentacao tipoMovimentacao;
    @Temporal(TemporalType.TIMESTAMP)
    @Column(name = "dt_movimento")
    public Date dataMovimento;
    @Column(name = "id_usuario")
    public Long usuarioId;  // referencia a Usuario (id, cross-service)
    @Column(name = "id_produto")
    public Long produtoId;  // referencia a Produto (id, cross-service)
    @Column(name = "id_unidade")
    public Long unidadeId;  // referencia a Unidade (id, cross-service)
    @Column(name = "id_venda")
    public Long vendaProdutoId;  // referencia a VendaProduto (id, cross-service)
    @Column(name = "id_central")
    public Long unidadeCentralId;  // referencia a Unidade central (id, cross-service)
    @Column(name = "id_fornecedor")
    public Long fornecedorId;  // referencia a Fornecedor (id, cross-service)
    @Column(name = "fl_central")
    public boolean central;
}
