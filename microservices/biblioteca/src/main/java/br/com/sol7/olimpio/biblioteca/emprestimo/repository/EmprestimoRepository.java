package br.com.sol7.olimpio.biblioteca.emprestimo.repository;

import br.com.sol7.olimpio.biblioteca.emprestimo.entity.Emprestimo;
import io.quarkus.hibernate.reactive.panache.PanacheRepository;
import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import java.time.LocalDate;
import java.util.List;

@ApplicationScoped
public class EmprestimoRepository implements PanacheRepository<Emprestimo> {

    public Uni<List<Emprestimo>> findByUsuarioId(Long usuarioId) {
        return list("usuarioId = ?1 and flAtivo = true order by dataRetirada desc", usuarioId);
    }

    public Uni<List<Emprestimo>> findByExemplarId(Long exemplarId) {
        return list("exemplar.id = ?1 and flAtivo = true order by dataRetirada desc", exemplarId);
    }

    public Uni<List<Emprestimo>> findAtivosByUsuarioId(Long usuarioId) {
        return list("usuarioId = ?1 and status = ?2 and flAtivo = true", usuarioId, Emprestimo.StatusEmprestimo.ATIVO);
    }

    public Uni<List<Emprestimo>> findAtrasados(LocalDate hoje) {
        return list("status = ?1 and dataPrevistaDevolucao < ?2 and flAtivo = true", Emprestimo.StatusEmprestimo.ATIVO, hoje);
    }

    public Uni<Emprestimo> findAtivoByExemplarId(Long exemplarId) {
        return find("exemplar.id = ?1 and status = ?2 and flAtivo = true", exemplarId, Emprestimo.StatusEmprestimo.ATIVO).firstResult();
    }
}