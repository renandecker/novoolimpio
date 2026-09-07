package br.com.sol7.olimpio.educacao.curriculoatividadecomplementar.service;

import br.com.sol7.olimpio.educacao.curriculoatividadecomplementar.dto.CurriculoAtividadeComplementarRequest;
import br.com.sol7.olimpio.educacao.curriculoatividadecomplementar.dto.CurriculoAtividadeComplementarResponse;
import br.com.sol7.olimpio.educacao.curriculoatividadecomplementar.entity.CurriculoAtividadeComplementar;
import br.com.sol7.olimpio.educacao.curriculoatividadecomplementar.repository.CurriculoAtividadeComplementarRepository;
import io.quarkus.hibernate.reactive.panache.common.WithTransaction;
import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.BadRequestException;

import java.util.List;

@ApplicationScoped
@WithTransaction
public class CurriculoAtividadeComplementarService {
    @Inject
    CurriculoAtividadeComplementarRepository repository;

    public Uni<List<CurriculoAtividadeComplementarResponse>> list() {
        return repository.listAll().map(items -> items.stream().map(this::toResponse).toList());
    }

    public Uni<List<CurriculoAtividadeComplementarResponse>> listarPorCurriculo(Long curriculoId) {
        return repository.find("curriculoId = ?1", curriculoId).list()
                .map(items -> items.stream().map(this::toResponse).toList());
    }

    public Uni<CurriculoAtividadeComplementarResponse> create(CurriculoAtividadeComplementarRequest r) {
        if (r.curriculoId() == null || r.atividadeComplementarId() == null) {
            throw new BadRequestException("curriculoId e atividadeComplementarId sao obrigatorios");
        }
        return repository.find("curriculoId = ?1 and atividadeComplementarId = ?2", r.curriculoId(), r.atividadeComplementarId())
                .firstResult()
                .chain(existing -> {
                    if (existing != null) return Uni.createFrom().item(toResponse(existing));
                    var e = new CurriculoAtividadeComplementar();
                    e.curriculoId = r.curriculoId();
                    e.atividadeComplementarId = r.atividadeComplementarId();
                    return repository.persist(e).replaceWith(() -> toResponse(e));
                });
    }

    public Uni<Void> delete(Long curriculoId, Long atividadeComplementarId) {
        if (curriculoId == null || atividadeComplementarId == null) {
            throw new BadRequestException("curriculoId e atividadeComplementarId sao obrigatorios");
        }
        return repository.delete("curriculoId = ?1 and atividadeComplementarId = ?2", curriculoId, atividadeComplementarId)
                .replaceWithVoid();
    }

    private CurriculoAtividadeComplementarResponse toResponse(CurriculoAtividadeComplementar e) {
        return new CurriculoAtividadeComplementarResponse(e.curriculoId, e.atividadeComplementarId);
    }
}
