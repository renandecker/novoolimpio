package br.com.sol7.olimpio.relatorios.painel.service;

import io.quarkus.hibernate.reactive.panache.common.WithTransaction;
import br.com.sol7.olimpio.shared.PagedResponse;
import br.com.sol7.olimpio.relatorios.painel.repository.PainelRepository;
import br.com.sol7.olimpio.relatorios.painel.entity.Painel;
import br.com.sol7.olimpio.relatorios.painel.dto.PainelRequest;
import br.com.sol7.olimpio.relatorios.painel.dto.PainelPermissaoRequest;
import br.com.sol7.olimpio.relatorios.painel.dto.PainelFiltrosRequest;
import br.com.sol7.olimpio.relatorios.painel.dto.PainelResponse;

import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.NotFoundException;

import java.util.List;

@ApplicationScoped
@WithTransaction
public class PainelService {

    @Inject
    PainelRepository repository;

    @Inject
    PainelTopicoService painelTopicoService;

    public Uni<List<PainelResponse>> list() {
        return repository.listAll().map(items -> items.stream().map(this::toResponse).toList());
    }

    public Uni<PagedResponse<PainelResponse>> paged(int page, int size) {
        int p = Math.max(0, page);
        int s = (size == 10 || size == 20 || size == 50 || size == 100) ? size : 10;
        return repository.findAll(io.quarkus.panache.common.Sort.by("id").descending()).page(io.quarkus.panache.common.Page.of(p, s)).list()
                .onItem().transformToUni(items -> repository.count()
                        .map(count -> new PagedResponse<>(items.stream().map(this::toResponse).toList(), count, p, s)));
    }


    public Uni<PainelResponse> find(Long id) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("Painel not found"))
                .flatMap(e -> painelTopicoService.findByPainelId(id)
                        .flatMap(topicos -> Uni.combine().all()
                                .unis(repository.listUsuarios(id), repository.listUnidades(id),
                                        repository.listPerfis(id), repository.listFiltrosIds(id))
                                .asTuple()
                                .map(tuple -> new PainelResponse(e.id, e.nome, topicos,
                                        tuple.getItem1(), tuple.getItem2(), tuple.getItem3(), tuple.getItem4()))));
    }

    public Uni<PainelResponse> create(PainelRequest r) {
        var e = new Painel();
        apply(e, r);
        return repository.persist(e).replaceWith(() -> toResponse(e));
    }

    public Uni<PainelResponse> update(Long id, PainelRequest r) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("Painel not found"))
                .invoke(e -> apply(e, r))
                .map(this::toResponse);
    }

    public Uni<PainelResponse> updatePermissoes(Long id, PainelPermissaoRequest r) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("Painel not found"))
                .flatMap(e -> repository.replacePermissoes(id, r.usuariosIds(), r.unidadesIds(), r.perfisIds())
                        .replaceWith(find(id)));
    }

    public Uni<List<Long>> listarFiltros(Long id) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("Painel not found"))
                .flatMap(e -> repository.listFiltrosIds(id));
    }

    public Uni<PainelResponse> updateFiltros(Long id, PainelFiltrosRequest r) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("Painel not found"))
                .flatMap(e -> repository.replaceFiltros(id, r.filtrosIds())
                        .replaceWith(find(id)));
    }

    public Uni<Void> delete(Long id) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("Painel not found"))
                .flatMap(e -> repository.deleteJoinByPainelId(id)
                        .flatMap(v -> repository.deleteById(id))
                        .replaceWithVoid());
    }

    private void apply(Painel e, PainelRequest r) {
        e.nome = r.nome();
    }

    private PainelResponse toResponse(Painel e) {
        return new PainelResponse(e.id, e.nome, List.of(), List.of(), List.of(), List.of(), List.of());
    }

    public Uni<List<Long>> buscarUnidades(Long id) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("Painel not found"))
                .flatMap(e -> repository.listUnidades(id));
    }

    public Uni<List<Long>> buscarPerfils(Long id) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("Painel not found"))
                .flatMap(e -> repository.listPerfis(id));
    }

    public Uni<List<Long>> buscarUsuarios(Long id) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("Painel not found"))
                .flatMap(e -> repository.listUsuarios(id));
    }

    public Uni<List<Long>> autoComplete(String query, Long estruturaId) {
        return repository.autoComplete(query.toLowerCase(), estruturaId).map(list -> list.stream().map(x -> x.id).toList());
    }

}