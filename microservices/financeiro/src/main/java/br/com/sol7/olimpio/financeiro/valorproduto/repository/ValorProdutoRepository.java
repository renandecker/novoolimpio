package br.com.sol7.olimpio.financeiro.valorproduto;

import java.util.List;

import io.quarkus.hibernate.reactive.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;
import io.smallrye.mutiny.Uni;

@ApplicationScoped
public class ValorProdutoRepository implements PanacheRepository<ValorProduto> {

    // Migrado de ValorProdutoRepository.buscarExistenciaEmVenda (legado) - HQL original:
    // select v from VendaProduto vp inner join vp.formaPagamento v where v = ?1
    public static final String SQL_BUSCAR_EXISTENCIA_EM_VENDA =
            "SELECT v.* FROM fin_venda_produto vp INNER JOIN fin_valor_produto v ON v.id = vp.id_forma_pagamento WHERE v.id = ?1";

    public Uni<java.util.List<ValorProduto>> buscarExistenciaEmVenda(Long valorCursoId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_BUSCAR_EXISTENCIA_EM_VENDA, ValorProduto.class)
                        .setParameter(1, valorCursoId)
                        .getResultList());
    }

}