package br.com.sol7.olimpio.financeiro.valorproduto;

import java.util.List;

import io.quarkus.hibernate.reactive.panache.Panache;
import io.quarkus.hibernate.reactive.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;
import io.smallrye.mutiny.Uni;

@ApplicationScoped
public class ValorProdutoRepository implements PanacheRepository<ValorProduto> {

    public Uni<List<Integer>> listarVinculos(String tabela, String colunaVinculo, Long valorProdutoId) {
        return Panache.getSession()
                .chain(session -> session
                        .createNativeQuery("SELECT " + colunaVinculo + " FROM " + tabela + " WHERE id_valor_produto = ?1")
                        .setParameter(1, valorProdutoId.intValue())
                        .getResultList()
                        .map(list -> list.stream().map(o -> ((Number) o).intValue()).toList()));
    }

    public Uni<Void> substituirVinculos(String tabela, String colunaVinculo, Long valorProdutoId, List<Integer> ids) {
        return Panache.getSession()
                .chain(session -> session
                        .createNativeQuery("DELETE FROM " + tabela + " WHERE id_valor_produto = ?1")
                        .setParameter(1, valorProdutoId.intValue())
                        .executeUpdate()
                        .chain(() -> {
                            Uni<Void> chain = Uni.createFrom().voidItem();
                            if (ids != null) {
                                for (Integer id : ids) {
                                    final Integer vinculo = id;
                                    chain = chain.chain(() -> session
                                            .createNativeQuery("INSERT INTO " + tabela + " (id_valor_produto, "
                                                    + colunaVinculo + ") VALUES (?1, ?2)")
                                            .setParameter(1, valorProdutoId.intValue())
                                            .setParameter(2, vinculo)
                                            .executeUpdate()
                                            .replaceWithVoid());
                                }
                            }
                            return chain;
                        }));
    }

    public Uni<List<ValorProduto>> buscarPorUnidadeCurso(Long unidadeId, Long curriculoId) {
        String sql = "SELECT v.* FROM fin_valor_produto v "
                + "WHERE (?1 IS NULL OR EXISTS (SELECT 1 FROM fin_valor_produto_unidade u WHERE u.id_valor_produto = v.id AND u.id_unidade = ?1)) "
                + "AND (?2 IS NULL OR EXISTS (SELECT 1 FROM fin_valor_produto_curso c WHERE c.id_valor_produto = v.id AND c.id_curriculo = ?2)) "
                + "ORDER BY v.id";
        return Panache.getSession()
                .chain(session -> session.createNativeQuery(sql, ValorProduto.class)
                        .setParameter(1, unidadeId == null ? null : unidadeId.intValue())
                        .setParameter(2, curriculoId == null ? null : curriculoId.intValue())
                        .getResultList());
    }

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