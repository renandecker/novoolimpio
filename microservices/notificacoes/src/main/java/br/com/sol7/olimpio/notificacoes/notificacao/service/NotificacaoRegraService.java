package br.com.sol7.olimpio.notificacoes.notificacao.service;

import br.com.sol7.olimpio.notificacoes.notificacao.dto.NotificacaoRegraRequest;
import br.com.sol7.olimpio.notificacoes.notificacao.dto.NotificacaoRegraResponse;
import br.com.sol7.olimpio.notificacoes.notificacao.entity.NotificacaoRegra;
import br.com.sol7.olimpio.notificacoes.notificacao.repository.NotificacaoRegraRepository;
import br.com.sol7.olimpio.shared.PagedResponse;
import io.quarkus.hibernate.reactive.panache.common.WithTransaction;
import io.quarkus.panache.common.Sort;
import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.NotFoundException;
import jakarta.validation.Valid;

import java.util.List;

@ApplicationScoped
@WithTransaction
public class NotificacaoRegraService {

    @Inject
    NotificacaoRegraRepository repository;

    public Uni<List<NotificacaoRegraResponse>> list() {
        return repository.findAll(Sort.by("nome").ascending()).list()
                .map(items -> items.stream()
                        .map(this::toResponse)
                        .toList());
    }

    public Uni<PagedResponse<NotificacaoRegraResponse>> paged(int page, int size) {
        int p = Math.max(0, page);
        int s = size > 0 ? size : 10;
        return repository.findAll(Sort.by("nome").ascending()).page(io.quarkus.panache.common.Page.of(p, s)).list()
                .onItem().transformToUni(items -> repository.count()
                        .map(count -> new PagedResponse<NotificacaoRegraResponse>(items.stream().map(this::toResponse).toList(), count, p, s)));
    }

    public Uni<NotificacaoRegraResponse> find(Long id) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("Regra de notificação não encontrada"))
                .map(this::toResponse);
    }

    public Uni<NotificacaoRegraResponse> create(@Valid NotificacaoRegraRequest request) {
        NotificacaoRegra entity = new NotificacaoRegra();
        entity.nome = request.nome();
        entity.descricao = request.descricao();
        entity.tipoRegra = request.tipoRegra();
        entity.canal = request.canal();
        entity.destinatario = request.destinatario();
        entity.valorLimite = request.valorLimite();
        entity.ativo = true;

        return repository.persist(entity).replaceWith(() -> toResponse(entity));
    }

    public Uni<NotificacaoRegraResponse> update(Long id, @Valid NotificacaoRegraRequest request) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("Regra de notificação não encontrada"))
                .invoke(entity -> {
                    entity.nome = request.nome();
                    entity.descricao = request.descricao();
                    entity.tipoRegra = request.tipoRegra();
                    entity.canal = request.canal();
                    entity.destinatario = request.destinatario();
                    entity.valorLimite = request.valorLimite();
                })
                .map(this::toResponse);
    }

    public Uni<Void> delete(Long id) {
        return repository.deleteById(id).onItem()
                .transformToUni(deleted -> deleted ? Uni.createFrom().voidItem()
                        : Uni.createFrom().failure(new NotFoundException("Regra de notificação não encontrada")));
    }

    public Uni<Long> countByTipoAndCanal(String tipoRegra, String canal) {
        return repository.count("tipoRegra", tipoRegra, "canal", canal, "ativo", true);
    }

    private NotificacaoRegraResponse toResponse(NotificacaoRegra e) {
        return new NotificacaoRegraResponse(
                e.id,
                e.nome,
                e.descricao,
                e.tipoRegra,
                e.canal,
                e.destinatario,
                e.valorLimite,
                e.ativo,
                e.createdAt,
                e.updatedAt);
    }
}