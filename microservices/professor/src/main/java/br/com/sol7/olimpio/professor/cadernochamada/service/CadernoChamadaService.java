package br.com.sol7.olimpio.professor.cadernochamada.service;

import br.com.sol7.olimpio.professor.cadernochamada.entity.CadernoChamada;
import br.com.sol7.olimpio.professor.cadernochamada.repository.CadernoChamadaRepository;
import br.com.sol7.olimpio.professor.cadernochamada.dto.CadernoChamadaRequest;
import br.com.sol7.olimpio.professor.cadernochamada.dto.CadernoChamadaResponse;
import io.quarkus.hibernate.reactive.panache.common.WithTransaction;
import br.com.sol7.olimpio.shared.PagedResponse;
import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.NotFoundException;

import java.util.List;

@ApplicationScoped
@WithTransaction
public class CadernoChamadaService {
    @Inject
    CadernoChamadaRepository repository;

    public Uni<List<CadernoChamadaResponse>> list() {
        return repository.listAll().map(items -> items.stream().map(this::toResponse).toList());
    }

    public Uni<PagedResponse<CadernoChamadaResponse>> paged(int page, int size) {
        int p = Math.max(0, page);
        int s = (size == 10 || size == 20 || size == 50 || size == 100) ? size : 10;
        return repository.findAll(io.quarkus.panache.common.Sort.by("id").descending()).page(io.quarkus.panache.common.Page.of(p, s)).list()
                .onItem().transformToUni(items -> repository.count()
                        .map(count -> new PagedResponse<>(items.stream().map(this::toResponse).toList(), count, p, s)));
    }

    public Uni<CadernoChamadaResponse> find(Long id) {
        return repository.findById(id).onItem().ifNull().failWith(() -> new NotFoundException("CadernoChamada not found")).map(this::toResponse);
    }

    public Uni<CadernoChamadaResponse> create(CadernoChamadaRequest r) {
        var e = new CadernoChamada();
        apply(e, r);
        return repository.persist(e).replaceWith(() -> toResponse(e));
    }

    public Uni<CadernoChamadaResponse> update(Long id, CadernoChamadaRequest r) {
        return repository.findById(id).onItem().ifNull().failWith(() -> new NotFoundException("CadernoChamada not found")).invoke(e -> apply(e, r)).map(this::toResponse);
    }

    public Uni<Void> delete(Long id) {
        return repository.deleteById(id).onItem().transformToUni(deleted -> deleted ? Uni.createFrom().voidItem() : Uni.createFrom().failure(new NotFoundException("CadernoChamada not found")));
    }

    private void apply(CadernoChamada e, CadernoChamadaRequest r) {
        e.nome = r.nome();
        e.dadosJson = r.dadosJson();
    }

    private CadernoChamadaResponse toResponse(CadernoChamada e) {
        return new CadernoChamadaResponse(e.id, e.nome, e.dadosJson);
    }

    public Uni<Void> carregarHistoricoChamada() {
        return Uni.createFrom().voidItem();
    }

    public Uni<Void> carregarPendenciaProfessor() {
        return Uni.createFrom().voidItem();
    }

    public Uni<Void> carregarPendencia(Long pessoaId) {
        return Uni.createFrom().voidItem();
    }

    public Uni<Void> verificarPendencias() {
        return Uni.createFrom().voidItem();
    }

    public Uni<Void> buscarOcorrencia() {
        return Uni.createFrom().voidItem();
    }

    public Uni<Long> verificarPresenca(Long matriculaId, Long ocorrenciaComponenteCurricularId) {
        return Uni.createFrom().item(null);
    }

    public Uni<Void> carregarCronograma() {
        return Uni.createFrom().voidItem();
    }

    public Uni<List<Long>> autoComplete(String query) {
        return Uni.createFrom().item(java.util.List.of());
    }

    public Uni<List<Integer>> buscarQuantidadeNotas() {
        return Uni.createFrom().item(java.util.List.of());
    }

    public Uni<Boolean> verificarAcesso(String tipo, String modulo) {
        return Uni.createFrom().item(false);
    }

}
