package br.com.sol7.olimpio.estoque.controleestoque;

import io.quarkus.hibernate.reactive.panache.PanacheEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import java.math.BigDecimal;

@Entity
@Table(name = "est_controle_estoque")
public class ControleEstoque extends PanacheEntity {

    @Column(name = "valor")
    public BigDecimal valor;
    @Column(name = "quantidade")
    public int quantidade;
    @Column(name = "qtde_solicitado")
    public int qtdeSolicitado;
    @Column(name = "qtde_defeito")
    public int qtdeDefeito;
    @Column(name = "qtde_falta")
    public int qtdeFalta;
    @Column(name = "qtde_naoencontrado")
    public int qtdeNaoEncontrado;
    @Column(name = "qtde_reservado")
    public int qtdeReservado;
    @Column(name = "qtde_aprovadonaoentregue")
    public int qtdeAprovadoNaoEntregue;
    @Column(name = "id_produto")
    public Long produtoId;  // referencia a Produto (id, cross-service)
    @Column(name = "id_unidade")
    public Long unidadeId;  // referencia a Unidade (id, cross-service)
}
