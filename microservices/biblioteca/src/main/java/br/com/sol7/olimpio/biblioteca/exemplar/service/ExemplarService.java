package br.com.sol7.olimpio.biblioteca.exemplar.service;

import br.com.sol7.olimpio.biblioteca.exemplar.dto.ExemplarRequest;
import br.com.sol7.olimpio.biblioteca.exemplar.dto.ExemplarResponse;
import br.com.sol7.olimpio.biblioteca.exemplar.entity.Exemplar;
import br.com.sol7.olimpio.biblioteca.exemplar.repository.ExemplarRepository;
import br.com.sol7.olimpio.biblioteca.obra.entity.Obra;
import br.com.sol7.olimpio.shared.PagedResponse;
import br.com.sol7.olimpio.shared.SearchFilterRequest;
import io.quarkus.hibernate.reactive.panache.common.WithTransaction;
import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import jakarta.ws.rs.NotFoundException;
import java.util.List;
import java.util.stream.Collectors;

@ApplicationScoped
@WithTransaction
public class ExemplarService {

    @Inject
    ExemplarRepository repository;

    @Inject
    io.quarkus.hibernate.reactive.panache.PanacheRepository<Obra> obraRepository;

    public Uni<PagedResponse<ExemplarResponse>> listar(SearchFilterRequest request, int page, int size) {
        return repository.listAll()
                .onItem().transform(list -> list.stream()
                        .filter(e -> e.flAtivo)
                        .map(ExemplarResponse::fromEntity)
                        .collect(Collectors.toList()))
                .onItem().transform(list -> {
                    int from = page * size;
                    int to = Math.min(from + size, list.size());
                    List<ExemplarResponse> pageList = from < list.size() ? list.subList(from, to) : List.of();
                    return new PagedResponse<>(pageList, list.size(), page, size);
                });
    }

    public Uni<ExemplarResponse> buscarPorId(Long id) {
        return repository.findById(id)
                .onItem().ifNull().failWith(() -> new NotFoundException("Exemplar não encontrado: " + id))
                .onItem().transform(ExemplarResponse::fromEntity);
    }

    @Transactional
    public Uni<ExemplarResponse> criar(@Valid ExemplarRequest request) {
        return obraRepository.findById(request.obraId)
                .onItem().ifNull().failWith(() -> new NotFoundException("Obra não encontrada: " + request.obraId))
                .onItem().transformToUni(obra -> {
                    Exemplar exemplar = request.toEntity();
                    exemplar.obra = obra;
                    return repository.persist(exemplar).replaceWith(exemplar);
                })
                .onItem().transform(ExemplarResponse::fromEntity);
    }

    @Transactional
    public Uni<ExemplarResponse> atualizar(Long id, @Valid ExemplarRequest request) {
        return repository.findById(id)
                .onItem().ifNull().failWith(() -> new NotFoundException("Exemplar não encontrado: " + id))
                .onItem().transformToUni(exemplar -> {
                    if (request.obraId != null && !request.obraId.equals(exemplar.obra.id)) {
                        return obraRepository.findById(request.obraId)
                                .onItem().ifNull().failWith(() -> new NotFoundException("Obra não encontrada: " + request.obraId))
                                .onItem().transformToUni(obra -> {
                                    request.updateEntity(exemplar);
                                    exemplar.obra = obra;
                                    return repository.persist(exemplar).replaceWith(exemplar);
                                });
                    } else {
                        request.updateEntity(exemplar);
                        return repository.persist(exemplar).replaceWith(exemplar);
                    }
                })
                .onItem().transform(ExemplarResponse::fromEntity);
    }

    @Transactional
    public Uni<Void> excluir(Long id) {
        return repository.findById(id)
                .onItem().ifNull().failWith(() -> new NotFoundException("Exemplar não encontrado: " + id))
                .onItem().transformToUni(exemplar -> {
                    exemplar.flAtivo = false;
                    return repository.persist(exemplar).replaceWithVoid();
                });
    }

    public Uni<List<ExemplarResponse>> buscarPorObra(Long obraId) {
        return repository.findByObraId(obraId)
                .onItem().transform(list -> list.stream()
                        .map(ExemplarResponse::fromEntity)
                        .collect(Collectors.toList()));
    }

    public Uni<List<ExemplarResponse>> buscarDisponiveisPorObra(Long obraId) {
        return repository.findDisponiveisByObraId(obraId)
                .onItem().transform(list -> list.stream()
                        .map(ExemplarResponse::fromEntity)
                        .collect(Collectors.toList()));
    }
}