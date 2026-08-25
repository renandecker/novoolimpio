package br.com.sol7.olimpio.educacao.requisitomatriz;

import br.com.sol7.olimpio.educacao.matrizcurricular.MatrizCurricular;
import br.com.sol7.olimpio.educacao.matrizcurricular.MatrizCurricularRepository;
import io.quarkus.hibernate.reactive.panache.common.WithTransaction;
import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.BadRequestException;
import jakarta.ws.rs.NotFoundException;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@ApplicationScoped
@WithTransaction
public class RequisitoMatrizService {
    @Inject
    RequisitoMatrizRepository repository;
    @Inject
    MatrizCurricularRepository matrizRepository;

    public Uni<List<RequisitoMatrizResponse>> list() {
        return repository.listAll().map(items -> items.stream().map(r -> toResponse(r, Map.of())).toList());
    }

    public Uni<List<RequisitoMatrizResponse>> listarPorCurriculo(Long curriculoId) {
        return matrizIdsDoCurriculo(curriculoId).flatMap(ids -> {
            if (ids.isEmpty()) return Uni.createFrom().item(List.<RequisitoMatrizResponse>of());
            // Consultas serializadas: primeiro a matriz, depois os requisitos.
            return repository.find("matrizCurricularId in ?1", List.copyOf(ids.keySet())).list()
                    .map(requisitos -> {
                        Map<Long, Long> componentePorMatriz = new HashMap<>();
                        for (var m : ids.entrySet()) componentePorMatriz.put(m.getKey(), m.getValue());
                        return requisitos.stream().map(r -> toResponse(r, componentePorMatriz)).toList();
                    });
        });
    }

    private Uni<Map<Long, Long>> matrizIdsDoCurriculo(Long curriculoId) {
        return matrizRepository.find("curriculoId", curriculoId).list()
                .map(items -> {
                    Map<Long, Long> mapa = new HashMap<>();
                    for (var m : items) mapa.put(m.id, m.componenteCurricularId);
                    return mapa;
                });
    }

    public Uni<RequisitoMatrizResponse> find(Long id) {
        return repository.findById(id)
                .onItem().ifNull().failWith(() -> new NotFoundException("RequisitoMatriz not found"))
                .map(r -> toResponse(r, Map.of()));
    }

    // Criacao idempotente: evita duplicar o mesmo requisito em salvamentos repetidos da tela.
    public Uni<RequisitoMatrizResponse> create(RequisitoMatrizRequest r) {
        if (r.tipoRequisito() == null || r.tipoRequisito().isBlank()) {
            throw new BadRequestException("tipoRequisito e obrigatorio");
        }
        String tipo = normalizarTipo(r.tipoRequisito());
        Uni<Long> matrizUni = r.matrizCurricularId() != null ? Uni.createFrom().item(r.matrizCurricularId())
                : resolverMatriz(r.curriculoId(), r.componenteCurricularId());
        Uni<Long> requisitoUni = r.matrizCurricularRequisitoId() != null
                ? Uni.createFrom().item(r.matrizCurricularRequisitoId())
                : (r.requisitoComponenteCurricularId() != null
                        ? resolverMatriz(r.curriculoId(), r.requisitoComponenteCurricularId())
                        : Uni.createFrom().nullItem());
        return matrizUni.chain(matrizId -> requisitoUni.chain(requisitoId ->
                repository.find("matrizCurricularId = ?1 and tipoRequisito = ?2 "
                                + (requisitoId == null ? "and matrizCurricularRequisitoId is null" : "and matrizCurricularRequisitoId = ?3"),
                        requisitoId == null ? new Object[]{matrizId, tipo} : new Object[]{matrizId, tipo, requisitoId})
                        .firstResult()
                        .chain(existing -> existing != null ? Uni.createFrom().item(toResponse(existing, Map.of()))
                                : persistNovo(matrizId, requisitoId, tipo))));
    }

    private Uni<RequisitoMatrizResponse> persistNovo(Long matrizId, Long requisitoId, String tipo) {
        var e = new RequisitoMatriz();
        e.matrizCurricularId = matrizId;
        e.matrizCurricularRequisitoId = requisitoId;
        e.tipoRequisito = tipo;
        return repository.persist(e).replaceWith(() -> toResponse(e, Map.of()));
    }

    public Uni<RequisitoMatrizResponse> update(Long id, RequisitoMatrizRequest r) {
        return repository.findById(id)
                .onItem().ifNull().failWith(() -> new NotFoundException("RequisitoMatriz not found"))
                .invoke(e -> {
                    if (r.matrizCurricularId() != null) e.matrizCurricularId = r.matrizCurricularId();
                    if (r.matrizCurricularRequisitoId() != null) e.matrizCurricularRequisitoId = r.matrizCurricularRequisitoId();
                    if (r.tipoRequisito() != null && !r.tipoRequisito().isBlank()) e.tipoRequisito = normalizarTipo(r.tipoRequisito());
                })
                .map(e -> toResponse(e, Map.of()));
    }

    public Uni<Void> delete(Long id) {
        return repository.deleteById(id)
                .onItem().transformToUni(deleted -> deleted ? Uni.createFrom().voidItem()
                        : Uni.createFrom().failure(new NotFoundException("RequisitoMatriz not found")));
    }

    private Uni<Long> resolverMatriz(Long curriculoId, Long componenteCurricularId) {
        if (curriculoId == null || componenteCurricularId == null) {
            throw new BadRequestException("informe matrizCurricularId ou curriculoId + componenteCurricularId");
        }
        return matrizRepository.find("curriculoId = ?1 and componenteCurricularId = ?2", curriculoId, componenteCurricularId)
                .firstResult()
                .onItem().ifNull().failWith(() -> new BadRequestException(
                        "componente " + componenteCurricularId + " nao esta na matriz do curriculo " + curriculoId))
                .map(m -> m.id);
    }

    // Converte o rotulo usado pela tela para o char(1) do legado.
    private String normalizarTipo(String tipo) {
        var t = tipo.trim();
        return switch (t.toUpperCase()) {
            case "PRÉ-REQUISITO", "PRE-REQUISITO", "P" -> "P";
            case "CO-REQUISITO", "C" -> "C";
            case "EQUIVALENTE", "E" -> "E";
            default -> t.substring(0, 1).toUpperCase();
        };
    }

    // Converte o char(1) do legado para o rotulo usado pela tela.
    private String rotularTipo(String tipo) {
        if (tipo == null) return null;
        return switch (tipo.trim().toUpperCase()) {
            case "P" -> "PRÉ-REQUISITO";
            case "C" -> "CO-REQUISITO";
            case "E" -> "EQUIVALENTE";
            default -> tipo;
        };
    }

    private RequisitoMatrizResponse toResponse(RequisitoMatriz e, Map<Long, Long> componentePorMatriz) {
        return new RequisitoMatrizResponse(e.id, e.matrizCurricularId, e.matrizCurricularRequisitoId,
                componentePorMatriz.get(e.matrizCurricularId),
                e.matrizCurricularRequisitoId != null ? componentePorMatriz.get(e.matrizCurricularRequisitoId) : null,
                rotularTipo(e.tipoRequisito));
    }
}
