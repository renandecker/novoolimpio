package br.com.sol7.olimpio.curriculo.configuracao;

import br.com.sol7.olimpio.shared.PagedResponse;
import io.quarkus.hibernate.reactive.panache.common.WithTransaction;
import io.smallrye.mutiny.Uni;
import io.smallrye.mutiny.unchecked.Unchecked;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.NotFoundException;

import java.util.List;

@ApplicationScoped
@WithTransaction
public class ConfiguracaoService {

    @Inject
    ConfiguracaoRepository repository;

    public Uni<List<ConfiguracaoResponse>> list() {
        return repository.listAll().map(items -> items.stream().map(this::toResponse).toList());
    }

    public Uni<PagedResponse<ConfiguracaoResponse>> paged(int page, int size) {
        int p = Math.max(0, page);
        int s = switch (size) {
            case 10,20, 50, 100 ->size;
            default ->10;
        } ;
        return repository.findAll().page(p, s).list()
                .onItem().transformToUni(items -> repository.count()
                        .map(count -> new PagedResponse<>(items.stream().map(this::toResponse).toList(), count, p, s)));
    }

    public Uni<ConfiguracaoResponse> find(Long id) {
        return repository.findById(id)
                .onItem().ifNull().failWith(() -> new NotFoundException("Configuração não encontrada: " + id))
                .map(this::toResponse);
    }

    public Uni<ConfiguracaoResponse> create(ConfiguracaoRequest request) {
        Configuracao entity = new Configuracao();
        apply(entity, request);
        return repository.persist(entity).map(Unchecked.function(v -> toResponse(entity)));
    }

    public Uni<ConfiguracaoResponse> update(Long id, ConfiguracaoRequest request) {
        return repository.findById(id)
                .onItem().ifNull().failWith(() -> new NotFoundException("Configuração não encontrada: " + id))
                .chain(entity -> {
                    apply(entity, request);
                    return repository.persistAndFlush(entity).map(v -> toResponse(entity));
                });
    }

    public Uni<Void> delete(Long id) {
        return repository.findById(id)
                .onItem().ifNull().failWith(() -> new NotFoundException("Configuração não encontrada: " + id))
                .chain(repository::delete);
    }

    private void apply(Configuracao entity, ConfiguracaoRequest request) {
        entity.arquivoCurriculo = request.arquivo_curriculo();
        entity.sqlVariavel = request.sql_variavel();
    }

    private ConfiguracaoResponse toResponse(Configuracao entity) {
        return new ConfiguracaoResponse(
                entity.id,
                entity.arquivoCurriculo,
                entity.sqlVariavel);
    }
}
