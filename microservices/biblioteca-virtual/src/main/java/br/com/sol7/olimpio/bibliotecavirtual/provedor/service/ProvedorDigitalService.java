package br.com.sol7.olimpio.bibliotecavirtual.provedor.service;

import br.com.sol7.olimpio.bibliotecavirtual.provedor.dto.ProvedorDigitalRequest;
import br.com.sol7.olimpio.bibliotecavirtual.provedor.dto.ProvedorDigitalResponse;
import br.com.sol7.olimpio.bibliotecavirtual.provedor.entity.ProvedorDigital;
import br.com.sol7.olimpio.bibliotecavirtual.provedor.repository.ProvedorDigitalRepository;
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
public class ProvedorDigitalService {

    @Inject
    ProvedorDigitalRepository repository;

    public Uni<PagedResponse<ProvedorDigitalResponse>> listar(SearchFilterRequest request, int page, int size) {
        return repository.listAll()
                .onItem().transform(list -> list.stream()
                        .filter(p -> p.flAtivo)
                        .map(ProvedorDigitalResponse::fromEntity)
                        .collect(Collectors.toList()))
                .onItem().transform(list -> {
                    int from = page * size;
                    int to = Math.min(from + size, list.size());
                    List<ProvedorDigitalResponse> pageList = from < list.size() ? list.subList(from, to) : List.of();
                    return new PagedResponse<>(pageList, list.size(), page, size);
                });
    }

    public Uni<ProvedorDigitalResponse> buscarPorId(Long id) {
        return repository.findById(id)
                .onItem().ifNull().failWith(() -> new NotFoundException("Provedor Digital não encontrado: " + id))
                .onItem().transform(ProvedorDigitalResponse::fromEntity);
    }

    @Transactional
    public Uni<ProvedorDigitalResponse> criar(@Valid ProvedorDigitalRequest request) {
        ProvedorDigital provedor = request.toEntity();
        return repository.persist(provedor)
                .onItem().transform(ProvedorDigitalResponse::fromEntity);
    }

    @Transactional
    public Uni<ProvedorDigitalResponse> atualizar(Long id, @Valid ProvedorDigitalRequest request) {
        return repository.findById(id)
                .onItem().ifNull().failWith(() -> new NotFoundException("Provedor Digital não encontrado: " + id))
                .onItem().transformToUni(provedor -> {
                    request.updateEntity(provedor);
                    return repository.persist(provedor).replaceWith(provedor);
                })
                .onItem().transform(ProvedorDigitalResponse::fromEntity);
    }

    @Transactional
    public Uni<Void> excluir(Long id) {
        return repository.findById(id)
                .onItem().ifNull().failWith(() -> new NotFoundException("Provedor Digital não encontrado: " + id))
                .onItem().transformToUni(provedor -> {
                    provedor.flAtivo = false;
                    return repository.persist(provedor).replaceWithVoid();
                });
    }

    public Uni<List<ProvedorDigitalResponse>> buscarTodosAtivos() {
        return repository.findAllAtivos()
                .onItem().transform(list -> list.stream()
                        .map(ProvedorDigitalResponse::fromEntity)
                        .collect(Collectors.toList()));
    }
}