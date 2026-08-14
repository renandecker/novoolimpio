package br.com.sol7.olimpio.notificacoes.notificacao.service;

import br.com.sol7.olimpio.notificacoes.notificacao.dto.NotificacaoRequest;
import br.com.sol7.olimpio.notificacoes.notificacao.dto.NotificacaoResponse;
import br.com.sol7.olimpio.notificacoes.notificacao.entity.Notificacao;
import br.com.sol7.olimpio.notificacoes.notificacao.repository.NotificacaoRepository;
import br.com.sol7.olimpio.shared.PagedResponse;
import io.quarkus.hibernate.reactive.panache.common.WithTransaction;
import io.quarkus.panache.common.Page;
import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.ForbiddenException;
import jakarta.ws.rs.NotFoundException;
import java.time.OffsetDateTime;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@ApplicationScoped
@WithTransaction
public class NotificacaoService {

    private static final Logger LOGGER = LoggerFactory.getLogger(NotificacaoService.class);

    @Inject NotificacaoRepository repository;
    @Inject ConfigCanalService configCanalService;
    @Inject NotificacaoKafkaProducer kafkaProducer;

    public Uni<List<NotificacaoResponse>> list() {
        return repository.listAll().map(items -> items.stream().map(this::toResponse).toList());
    }

    public Uni<PagedResponse<NotificacaoResponse>> paged(int page, int size) {
        int p = Math.max(0, page);
        int s = (size == 10 || size == 20 || size == 50 || size == 100) ? size : 10;
        return repository.findAll(io.quarkus.panache.common.Sort.by("id").descending()).page(Page.of(p, s)).list()
                .onItem().transformToUni(items -> repository.count()
                        .map(count -> new PagedResponse<>(items.stream().map(this::toResponse).toList(), count, p, s)));
    }

    public Uni<PagedResponse<NotificacaoResponse>> minhas(String username, int page, int size) {
        int p = Math.max(0, page);
        int s = (size == 10 || size == 20 || size == 50 || size == 100) ? size : 20;
        return repository.find("username = ?1 order by createdAt desc", username).page(Page.of(p, s)).list()
                .onItem().transformToUni(items -> repository.count("username = ?1", username)
                        .map(count -> new PagedResponse<>(items.stream().map(this::toResponse).toList(), count, p, s)));
    }

    public Uni<Long> naoLidas(String username) {
        return repository.count("username = ?1 and lida = false", username);
    }

    public Uni<NotificacaoResponse> find(Long id) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("Notificacao not found"))
                .map(this::toResponse);
    }

    public Uni<NotificacaoResponse> create(NotificacaoRequest r) {
        var e = new Notificacao();
        e.username = r.username() == null || r.username().isBlank() ? "admin" : r.username();
        e.titulo = r.titulo();
        e.mensagem = r.mensagem();
        e.tipo = r.tipo();
        e.link = r.link();
        e.lida = false;
        return configCanalService.canaisAtivos()
                .invoke(canais -> {
                    e.canalSistema = true;
                    e.canalMobile = r.canalMobile() != null ? r.canalMobile() : canais.mobile();
                    e.canalEmail = r.canalEmail() != null ? r.canalEmail() : canais.email();
                })
                .chain(canais -> repository.persist(e))
                .chain(saved -> kafkaProducer.dispatch(saved)
                        .onFailure().invoke(err ->
                                LOGGER.warn("Falha ao publicar a notificação {} no Kafka: {}", e.id, err.getMessage()))
                        .onFailure().recoverWithNull())
                .replaceWith(() -> toResponse(e));
    }

    public Uni<NotificacaoResponse> update(Long id, NotificacaoRequest r) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("Notificacao not found"))
                .invoke(e -> {
                    e.username = r.username();
                    e.titulo = r.titulo();
                    e.mensagem = r.mensagem();
                    e.tipo = r.tipo();
                    e.link = r.link();
                    if (r.canalMobile() != null) e.canalMobile = r.canalMobile();
                    if (r.canalEmail() != null) e.canalEmail = r.canalEmail();
                })
                .map(this::toResponse);
    }

    public Uni<Void> delete(Long id) {
        return repository.deleteById(id).onItem()
                .transformToUni(deleted -> deleted ? Uni.createFrom().voidItem()
                        : Uni.createFrom().failure(new NotFoundException("Notificacao not found")));
    }

    public Uni<NotificacaoResponse> marcarLida(Long id, String username) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("Notificacao not found"))
                .invoke(e -> {
                    if (!e.username.equals(username)) throw new ForbiddenException("Notificacao pertence a outro usuário");
                    e.lida = true;
                    e.dataLeitura = OffsetDateTime.now();
                })
                .map(this::toResponse);
    }

    private NotificacaoResponse toResponse(Notificacao e) {
        return new NotificacaoResponse(e.id, e.username, e.titulo, e.mensagem, e.tipo, e.link, e.lida,
                e.canalSistema, e.canalMobile, e.canalEmail, e.emailEnviado, e.mobileEnviado, e.dataLeitura, e.createdAt);
    }
}
