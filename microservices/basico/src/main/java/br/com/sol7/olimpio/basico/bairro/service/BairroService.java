package br.com.sol7.olimpio.basico.bairro.service;

import io.quarkus.hibernate.reactive.panache.common.WithTransaction;
import br.com.sol7.olimpio.shared.PagedResponse;

import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.NotFoundException;

import java.util.List;

import br.com.sol7.olimpio.basico.bairro.dto.BairroRequest;
import br.com.sol7.olimpio.basico.bairro.dto.BairroResponse;
import br.com.sol7.olimpio.basico.bairro.entity.Bairro;
import br.com.sol7.olimpio.basico.bairro.repository.BairroRepository;

@ApplicationScoped
@WithTransaction
public class BairroService {

    @Inject
    BairroRepository repository;

    public Uni<List<BairroResponse>> list() {
        return repository.listAll().map(items -> items.stream().map(this::toResponse).toList());
    }

    public Uni<PagedResponse<BairroResponse>> paged(int page, int size) {
        int p = Math.max(0, page);
        int s = (size == 10 || size == 20 || size == 50 || size == 100) ? size : 10;
        return repository.findAll(io.quarkus.panache.common.Sort.by("id").descending()).page(io.quarkus.panache.common.Page.of(p, s)).list()
                .onItem().transformToUni(items -> repository.count()
                        .map(count -> new PagedResponse<>(items.stream().map(this::toResponse).toList(), count, p, s)));
    }


    public Uni<BairroResponse> find(Long id) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("Bairro not found"))
                .map(this::toResponse);
    }

    public Uni<BairroResponse> create(BairroRequest r) {
        var e = new Bairro();
        apply(e, r);
        return repository.persist(e).replaceWith(() -> toResponse(e));
    }

    public Uni<BairroResponse> update(Long id, BairroRequest r) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("Bairro not found"))
                .invoke(e -> apply(e, r))
                .map(this::toResponse);
    }

    public Uni<Void> delete(Long id) {
        return repository.deleteById(id).onItem()
                .transformToUni(deleted -> deleted ? Uni.createFrom().voidItem()
                        : Uni.createFrom().failure(new NotFoundException("Bairro not found")));
    }

    private void apply(Bairro e, BairroRequest r) {
        e.descricao = r.descricao();
        e.cidadeId = r.cidadeId();
    }

    private BairroResponse toResponse(Bairro e) {
        return new BairroResponse(e.id, e.descricao, e.cidadeId);
    }

    public Uni<List<Long>> autoComplete(String query) {
        return repository.autoComplete(query.toLowerCase()).map(list -> list.stream().map(x -> x.id).toList());
    }

    public Uni<List<Long>> autoCompleteLogradouroTroca(String query) {
        if (query == null || query.equals("")) {
            return Uni.createFrom().item(java.util.List.of());
        }
        return repository.autoComplete(query.toLowerCase()).map(list -> list.stream().map(x -> x.id).toList());
    }

    public Uni<List<Long>> autoCompleteComCep(String query, String cep) {
        return repository.autoCompleteComCep(query.toLowerCase(), cep).map(list -> list.stream().map(x -> ((Number) x).longValue()).toList());
    }

    public Uni<List<Long>> autoCompleteComCidade(String query, Long cidadeId) {
        return repository.find("cidadeId = ?2 and (lower(descricao) like '%' || ?1 || '%') order by descricao", query.toLowerCase(), cidadeId).page(io.quarkus.panache.common.Page.of(0, 10)).list().map(list -> list.stream().map(x -> x.id).toList());
    }

    public Uni<List<Long>> autoCompleteComCidadeComCep(String query, Long cidadeId, String cep) {
        return repository.autoCompleteComCidadeComCep(query.toLowerCase(), cidadeId, cep).map(list -> list.stream().map(x -> ((Number) x).longValue()).toList());
    }

    public Uni<List<Long>> autoCompleteComCidadeEstado(String query, Long cidadeId, Long estadoId) {
        // Obs: condicao removida (depende de outro microservico): c.cidade.estado = ?3
        return repository.find("cidadeId = ?2 and (lower(descricao) like '%' || ?1 || '%') order by descricao", query.toLowerCase(), cidadeId, estadoId).page(io.quarkus.panache.common.Page.of(0, 10)).list().map(list -> list.stream().map(x -> x.id).toList());
    }

    public Uni<List<Long>> autoCompleteComCidadeEstadoComCep(String query, Long cidadeId, Long estadoId, String cep) {
        return repository.autoCompleteComCidadeEstadoComCep(query.toLowerCase(), cidadeId, estadoId, cep).map(list -> list.stream().map(x -> ((Number) x).longValue()).toList());
    }


    // Opcoes ricas (id + descricao + cidadeId) para os autocompletes da tela de logradouro.
    public Uni<List<BairroResponse>> autoCompleteOpcoes(String query, Long cidadeId) {
        if (cidadeId != null) {
            return repository.autoCompleteComCidade(query.toLowerCase(), cidadeId)
                    .map(list -> list.stream().map(this::toResponse).toList());
        }
        return repository.autoComplete(query.toLowerCase())
                .map(list -> list.stream().map(this::toResponse).toList());
    }

}
