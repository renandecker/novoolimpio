package br.com.sol7.olimpio.notificacoes.notificacao.service;

import br.com.sol7.olimpio.notificacoes.notificacao.dto.UsuarioMobileRequest;
import br.com.sol7.olimpio.notificacoes.notificacao.dto.UsuarioMobileResponse;
import br.com.sol7.olimpio.notificacoes.notificacao.entity.UsuarioMobile;
import br.com.sol7.olimpio.notificacoes.notificacao.repository.UsuarioMobileRepository;
import br.com.sol7.olimpio.shared.PagedResponse;
import io.quarkus.hibernate.reactive.panache.Panache;
import io.quarkus.hibernate.reactive.panache.common.WithSession;
import io.quarkus.hibernate.reactive.panache.common.WithTransaction;
import io.quarkus.panache.common.Page;
import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.NotFoundException;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.OffsetDateTime;
import java.util.List;

@ApplicationScoped
public class UsuarioMobileService {

    private static final Logger LOGGER = LoggerFactory.getLogger(UsuarioMobileService.class);

    @Inject
    UsuarioMobileRepository repository;

    @WithSession
    public Uni<List<UsuarioMobileResponse>> listByUsuario(Integer idUsuario) {
        return repository.findByUsuarioAtivo(idUsuario).map(items -> items.stream().map(this::toResponse).toList());
    }

    @WithSession
    public Uni<PagedResponse<UsuarioMobileResponse>> pagedByUsuario(Integer idUsuario, int page, int size) {
        int p = Math.max(0, page);
        int s = (size == 10 || size == 20 || size == 50 || size == 100) ? size : 10;
        return repository.find("idUsuario = ?1 and ativo = true order by updatedAt desc", idUsuario).page(Page.of(p, s)).list()
                .onItem().transformToUni(items -> repository.countByUsuario(idUsuario)
                        .map(count -> new PagedResponse<UsuarioMobileResponse>(items.stream().map(this::toResponse).toList(), count, p, s)));
    }

    @WithTransaction
    public Uni<UsuarioMobileResponse> registrarOuAtualizar(Integer idUsuario, UsuarioMobileRequest request) {
        String token = request.token();
        String plataforma = request.plataforma() != null ? request.plataforma().toUpperCase() : "ANDROID";

        return repository.findByUsuarioAndToken(idUsuario, token)
                .onItem().transformToUni(existing -> {
                    if (existing != null) {
                        existing.ativo = true;
                        existing.plataforma = plataforma;
                        existing.ultimoUso = OffsetDateTime.now();
                        return Panache.getSession()
                                .chain(session -> session.merge(existing))
                                .replaceWith(() -> toResponse(existing));
                    } else {
                        var novo = new UsuarioMobile();
                        novo.idUsuario = idUsuario;
                        novo.token = token;
                        novo.plataforma = plataforma;
                        novo.ativo = true;
                        novo.ultimoUso = OffsetDateTime.now();
                        return repository.persist(novo).replaceWith(() -> toResponse(novo));
                    }
                });
    }

    @WithTransaction
    public Uni<Void> desativar(Integer idUsuario, String token) {
        return repository.findByUsuarioAndToken(idUsuario, token)
                .onItem().ifNull().failWith(() -> new NotFoundException("Token não encontrado"))
                .invoke(e -> {
                    e.ativo = false;
                })
                .replaceWithVoid();
    }

    @WithTransaction
    public Uni<Void> desativarTodosDoUsuario(Integer idUsuario) {
        return repository.findByUsuarioAtivo(idUsuario)
                .invoke(list -> list.forEach(e -> e.ativo = false))
                .replaceWithVoid();
    }

    private UsuarioMobileResponse toResponse(UsuarioMobile e) {
        return new UsuarioMobileResponse(e.id, e.idUsuario, e.token, e.plataforma, e.ativo, e.ultimoUso, e.createdAt, e.updatedAt);
    }
}