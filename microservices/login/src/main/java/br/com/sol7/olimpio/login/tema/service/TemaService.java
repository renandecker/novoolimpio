package br.com.sol7.olimpio.login.tema.service;

import io.quarkus.hibernate.reactive.panache.common.WithTransaction;
import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.NotFoundException;

import java.util.List;

import br.com.sol7.olimpio.shared.PagedResponse;
import br.com.sol7.olimpio.login.tema.dto.TemaRequest;
import br.com.sol7.olimpio.login.tema.dto.TemaResponse;
import br.com.sol7.olimpio.login.tema.entity.Tema;
import br.com.sol7.olimpio.login.tema.repository.TemaRepository;

@ApplicationScoped
public class TemaService {

    @Inject TemaRepository repository;

    @WithTransaction
    public Uni<List<TemaResponse>> list() {
        return repository.listAll().map(items -> items.stream().map(this::toResponse).toList());
    }

    @WithTransaction
    public Uni<PagedResponse<TemaResponse>> paged(int page, int size) {
        int p = Math.max(0, page);
        int s = (size == 10 || size == 20 || size == 50 || size == 100) ? size : 10;
        return repository.findAll(io.quarkus.panache.common.Sort.by("id").descending()).page(io.quarkus.panache.common.Page.of(p, s)).list()
                .onItem().transformToUni(items -> repository.count()
                        .map(count -> new PagedResponse<>(items.stream().map(this::toResponse).toList(), count, p, s)));
    }

    @WithTransaction
    public Uni<TemaResponse> find(Long id) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("Tema not found"))
                .map(this::toResponse);
    }

    @WithTransaction
    public Uni<TemaResponse> create(TemaRequest r) {
        var e = new Tema();
        apply(e, r);
        return repository.persistAndFlush(e).map(v -> toResponse(e));
    }

    @WithTransaction
    public Uni<TemaResponse> update(Long id, TemaRequest r) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("Tema not found"))
                .invoke(e -> apply(e, r))
                .map(this::toResponse);
    }

    @WithTransaction
    public Uni<Void> delete(Long id) {
        return repository.deleteById(id).onItem()
                .transformToUni(deleted -> deleted ? Uni.createFrom().voidItem()
                        : Uni.createFrom().failure(new NotFoundException("Tema not found")));
    }

    private void apply(Tema e, TemaRequest r) {
        e.tema = r.tema();
        e.titulo = r.titulo();
        e.idLayout = r.idLayout();
        e.folderCss = r.folderCss();
        e.corPrimaria = r.corPrimaria();
        e.corSecundaria = r.corSecundaria();
        e.corBarra = r.corBarra();
        e.corFundo = r.corFundo();
        e.corTexto = r.corTexto();
        e.corBorda = r.corBorda();
        e.corDestaque = r.corDestaque();
        e.corEmail = r.corEmail();
        e.posicaoLogo = r.posicaoLogo();
        e.loginPosicao = r.loginPosicao();
        e.temaPadrao = r.temaPadrao();
        e.ativo = r.ativo();
    }

    private TemaResponse toResponse(Tema e) {
        return new TemaResponse(e.id, e.tema, e.titulo, e.idLayout, e.folderCss,
                e.corPrimaria, e.corSecundaria, e.corBarra, e.corFundo, e.corTexto, e.corBorda,
                e.corDestaque, e.corEmail, e.posicaoLogo, e.loginPosicao, e.temaPadrao, e.ativo);
    }

    @WithTransaction
    public Uni<List<Long>> autoComplete(String query) {
        return repository.autoComplete(query).map(list -> list.stream().map(x -> x.id).toList());
    }

}
