package br.com.sol7.olimpio.basico.pessoadocumento.service;

import io.quarkus.hibernate.reactive.panache.common.WithTransaction;
import br.com.sol7.olimpio.shared.PagedResponse;

import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.NotFoundException;

import java.util.List;

import br.com.sol7.olimpio.basico.pessoadocumento.dto.PessoaDocumentoRequest;
import br.com.sol7.olimpio.basico.pessoadocumento.dto.PessoaDocumentoResponse;
import br.com.sol7.olimpio.basico.pessoadocumento.entity.PessoaDocumento;
import br.com.sol7.olimpio.basico.pessoadocumento.repository.PessoaDocumentoRepository;

@ApplicationScoped
@WithTransaction
public class PessoaDocumentoService {

    @Inject
    PessoaDocumentoRepository repository;

    public Uni<List<PessoaDocumentoResponse>> list() {
        return repository.listAll().map(items -> items.stream().map(this::toResponse).toList());
    }

    public Uni<PagedResponse<PessoaDocumentoResponse>> paged(int page, int size) {
        int p = Math.max(0, page);
        int s = (size == 10 || size == 20 || size == 50 || size == 100) ? size : 10;
        return repository.findAll(io.quarkus.panache.common.Sort.by("id").descending()).page(io.quarkus.panache.common.Page.of(p, s)).list()
                .onItem().transformToUni(items -> repository.count()
                        .map(count -> new PagedResponse<>(items.stream().map(this::toResponse).toList(), count, p, s)));
    }


    public Uni<PessoaDocumentoResponse> find(Long id) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("PessoaDocumento not found"))
                .map(this::toResponse);
    }

    public Uni<PessoaDocumentoResponse> create(PessoaDocumentoRequest r) {
        var e = new PessoaDocumento();
        apply(e, r);
        return repository.persist(e).replaceWith(() -> toResponse(e));
    }

    public Uni<PessoaDocumentoResponse> update(Long id, PessoaDocumentoRequest r) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("PessoaDocumento not found"))
                .invoke(e -> apply(e, r))
                .map(this::toResponse);
    }

    public Uni<Void> delete(Long id) {
        return repository.deleteById(id).onItem()
                .transformToUni(deleted -> deleted ? Uni.createFrom().voidItem()
                        : Uni.createFrom().failure(new NotFoundException("PessoaDocumento not found")));
    }

    private void apply(PessoaDocumento e, PessoaDocumentoRequest r) {
        e.nome = r.nome();
        e.documento = r.documento();
        e.dataAtualizacao = r.dataAtualizacao();
        e.pessoaId = r.pessoaId();
    }

    private PessoaDocumentoResponse toResponse(PessoaDocumento e) {
        return new PessoaDocumentoResponse(e.id, e.nome, e.documento, e.dataAtualizacao, e.pessoaId);
    }


    // Migrado de PessoaDocumentoService.buscarPessoaDocumento (src/main/java/br/com/sol7/olimpio/service/services/basico/PessoaDocumentoService.java:26, camada service)
    // Observacao: parametro pessoaId: era Pessoa (referencia por id)
    // Logica original (adaptar):
    // public List<PessoaDocumento> buscarPessoaDocumento(Pessoa pessoa) {
    //         return getPessoaDocumentoRepository().buscarPessoaDocumento(pessoa);
    //     }
    public Uni<List<Long>> buscarPessoaDocumento(Long pessoaId) {
        return repository.find("pessoaId = ?1", pessoaId).list().map(list -> list.stream().map(x -> x.id).toList());
    }

}
