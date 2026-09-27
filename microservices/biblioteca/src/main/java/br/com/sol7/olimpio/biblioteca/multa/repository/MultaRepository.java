package br.com.sol7.olimpio.biblioteca.multa.repository;

import br.com.sol7.olimpio.biblioteca.multa.entity.Multa;
import io.quarkus.hibernate.reactive.panache.PanacheRepository;
import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import java.util.List;

@ApplicationScoped
public class MultaRepository implements PanacheRepository<Multa> {

    public Uni<List<Multa>> findByUsuarioId(Long usuarioId) {
        return list("usuarioId = ?1 and flAtivo = true order by dataCadastro desc", usuarioId);
    }

    public Uni<List<Multa>> findByEmprestimoId(Long emprestimoId) {
        return list("emprestimo.id = ?1 and flAtivo = true", emprestimoId);
    }

    public Uni<List<Multa>> findByStatusPagamento(Multa.StatusPagamento status) {
        return list("statusPagamento = ?1 and flAtivo = true", status);
    }

    public Uni<List<Multa>> findPendentesByUsuarioId(Long usuarioId) {
        return list("usuarioId = ?1 and statusPagamento = ?2 and flAtivo = true", usuarioId, Multa.StatusPagamento.PENDENTE);
    }
}