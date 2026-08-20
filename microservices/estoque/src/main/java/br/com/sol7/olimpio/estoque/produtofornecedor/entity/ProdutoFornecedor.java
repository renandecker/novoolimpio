package br.com.sol7.olimpio.estoque.produtofornecedor;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.IdClass;
import jakarta.persistence.Table;

import java.io.Serializable;
import java.util.Objects;

// Tabela de join est_produto_fornecedor (id_produto + id_fornecedor, chave composta)
@Entity
@Table(name = "est_produto_fornecedor")
@IdClass(ProdutoFornecedor.ProdutoFornecedorId.class)
public class ProdutoFornecedor {

    @Id
    @Column(name = "id_produto")
    public Long produtoId;

    @Id
    @Column(name = "id_fornecedor")
    public Long fornecedorId;

    public static class ProdutoFornecedorId implements Serializable {
        public Long produtoId;
        public Long fornecedorId;

        public ProdutoFornecedorId() {
        }

        public ProdutoFornecedorId(Long produtoId, Long fornecedorId) {
            this.produtoId = produtoId;
            this.fornecedorId = fornecedorId;
        }

        @Override
        public boolean equals(Object o) {
            if (this == o) return true;
            if (o == null || getClass() != o.getClass()) return false;
            ProdutoFornecedorId that = (ProdutoFornecedorId) o;
            return Objects.equals(produtoId, that.produtoId) && Objects.equals(fornecedorId, that.fornecedorId);
        }

        @Override
        public int hashCode() {
            return Objects.hash(produtoId, fornecedorId);
        }
    }
}
