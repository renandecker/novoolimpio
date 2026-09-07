package br.com.sol7.olimpio.educacao.curriculounidade;

import io.quarkus.hibernate.reactive.panache.common.WithTransaction;
import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.BadRequestException;

import java.util.List;

@ApplicationScoped
@WithTransaction
public class CurriculoUnidadeService {
    @Inject
    CurriculoUnidadeRepository repository;

    public Uni<List<CurriculoUnidadeResponse>> list() {
        return repository.listAll().map(items -> items.stream().map(this::toResponse).toList());
    }

    public Uni<List<CurriculoUnidadeResponse>> listarPorCurriculo(Long curriculoId) {
        return repository.find("curriculoId = ?1", curriculoId).list()
                .map(items -> items.stream().map(this::toResponse).toList());
    }

    // Criacao idempotente: a tela reenvia todas as unidades a cada salvamento.
    public Uni<CurriculoUnidadeResponse> create(CurriculoUnidadeRequest r) {
        if (r.curriculoId() == null || r.unidadeId() == null) {
            throw new BadRequestException("curriculoId e unidadeId sao obrigatorios");
        }
        return repository.find("curriculoId = ?1 and unidadeId = ?2", r.curriculoId(), r.unidadeId())
                .firstResult()
                .chain(existing -> {
                    if (existing != null) return Uni.createFrom().item(toResponse(existing));
                    var e = new CurriculoUnidade();
                    e.curriculoId = r.curriculoId();
                    e.unidadeId = r.unidadeId();
                    return repository.persist(e).replaceWith(() -> toResponse(e));
                });
    }

    public Uni<Void> delete(Long curriculoId, Long unidadeId) {
        if (curriculoId == null || unidadeId == null) {
            throw new BadRequestException("curriculoId e unidadeId sao obrigatorios");
        }
        return repository.delete("curriculoId = ?1 and unidadeId = ?2", curriculoId, unidadeId)
                .replaceWithVoid();
    }

    private CurriculoUnidadeResponse toResponse(CurriculoUnidade e) {
        return new CurriculoUnidadeResponse(e.curriculoId, e.unidadeId);
    }
}
