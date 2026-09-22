package br.com.sol7.olimpio.relatorios.painel.service;

import br.com.sol7.olimpio.relatorios.painel.entity.PainelTopico;
import br.com.sol7.olimpio.relatorios.painel.dto.PainelTopicoRequest;
import br.com.sol7.olimpio.relatorios.painel.dto.PainelTopicoResponse;
import br.com.sol7.olimpio.relatorios.painel.repository.PainelTopicoRepository;
import io.quarkus.hibernate.reactive.panache.common.WithTransaction;
import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.NotFoundException;

import java.util.List;

@ApplicationScoped
@WithTransaction
public class PainelTopicoService {

    @Inject
    PainelTopicoRepository repository;

    public Uni<List<PainelTopicoResponse>> findByPainelId(Long painelId) {
        return repository.findByPainelId(painelId)
                .map(items -> items.stream().map(this::toResponse).toList());
    }

    public Uni<PainelTopicoResponse> create(PainelTopicoRequest r) {
        var e = new PainelTopico();
        apply(e, r);
        return repository.persist(e).replaceWith(() -> toResponse(e));
    }

    public Uni<PainelTopicoResponse> update(Long id, PainelTopicoRequest r) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("PainelTopico not found"))
                .invoke(e -> apply(e, r))
                .map(this::toResponse);
    }

    public Uni<Void> delete(Long id) {
        return repository.deleteById(id).onItem()
                .transformToUni(deleted -> deleted ? Uni.createFrom().voidItem()
                        : Uni.createFrom().failure(new NotFoundException("PainelTopico not found")));
    }

    public Uni<Void> deleteByPainelId(Long painelId) {
        return repository.deleteByPainelId(painelId).replaceWithVoid();
    }

    private void apply(PainelTopico e, PainelTopicoRequest r) {
        e.painelId = r.painelId();
        e.tabelaId = r.tabelaId();
        e.graficoId = r.graficoId();
        e.mapaId = r.mapaId();
        e.ordem = r.ordem();
    }

    private PainelTopicoResponse toResponse(PainelTopico e) {
        return new PainelTopicoResponse(e.id, e.painelId, e.tabelaId, e.graficoId, e.mapaId, e.ordem);
    }
}