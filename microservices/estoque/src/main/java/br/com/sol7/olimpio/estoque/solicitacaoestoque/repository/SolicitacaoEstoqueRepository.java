package br.com.sol7.olimpio.estoque.solicitacaoestoque.repository;

import br.com.sol7.olimpio.estoque.solicitacaoestoque.SolicitacaoEstoque;
import br.com.sol7.olimpio.shared.enums.Motivo;
import io.quarkus.hibernate.reactive.panache.PanacheRepository;
import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import java.util.List;

@ApplicationScoped
public class SolicitacaoEstoqueRepository implements PanacheRepository<SolicitacaoEstoque> {

    // Migrado de SolicitacaoEstoqueRepository.buscaPorItem* (legado) - contadores da tela EstoqueProduto
    public Uni<List<SolicitacaoEstoque>> buscaPorItem(Long unidadeId, Long produtoId, Motivo motivo) {
        return find("unidadeId = ?1 and produtoId = ?2 and motivo = ?3 and ativo = true", unidadeId, produtoId, motivo).list();
    }

    public Uni<List<SolicitacaoEstoque>> buscaPorUnidade(Long unidadeId, Motivo motivo) {
        return find("unidadeId = ?1 and motivo = ?2 and ativo = true", unidadeId, motivo).list();
    }

    public Uni<Long> countPorUnidadeMotivo(Long unidadeId, Motivo motivo) {
        return count("unidadeId = ?1 and motivo = ?2 and ativo = true", unidadeId, motivo);
    }
}
