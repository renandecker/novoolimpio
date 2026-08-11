package br.com.sol7.olimpio.estoque.produtocampo;

import io.quarkus.hibernate.reactive.panache.PanacheEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

@Entity
@Table(name = "est_produto_campo")
public class ProdutoCampo extends PanacheEntity {

    @Column(name = "id_campo")
    public Long campoId;  // referencia a Campo (id, cross-service)
    @Column(name = "obrigatorio")
    public boolean obrigatorio;
    @Column(name = "ordem")
    public int ordem;
}
