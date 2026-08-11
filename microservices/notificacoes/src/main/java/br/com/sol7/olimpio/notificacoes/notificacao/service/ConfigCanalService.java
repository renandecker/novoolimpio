package br.com.sol7.olimpio.notificacoes.notificacao.service;

import br.com.sol7.olimpio.notificacoes.notificacao.dto.ConfigCanalRequest;
import br.com.sol7.olimpio.notificacoes.notificacao.dto.ConfigCanalResponse;
import br.com.sol7.olimpio.notificacoes.notificacao.entity.ConfigCanal;
import br.com.sol7.olimpio.notificacoes.notificacao.repository.ConfigCanalRepository;
import br.com.sol7.olimpio.shared.PagedResponse;
import io.quarkus.hibernate.reactive.panache.common.WithTransaction;
import io.quarkus.panache.common.Page;
import io.quarkus.panache.common.Sort;
import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.NotFoundException;
import java.util.List;
import org.eclipse.microprofile.config.inject.ConfigProperty;

@ApplicationScoped
@WithTransaction
public class ConfigCanalService {

    public static final String CANAL_SISTEMA = "SISTEMA";
    public static final String CANAL_MOBILE = "MOBILE";
    public static final String CANAL_EMAIL = "EMAIL";

    public record CanaisAtivos(boolean sistema, boolean mobile, boolean email) {}

    @Inject ConfigCanalRepository repository;

    @ConfigProperty(name = "olimpio.notificacoes.canal.sistema", defaultValue = "true")
    boolean canalSistemaDefault;

    @ConfigProperty(name = "olimpio.notificacoes.canal.mobile", defaultValue = "true")
    boolean canalMobileDefault;

    @ConfigProperty(name = "olimpio.notificacoes.canal.email", defaultValue = "true")
    boolean canalEmailDefault;

    public Uni<List<ConfigCanalResponse>> list() {
        return repository.findAll(Sort.by("canal").ascending()).list()
                .map(items -> items.stream().map(this::toResponse).toList());
    }

    public Uni<PagedResponse<ConfigCanalResponse>> paged(int page, int size) {
        int p = Math.max(0, page);
        int s = (size == 10 || size == 20 || size == 50 || size == 100) ? size : 10;
        return repository.findAll(Sort.by("id").descending()).page(Page.of(p, s)).list()
                .onItem().transformToUni(items -> repository.count()
                        .map(count -> new PagedResponse<>(items.stream().map(this::toResponse).toList(), count, p, s)));
    }

    public Uni<ConfigCanalResponse> find(Long id) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("Configuração de canal não encontrada"))
                .map(this::toResponse);
    }

    public Uni<ConfigCanalResponse> create(ConfigCanalRequest r) {
        var e = new ConfigCanal();
        apply(e, r);
        e.ativo = r.ativo() == null || r.ativo();
        return repository.persist(e).replaceWith(() -> toResponse(e));
    }

    public Uni<ConfigCanalResponse> update(Long id, ConfigCanalRequest r) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("Configuração de canal não encontrada"))
                .invoke(e -> apply(e, r))
                .map(this::toResponse);
    }

    public Uni<Void> delete(Long id) {
        return repository.deleteById(id).onItem()
                .transformToUni(deleted -> deleted ? Uni.createFrom().voidItem()
                        : Uni.createFrom().failure(new NotFoundException("Configuração de canal não encontrada")));
    }

    public Uni<CanaisAtivos> canaisAtivos() {
        return repository.listAll().map(configs -> {
            boolean sistema = canalSistemaDefault;
            boolean mobile = canalMobileDefault;
            boolean email = canalEmailDefault;
            for (ConfigCanal c : configs) {
                switch (c.canal.toUpperCase().trim()) {
                    case CANAL_SISTEMA -> sistema = c.ativo;
                    case CANAL_MOBILE -> mobile = c.ativo;
                    case CANAL_EMAIL -> email = c.ativo;
                    default -> { }
                }
            }
            return new CanaisAtivos(sistema, mobile, email);
        });
    }

    private void apply(ConfigCanal e, ConfigCanalRequest r) {
        e.canal = r.canal().toUpperCase().trim();
        if (r.ativo() != null) e.ativo = r.ativo();
        e.destinatario = r.destinatario();
        e.descricao = r.descricao();
    }

    private ConfigCanalResponse toResponse(ConfigCanal e) {
        return new ConfigCanalResponse(e.id, e.canal, e.ativo, e.destinatario, e.descricao, e.createdAt, e.updatedAt);
    }
}
