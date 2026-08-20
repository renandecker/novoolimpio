package br.com.sol7.olimpio.relatorios.mapa;

import io.quarkus.hibernate.reactive.panache.common.WithTransaction;
import br.com.sol7.olimpio.shared.PagedResponse;

import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.NotFoundException;

import java.util.List;

@ApplicationScoped
@WithTransaction
public class MapaService {

    @Inject
    MapaRepository repository;

    public Uni<List<MapaResponse>> list() {
        return repository.listAll().map(items -> items.stream().map(this::toResponse).toList());
    }

    public Uni<PagedResponse<MapaResponse>> paged(int page, int size) {
        int p = Math.max(0, page);
        int s = (size == 10 || size == 20 || size == 50 || size == 100) ? size : 10;
        return repository.findAll(io.quarkus.panache.common.Sort.by("id").descending()).page(io.quarkus.panache.common.Page.of(p, s)).list()
                .onItem().transformToUni(items -> repository.count()
                        .map(count -> new PagedResponse<>(items.stream().map(this::toResponse).toList(), count, p, s)));
    }


    public Uni<MapaResponse> find(Long id) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("Mapa not found"))
                .map(this::toResponse);
    }

    public Uni<MapaResponse> create(MapaRequest r) {
        var e = new Mapa();
        apply(e, r);
        return repository.persist(e).replaceWith(() -> toResponse(e));
    }

    public Uni<MapaResponse> update(Long id, MapaRequest r) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("Mapa not found"))
                .invoke(e -> apply(e, r))
                .map(this::toResponse);
    }

    public Uni<Void> delete(Long id) {
        return repository.deleteById(id).onItem()
                .transformToUni(deleted -> deleted ? Uni.createFrom().voidItem()
                        : Uni.createFrom().failure(new NotFoundException("Mapa not found")));
    }

    private void apply(Mapa e, MapaRequest r) {
        e.nome = r.nome();
        e.todosUnidades = r.todosUnidades();
        e.todosPerfis = r.todosPerfis();
        e.todosUsuarios = r.todosUsuarios();
        e.zoom = r.zoom();
        e.coordenada = r.coordenada();
        e.utilizando = r.utilizando();
        e.altura = r.altura();
        e.markerTamanho = r.markerTamanho();
        e.dataAlteracao = r.dataAlteracao();
        e.georeferenciaId = r.georeferenciaId();
        e.dimensaoId = r.dimensaoId();
        e.medidaId = r.medidaId();
        e.estruturaId = r.estruturaId();
    }

    private MapaResponse toResponse(Mapa e) {
        return new MapaResponse(e.id, e.nome, e.todosUnidades, e.todosPerfis, e.todosUsuarios, e.zoom, e.coordenada, e.utilizando, e.altura, e.markerTamanho, e.dataAlteracao, e.georeferenciaId, e.dimensaoId, e.medidaId, e.estruturaId);
    }


    // Migrado de MapaController.autoCompleteMedida (src/main/java/br/com/sol7/olimpio/control/controllers/relatorios/MapaController.java:135, camada controller)
    // Logica original (adaptar):
    // public List<Medida> autoCompleteMedida(String query) {
    //         if (getEntity().getEstrutura() != null) {
    //             return medidaService.autoCompleteMedida(query, getEntity().getEstrutura());
    //         }
    //         return new ArrayList<>();
    //     }
    public Uni<List<Long>> autoCompleteMedida(String query) {
        // Obs: nao existe entidade/repositorio Medida neste microservico (medidaService.autoCompleteMedida)
        return Uni.createFrom().item(java.util.List.of());
    }


    // Migrado de MapaController.autoCompleteGeoreferencia (src/main/java/br/com/sol7/olimpio/control/controllers/relatorios/MapaController.java:142, camada controller)
    // Logica original (adaptar):
    // public List<Georeferencia> autoCompleteGeoreferencia(String query) {
    //         if (getEntity().getEstrutura() != null) {
    //             return georeferenciaService.autoCompleteGeoreferencia(query, getEntity().getEstrutura());
    //         }
    //         return new ArrayList<>();
    //     }
    public Uni<List<Long>> autoCompleteGeoreferencia(String query) {
        // Obs: nao existe entidade/repositorio Georeferencia neste microservico (georeferenciaService.autoCompleteGeoreferencia)
        return Uni.createFrom().item(java.util.List.of());
    }


    // Migrado de MapaController.autoCompleteDimensao (src/main/java/br/com/sol7/olimpio/control/controllers/relatorios/MapaController.java:149, camada controller)
    // Logica original (adaptar):
    // public List<Dimensao> autoCompleteDimensao(String query) {
    //         if (getEntity().getEstrutura() != null) {
    //             return dimensaoService.autoCompleteDimensao(query, getEntity().getEstrutura());
    //         }
    //         return new ArrayList<>();
    //     }
    public Uni<List<Long>> autoCompleteDimensao(String query) {
        // Obs: nao existe entidade/repositorio Dimensao neste microservico (dimensaoService.autoCompleteDimensao)
        return Uni.createFrom().item(java.util.List.of());
    }


    // Migrado de MapaService.buscarMapsPeloFato (src/main/java/br/com/sol7/olimpio/service/services/relatorios/MapaService.java:33, camada service)
    // Observacao: parametro fatoId: era Estrutura (referencia por id)
    // Logica original (adaptar):
    // public List<Mapa> buscarMapsPeloFato(Estrutura fato) {
    //         return getConexaoRepository().buscarMapsPeloFato(fato);
    //     }
    public Uni<List<Long>> buscarMapsPeloFato(Long fatoId) {
        return repository.buscarMapsPeloFato(fatoId).map(list -> list.stream().map(x -> x.id).toList());
    }


    // Migrado de MapaService.buscarUnidades (src/main/java/br/com/sol7/olimpio/service/services/relatorios/MapaService.java:37, camada service)
    // Observacao: parametro id: era Mapa (referencia por id)
    // Logica original (adaptar):
    // public List<Unidade> buscarUnidades(Mapa id) {
    //         return getConexaoRepository().buscarUnidades(id);
    //     }
    public Uni<List<Long>> buscarUnidades(Long id) {
        // Obs: depende do microservico basico (Unidade) - repository.buscarUnidades
        return Uni.createFrom().item(java.util.List.of());
    }


    // Migrado de MapaService.buscarPerfils (src/main/java/br/com/sol7/olimpio/service/services/relatorios/MapaService.java:41, camada service)
    // Observacao: parametro id: era Mapa (referencia por id)
    // Logica original (adaptar):
    // public List<Perfil> buscarPerfils(Mapa id) {
    //         return getConexaoRepository().buscarPerfils(id);
    //     }
    public Uni<List<Long>> buscarPerfils(Long id) {
        // Obs: depende do microservico basico (Perfil) - repository.buscarPerfils
        return Uni.createFrom().item(java.util.List.of());
    }


    // Migrado de MapaService.buscarUsuarios (src/main/java/br/com/sol7/olimpio/service/services/relatorios/MapaService.java:45, camada service)
    // Observacao: parametro id: era Mapa (referencia por id)
    // Logica original (adaptar):
    // public List<Usuario> buscarUsuarios(Mapa id) {
    //         return getConexaoRepository().buscarUsuarios(id);
    //     }
    public Uni<List<Long>> buscarUsuarios(Long id) {
        // Obs: depende do microservico basico (Usuario) - repository.buscarUsuarios
        return Uni.createFrom().item(java.util.List.of());
    }


    // Migrado de MapaService.autoComplete (src/main/java/br/com/sol7/olimpio/service/services/relatorios/MapaService.java:49, camada service)
    // Observacao: parametro estruturaId: era Estrutura (referencia por id)
    // Logica original (adaptar):
    // public List<Mapa> autoComplete(String query, Estrutura estrutura) {
    //         return this.getConexaoRepository().autoComplete(query.toLowerCase(), estrutura, new PageRequest(0, 10)).getContent();
    //     }
    public Uni<List<Long>> autoComplete(String query, Long estruturaId) {
        return repository.autoComplete(query.toLowerCase(), estruturaId).map(list -> list.stream().map(x -> x.id).toList());
    }

}
