package br.com.sol7.olimpio.relatorios.extrator;

import io.quarkus.hibernate.reactive.panache.common.WithTransaction;
import br.com.sol7.olimpio.shared.PagedResponse;

import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.NotFoundException;

import java.util.List;

@ApplicationScoped
@WithTransaction
public class ExtratorService {

    @Inject
    ExtratorRepository repository;

    // Migrado de ExtratorService.remove() (legado)
    public Uni<Void> remover() {
        return repository.removerAntigosNativo();
    }

    public Uni<List<ExtratorResponse>> list() {
        return repository.listAll().map(items -> items.stream().map(this::toResponse).toList());
    }

    public Uni<PagedResponse<ExtratorResponse>> paged(int page, int size) {
        int p = Math.max(0, page);
        int s = (size == 10 || size == 20 || size == 50 || size == 100) ? size : 10;
        return repository.findAll(io.quarkus.panache.common.Sort.by("id").descending()).page(io.quarkus.panache.common.Page.of(p, s)).list()
                .onItem().transformToUni(items -> repository.count()
                        .map(count -> new PagedResponse<>(items.stream().map(this::toResponse).toList(), count, p, s)));
    }


    public Uni<ExtratorResponse> find(Long id) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("Extrator not found"))
                .map(this::toResponse);
    }

    public Uni<ExtratorResponse> create(ExtratorRequest r) {
        var e = new Extrator();
        apply(e, r);
        return repository.persist(e).replaceWith(() -> toResponse(e));
    }

    public Uni<ExtratorResponse> update(Long id, ExtratorRequest r) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("Extrator not found"))
                .invoke(e -> apply(e, r))
                .map(this::toResponse);
    }

    public Uni<Void> delete(Long id) {
        return repository.deleteById(id).onItem()
                .transformToUni(deleted -> deleted ? Uni.createFrom().voidItem()
                        : Uni.createFrom().failure(new NotFoundException("Extrator not found")));
    }

    private void apply(Extrator e, ExtratorRequest r) {
        e.log = r.log();
        e.situacao = r.situacao();
        e.tipo = r.tipo();
        e.sql = r.sql();
        e.usuarioId = r.usuarioId();
        e.tabelaId = r.tabelaId();
        e.dataInicio = r.dataInicio();
        e.dataFim = r.dataFim();
    }

    private ExtratorResponse toResponse(Extrator e) {
        return new ExtratorResponse(e.id, e.log, e.situacao, e.tipo, e.sql, e.usuarioId, e.tabelaId, e.dataInicio, e.dataFim);
    }


    // Migrado de ExtratorController.carregarextrator (src/main/java/br/com/sol7/olimpio/control/controllers/relatorios/ExtratorController.java:183, camada controller)
    // Logica original (adaptar):
    // public String carregarextrator() {
    //         return "/view/relatorios/extrator.xhtml";
    //     }
    public Uni<String> carregarextrator() {
        // Obs: logica de UI do controlador JSF legado (navegacao de tela /view/relatorios/extrator.xhtml), sem equivalente reativo
        return Uni.createFrom().item(null);
    }

}
