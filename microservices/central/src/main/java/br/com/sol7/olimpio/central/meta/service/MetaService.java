package br.com.sol7.olimpio.central.meta;
import io.quarkus.hibernate.reactive.panache.common.WithTransaction;
import br.com.sol7.olimpio.shared.PagedResponse;

import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.NotFoundException;
import java.util.List;
import java.util.Date;

@ApplicationScoped
@WithTransaction
public class MetaService {

    @Inject MetaRepository repository;

    public Uni<List<MetaResponse>> list() {
        return repository.listAll().map(items -> items.stream().map(this::toResponse).toList());
    }

    public Uni<PagedResponse<MetaResponse>> paged(int page, int size) {
        int p = Math.max(0, page);
        int s = (size == 10 || size == 20 || size == 50 || size == 100) ? size : 10;
        return repository.findAll(io.quarkus.panache.common.Sort.by("id").descending()).page(io.quarkus.panache.common.Page.of(p, s)).list()
                .onItem().transformToUni(items -> repository.count()
                        .map(count -> new PagedResponse<>(items.stream().map(this::toResponse).toList(), count, p, s)));
    }


    public Uni<MetaResponse> find(Long id) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("Meta not found"))
                .map(this::toResponse);
    }

    public Uni<MetaResponse> create(MetaRequest r) {
        var e = new Meta();
        apply(e, r);
        return repository.persist(e).replaceWith(() -> toResponse(e));
    }

    public Uni<MetaResponse> update(Long id, MetaRequest r) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("Meta not found"))
                .invoke(e -> apply(e, r))
                .map(this::toResponse);
    }

    public Uni<Void> delete(Long id) {
        return repository.deleteById(id).onItem()
                .transformToUni(deleted -> deleted ? Uni.createFrom().voidItem()
                        : Uni.createFrom().failure(new NotFoundException("Meta not found")));
    }

    private void apply(Meta e, MetaRequest r) { e.operadorId = r.operadorId(); e.meta = r.meta(); e.data = r.data(); e.dataInicial = r.dataInicial(); e.dataFinal = r.dataFinal(); e.operacionalId = r.operacionalId(); e.usuarioId = r.usuarioId(); }

    private MetaResponse toResponse(Meta e) {
        return new MetaResponse(e.id, e.operadorId, e.meta, e.data, e.dataInicial, e.dataFinal, e.operacionalId, e.usuarioId);
    }


    // Migrado de MetaController.atualizarOperadores (src/main/java/br/com/sol7/olimpio/control/controllers/central/MetaController.java:183, camada controller)
    // Observacao: parametro event: era SelectEvent no legado
    // Logica original (adaptar):
    // public void atualizarOperadores(SelectEvent event) {
    //         operadores = usuariosDisponiveis((Date) event.getObject());
    //     }
    public Uni<Void> atualizarOperadores(String event) {
        // Obs: logica de UI do controlador JSF legado (selecao de operadores), sem equivalente reativo
        return Uni.createFrom().voidItem();
    }


    // Migrado de MetaController.buscarMetaOperadorDia (src/main/java/br/com/sol7/olimpio/control/controllers/central/MetaController.java:203, camada controller)
    // Logica original (adaptar):
    // public List<Meta> buscarMetaOperadorDia() {
    //         List<Meta> metas = metaService.buscarConflitoDatasComEquipe(getEntity().getDataInicial(), getEntity().getDataFinal(), getEntity().getOperacional());
    //         return metas;
    //     }
    public Uni<List<Long>> buscarMetaOperadorDia() {
        // Obs: logica de UI do controlador JSF legado (dados da entidade da tela), sem equivalente reativo
        return Uni.createFrom().item(java.util.List.of());
    }


    // Migrado de MetaService.buscarMetaOperadorDia (src/main/java/br/com/sol7/olimpio/service/services/central/MetaService.java:38, camada service)
    // Observacao: parametro operadorId: era Usuario (referencia por id)
    // Logica original (adaptar):
    // public Integer buscarMetaOperadorDia(Date data, Usuario operador) {
    //         List<Meta> lista = getMetaRepository().buscarMetaOperadorDia(data, operador, new PageRequest(0, 1)).getContent();
    // 
    //         if (ObjectUtil.nullOrEmpty(lista)) {
    //             return null;
    //         }
    //         Meta meta = lista.get(0);
    //         return meta.getMeta();
    //     }
    public Uni<Integer> buscarMetaOperadorDia2(Date data, Long operadorId) {
        return repository.buscarMetaOperadorDia(data, operadorId).map(list -> list.isEmpty() ? null : list.get(0).meta);
    }


    // Migrado de MetaService.buscarMetaOperador (src/main/java/br/com/sol7/olimpio/service/services/central/MetaService.java:48, camada service)
    // Observacao: parametro operadorId: era Usuario (referencia por id)
    // Logica original (adaptar):
    // public Integer buscarMetaOperador(Date data, Usuario operador) {
    //         List<Meta> lista = getMetaRepository().buscarMetaOperador(data, operador, new PageRequest(0, 1)).getContent();
    // 
    //         if (ObjectUtil.nullOrEmpty(lista)) {
    //             return null;
    //         }
    //         Meta meta = lista.get(0);
    //         return meta.getMeta();
    //     }
    public Uni<Integer> buscarMetaOperador(Date data, Long operadorId) {
        return repository.buscarMetaOperador(data, operadorId).map(list -> list.isEmpty() ? null : list.get(0).meta);
    }


    // Migrado de MetaService.buscarConflitoDatasComEquipe (src/main/java/br/com/sol7/olimpio/service/services/central/MetaService.java:58, camada service)
    // Observacao: parametro operacionalId: era Operacional (referencia por id)
    // Logica original (adaptar):
    // public List<Meta> buscarConflitoDatasComEquipe(Date dataInicial, Date dataFinal, Operacional operacional) {
    //         return getMetaRepository().buscarConflitoDatasComEquipe(dataInicial, dataFinal, operacional);
    //     }
    public Uni<List<Long>> buscarConflitoDatasComEquipe(Date dataInicial, Date dataFinal, Long operacionalId) {
                return repository.find("operacionalId=?3 and (dataInicial BETWEEN ?1 AND ?2 or dataFinal BETWEEN ?1 AND ?2)", dataInicial, dataFinal, operacionalId).list().map(list -> list.stream().map(x -> x.id).toList());
    }


    // Migrado de MetaService.buscarConflitoDatasComEquipeComMeta (src/main/java/br/com/sol7/olimpio/service/services/central/MetaService.java:62, camada service)
    // Observacao: parametro operacionalId: era Operacional (referencia por id)
    // Logica original (adaptar):
    // public List<Meta> buscarConflitoDatasComEquipeComMeta(Date dataInicial, Date dataFinal, Operacional operacional, int id) {
    //         return getMetaRepository().buscarConflitoDatasComEquipeComMeta(dataInicial, dataFinal, operacional, id);
    //     }
    public Uni<List<Long>> buscarConflitoDatasComEquipeComMeta(Date dataInicial, Date dataFinal, Long operacionalId, Integer id) {
                return repository.find("operacionalId=?3 and (dataInicial BETWEEN ?1 AND ?2 or dataFinal BETWEEN ?1 AND ?2) and id <> ?4", dataInicial, dataFinal, operacionalId, id).list().map(list -> list.stream().map(x -> x.id).toList());
    }


    // Migrado de MetaService.buscarConflitoDatasComOperador (src/main/java/br/com/sol7/olimpio/service/services/central/MetaService.java:66, camada service)
    // Observacao: parametro operadorId: era Usuario (referencia por id)
    // Logica original (adaptar):
    // public List<Meta> buscarConflitoDatasComOperador(Date dataInicial, Date dataFinal, Usuario operador) {
    //         return getMetaRepository().buscarConflitoDatasComOperador(dataInicial, dataFinal, operador);
    //     }
    public Uni<List<Long>> buscarConflitoDatasComOperador(Date dataInicial, Date dataFinal, Long operadorId) {
                return repository.find("operadorId=?3 and (dataInicial BETWEEN ?1 AND ?2 or dataFinal BETWEEN ?1 AND ?2)", dataInicial, dataFinal, operadorId).list().map(list -> list.stream().map(x -> x.id).toList());
    }


    // Migrado de MetaService.buscarConflitoDatasComOperadorComMeta (src/main/java/br/com/sol7/olimpio/service/services/central/MetaService.java:70, camada service)
    // Observacao: parametro operadorId: era Usuario (referencia por id)
    // Logica original (adaptar):
    // public List<Meta> buscarConflitoDatasComOperadorComMeta(Date dataInicial, Date dataFinal, Usuario operador, int id) {
    //         return getMetaRepository().buscarConflitoDatasComOperadorComMeta(dataInicial, dataFinal, operador, id);
    //     }
    public Uni<List<Long>> buscarConflitoDatasComOperadorComMeta(Date dataInicial, Date dataFinal, Long operadorId, Integer id) {
                return repository.find("operadorId=?3 and (dataInicial BETWEEN ?1 AND ?2 or dataFinal BETWEEN ?1 AND ?2) and id <> ?4", dataInicial, dataFinal, operadorId, id).list().map(list -> list.stream().map(x -> x.id).toList());
    }


    // Migrado de MetaService.buscarMetaOperadorPeriodo (src/main/java/br/com/sol7/olimpio/service/services/central/MetaService.java:74, camada service)
    // Observacao: parametro operadorId: era Usuario (referencia por id)
    // Logica original (adaptar):
    // public Integer buscarMetaOperadorPeriodo(Date data, Usuario operador) {
    //         List<Meta> lista = getMetaRepository().buscarMetaOperadorPeriodo(data, operador, new PageRequest(0, 1)).getContent();
    // 
    //         if (ObjectUtil.nullOrEmpty(lista)) {
    //             return null;
    //         }
    //         Meta meta = lista.get(0);
    //         return meta.getMeta();
    //     }
    public Uni<Integer> buscarMetaOperadorPeriodo(Date data, Long operadorId) {
        return repository.buscarMetaOperadorPeriodo(data, operadorId).map(list -> list.isEmpty() ? null : list.get(0).meta);
    }

}
