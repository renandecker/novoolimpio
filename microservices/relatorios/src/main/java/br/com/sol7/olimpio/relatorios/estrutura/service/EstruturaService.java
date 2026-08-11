package br.com.sol7.olimpio.relatorios.estrutura;
import io.quarkus.hibernate.reactive.panache.common.WithTransaction;
import br.com.sol7.olimpio.shared.PagedResponse;

import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.NotFoundException;
import java.util.List;

@ApplicationScoped
@WithTransaction
public class EstruturaService {

    @Inject EstruturaRepository repository;

    public Uni<List<EstruturaResponse>> list() {
        return repository.listAll().map(items -> items.stream().map(this::toResponse).toList());
    }

    public Uni<PagedResponse<EstruturaResponse>> paged(int page, int size) {
        int p = Math.max(0, page);
        int s = (size == 10 || size == 20 || size == 50 || size == 100) ? size : 10;
        return repository.findAll(io.quarkus.panache.common.Sort.by("id").descending()).page(io.quarkus.panache.common.Page.of(p, s)).list()
                .onItem().transformToUni(items -> repository.count()
                        .map(count -> new PagedResponse<>(items.stream().map(this::toResponse).toList(), count, p, s)));
    }


    public Uni<EstruturaResponse> find(Long id) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("Estrutura not found"))
                .map(this::toResponse);
    }

    public Uni<EstruturaResponse> create(EstruturaRequest r) {
        var e = new Estrutura();
        apply(e, r);
        return repository.persist(e).replaceWith(() -> toResponse(e));
    }

    public Uni<EstruturaResponse> update(Long id, EstruturaRequest r) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("Estrutura not found"))
                .invoke(e -> apply(e, r))
                .map(this::toResponse);
    }

    public Uni<Void> delete(Long id) {
        return repository.deleteById(id).onItem()
                .transformToUni(deleted -> deleted ? Uni.createFrom().voidItem()
                        : Uni.createFrom().failure(new NotFoundException("Estrutura not found")));
    }

    private void apply(Estrutura e, EstruturaRequest r) { e.tabela = r.tabela(); e.condicao = r.condicao(); e.nome = r.nome(); e.zoom = r.zoom(); e.configuracaoEmailId = r.configuracaoEmailId(); e.dataAtualizacao = r.dataAtualizacao(); e.coordenada = r.coordenada(); e.nomeBanco = r.nomeBanco(); }

    private EstruturaResponse toResponse(Estrutura e) {
        return new EstruturaResponse(e.id, e.tabela, e.condicao, e.nome, e.zoom, e.configuracaoEmailId, e.dataAtualizacao, e.coordenada, e.nomeBanco);
    }


    // Migrado de EstruturaController.autoComplete (src/main/java/br/com/sol7/olimpio/control/controllers/relatorios/EstruturaController.java:105, camada controller)
    // Logica original (adaptar):
    // public List<Estrutura> autoComplete(String query) {
    //         return estruturaService.autoComplete(query);
    //     }
    public Uni<List<Long>> autoComplete(String query) {
        return repository.autoComplete(query.toLowerCase()).map(list -> list.stream().map(x -> x.id).toList());
    }


    // Migrado de EstruturaService.buscarBancos (src/main/java/br/com/sol7/olimpio/service/services/relatorios/EstruturaService.java:26, camada service)
    // Logica original (adaptar):
    // public List<Estrutura> buscarBancos(String banco) {
    //         return getEstruturaRepository().buscarBancos(banco);
    //     }
    public Uni<List<Long>> buscarBancos(String banco) {
                return repository.find("nomeBanco = ?1 order by id desc", banco).list().map(list -> list.stream().map(x -> x.id).toList());
    }


    // Migrado de EstruturaService.buscarBancosComId (src/main/java/br/com/sol7/olimpio/service/services/relatorios/EstruturaService.java:30, camada service)
    // Logica original (adaptar):
    // public List<Estrutura> buscarBancosComId(String banco, Long id) {
    //         return getEstruturaRepository().buscarBancosComId(banco, id);
    //     }
    public Uni<List<Long>> buscarBancosComId(String banco, Long id) {
                return repository.find("nomeBanco = ?1 and id <> ?2 order by id desc", banco, id).list().map(list -> list.stream().map(x -> x.id).toList());
    }

}
