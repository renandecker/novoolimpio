package br.com.sol7.olimpio.biblioteca.obra.service;

import br.com.sol7.olimpio.biblioteca.obra.dto.ObraRequest;
import br.com.sol7.olimpio.biblioteca.obra.dto.ObraResponse;
import br.com.sol7.olimpio.biblioteca.obra.entity.Obra;
import br.com.sol7.olimpio.biblioteca.obra.repository.ObraRepository;
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
public class ObraService {

    @Inject
    ObraRepository repository;

    public Uni<PagedResponse<ObraResponse>> listar(SearchFilterRequest request, int page, int size) {
        return repository.listAll()
                .onItem().transform(list -> list.stream()
                        .filter(o -> o.flAtivo)
                        .map(ObraResponse::fromEntity)
                        .collect(Collectors.toList()))
                .onItem().transform(list -> {
                    int from = page * size;
                    int to = Math.min(from + size, list.size());
                    List<ObraResponse> pageList = from < list.size() ? list.subList(from, to) : List.of();
                    return new PagedResponse<>(pageList, list.size(), page, size);
                });
    }

    public Uni<ObraResponse> buscarPorId(Long id) {
        return repository.findById(id)
                .onItem().ifNull().failWith(() -> new NotFoundException("Obra não encontrada: " + id))
                .onItem().transform(ObraResponse::fromEntity);
    }

    @Transactional
    public Uni<ObraResponse> criar(@Valid ObraRequest request) {
        Obra obra = request.toEntity();
        return repository.persist(obra)
                .onItem().transform(ObraResponse::fromEntity);
    }

    @Transactional
    public Uni<ObraResponse> atualizar(Long id, @Valid ObraRequest request) {
        return repository.findById(id)
                .onItem().ifNull().failWith(() -> new NotFoundException("Obra não encontrada: " + id))
                .onItem().transformToUni(obra -> {
                    request.updateEntity(obra);
                    return repository.persist(obra).replaceWith(obra);
                })
                .onItem().transform(ObraResponse::fromEntity);
    }

    @Transactional
    public Uni<Void> excluir(Long id) {
        return repository.findById(id)
                .onItem().ifNull().failWith(() -> new NotFoundException("Obra não encontrada: " + id))
                .onItem().transformToUni(obra -> {
                    obra.flAtivo = false;
                    return repository.persist(obra).replaceWithVoid();
                });
    }

    public Uni<List<ObraResponse>> buscarPorTitulo(String titulo) {
        return repository.findByTituloContainingIgnoreCase(titulo)
                .onItem().transform(list -> list.stream()
                        .map(ObraResponse::fromEntity)
                        .collect(Collectors.toList()));
    }

    public Uni<List<ObraResponse>> buscarPorIsbn(String isbn) {
        return repository.findByIsbn(isbn)
                .onItem().transform(list -> list.stream()
                        .map(ObraResponse::fromEntity)
                        .collect(Collectors.toList()));
    }
}