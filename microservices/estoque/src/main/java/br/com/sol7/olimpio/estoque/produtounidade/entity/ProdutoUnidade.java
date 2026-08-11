package br.com.sol7.olimpio.estoque.produtounidade;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.IdClass;
import jakarta.persistence.Table;
import java.io.Serializable;
import java.util.Objects;

// Tabela de join est_produto_unidade (id_produto + id_unidade, chave composta)
@Entity
@Table(name = "est_produto_unidade")
@IdClass(ProdutoUnidade.ProdutoUnidadeId.class)
public class ProdutoUnidade {

    @Id
    @Column(name = "id_produto")
    public Long produtoId;

    @Id
    @Column(name = "id_unidade")
    public Long unidadeId;

    public static class ProdutoUnidadeId implements Serializable {
        public Long produtoId;
        public Long unidadeId;

        public ProdutoUnidadeId() {}

        public ProdutoUnidadeId(Long produtoId, Long unidadeId) {
            this.produtoId = produtoId;
            this.unidadeId = unidadeId;
        }

        @Override
        public boolean equals(Object o) {
            if (this == o) return true;
            if (o == null || getClass() != o.getClass()) return false;
            ProdutoUnidadeId that = (ProdutoUnidadeId) o;
            return Objects.equals(produtoId, that.produtoId) && Objects.equals(unidadeId, that.unidadeId);
        }

        @Override
        public int hashCode() {
            return Objects.hash(produtoId, unidadeId);
        }
    }
}
