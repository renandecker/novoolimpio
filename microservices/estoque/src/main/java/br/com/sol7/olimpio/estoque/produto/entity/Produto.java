package br.com.sol7.olimpio.estoque.produto;

import io.quarkus.hibernate.reactive.panache.PanacheEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.util.Date;

@Entity
@Table(name = "est_produto")
public class Produto extends PanacheEntity {

    @Column(name = "valor")
    public BigDecimal valor;
    @Column(name = "imagem")
    public String imagem;
    @Column(name = "quantidade")
    public int quantidade;
    @Column(name = "nome")
    public String nome;
    @Column(name = "tamanho")
    public String tamanho;
    @Column(name = "ativo")
    public boolean ativo;
    @Column(name = "dt_cadastrado")
    public Date dataCadastro;
    @Column(name = "id_categoria")
    public Long categoriaId;  // referencia a Categoria (id, cross-service)
    @Column(name = "id_marca")
    public Long marcaId;  // referencia a Marca (id, cross-service)
}
