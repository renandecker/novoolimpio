package br.com.sol7.olimpio.pagamento.cartaopessoa.repository;

import br.com.sol7.olimpio.pagamento.cartaopessoa.entity.CartaoPessoa;
import io.quarkus.hibernate.reactive.panache.PanacheRepository;
import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;

import java.util.List;

@ApplicationScoped
public class CartaoPessoaRepository implements PanacheRepository<CartaoPessoa> {

    public Uni<List<CartaoPessoa>> listarPorPessoa(Long idPessoa) {
        return find("idPessoa = ?1 and ativo = true order by principal desc, id desc", idPessoa).list();
    }

    public Uni<CartaoPessoa> buscarAtivoDaPessoa(Long idPessoa, Long idCartao) {
        return find("id = ?1 and idPessoa = ?2 and ativo = true", idCartao, idPessoa).firstResult();
    }
}
