package br.com.sol7.olimpio.estoque.produtocampoinformacao;

import io.quarkus.hibernate.reactive.panache.PanacheEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

@Entity
@Table(name = "est_produto_campo_informacao")
public class ProdutoCampoInformacao extends PanacheEntity {

    @Column(name = "valor")
    public String valor;
    @Column(name = "id_produto")
    public Long produtoId;  // referencia a Produto (id, cross-service)
    @Column(name = "id_campo")
    public Long campoId;  // referencia a Campo (id, cross-service)
}
