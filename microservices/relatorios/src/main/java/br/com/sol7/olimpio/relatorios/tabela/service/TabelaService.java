package br.com.sol7.olimpio.relatorios.tabela;
import io.quarkus.hibernate.reactive.panache.common.WithTransaction;
import br.com.sol7.olimpio.shared.PagedResponse;

import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.NotFoundException;
import java.util.List;

@ApplicationScoped
@WithTransaction
public class TabelaService {

    @Inject TabelaRepository repository;

    public Uni<List<TabelaResponse>> list() {
        return repository.listAll().map(items -> items.stream().map(this::toResponse).toList());
    }

    public Uni<PagedResponse<TabelaResponse>> paged(int page, int size) {
        int p = Math.max(0, page);
        int s = (size == 10 || size == 20 || size == 50 || size == 100) ? size : 10;
        return repository.findAll(io.quarkus.panache.common.Sort.by("id").descending()).page(io.quarkus.panache.common.Page.of(p, s)).list()
                .onItem().transformToUni(items -> repository.count()
                        .map(count -> new PagedResponse<>(items.stream().map(this::toResponse).toList(), count, p, s)));
    }


    public Uni<TabelaResponse> find(Long id) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("Tabela not found"))
                .map(this::toResponse);
    }

    public Uni<TabelaResponse> create(TabelaRequest r) {
        var e = new Tabela();
        apply(e, r);
        return repository.persist(e).replaceWith(() -> toResponse(e));
    }

    public Uni<TabelaResponse> update(Long id, TabelaRequest r) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("Tabela not found"))
                .invoke(e -> apply(e, r))
                .map(this::toResponse);
    }

    public Uni<Void> delete(Long id) {
        return repository.deleteById(id).onItem()
                .transformToUni(deleted -> deleted ? Uni.createFrom().voidItem()
                        : Uni.createFrom().failure(new NotFoundException("Tabela not found")));
    }

    private void apply(Tabela e, TabelaRequest r) { e.nome = r.nome(); e.dataCadastro = r.dataCadastro(); e.dataAlteracao = r.dataAlteracao(); e.todosUnidades = r.todosUnidades(); e.todosPerfis = r.todosPerfis(); e.todosUsuarios = r.todosUsuarios(); e.estruturaId = r.estruturaId(); }

    private TabelaResponse toResponse(Tabela e) {
        return new TabelaResponse(e.id, e.nome, e.dataCadastro, e.dataAlteracao, e.todosUnidades, e.todosPerfis, e.todosUsuarios, e.estruturaId);
    }


    // Migrado de TabelaController.gerarSql (src/main/java/br/com/sol7/olimpio/control/controllers/relatorios/TabelaController.java:184, camada controller)
    // Logica original (adaptar):
    // public String gerarSql() {
    //         List<TabelaWapper> tabelaWapper = new ArrayList<>((Collection<? extends TabelaWapper>) lazyTabelaWapper.getWrappedData());
    //         return tabelaWapper.get(0).getSql();
    //     }
    public Uni<String> gerarSql() {
        // Obs: logica de UI do controlador JSF legado (lazyTabelaWapper com dados da tela), sem equivalente reativo
        return Uni.createFrom().item(null);
    }


    // Migrado de TabelaController.buscarMedidas (src/main/java/br/com/sol7/olimpio/control/controllers/relatorios/TabelaController.java:269, camada controller)
    // Observacao: parametro fatoId: era Estrutura (referencia por id)
    // Logica original (adaptar):
    // public void buscarMedidas(Estrutura fato) {
    //         if (fato != null) {
    //             medidas = medidaService.buscarMedidasPeloFato(fato);
    //         } else {
    //             medidas = new ArrayList<>();
    //         }
    //     }
    public Uni<Void> buscarMedidas(Long fatoId) {
        // Obs: nao existe entidade/repositorio Medida neste microservico (medidaService.buscarMedidasPeloFato)
        return Uni.createFrom().voidItem();
    }


    // Migrado de TabelaController.buscarDimensoesDescritivo (src/main/java/br/com/sol7/olimpio/control/controllers/relatorios/TabelaController.java:277, camada controller)
    // Observacao: parametro fatoId: era Estrutura (referencia por id)
    // Logica original (adaptar):
    // public void buscarDimensoesDescritivo(Estrutura fato) {
    //         if (fato != null) {
    //             dimensaos = dimensaoService.buscarDimensaoComEstrutura(fato);
    //         } else {
    //             dimensaos = new ArrayList<>();
    //         }
    //     }
    public Uni<Void> buscarDimensoesDescritivo(Long fatoId) {
        // Obs: nao existe entidade/repositorio Dimensao neste microservico (dimensaoService.buscarDimensaoComEstrutura)
        return Uni.createFrom().voidItem();
    }


    // Migrado de TabelaController.buscarDimensoesTempo (src/main/java/br/com/sol7/olimpio/control/controllers/relatorios/TabelaController.java:316, camada controller)
    // Observacao: parametro fatoId: era Estrutura (referencia por id)
    // Logica original (adaptar):
    // public void buscarDimensoesTempo(Estrutura fato) {
    //         if (fato != null) {
    //             dimensaosTempo = dimensaoService.buscarDimensaoTempoComEstrutura(fato);
    //         } else {
    //             dimensaosTempo = new ArrayList<>();
    //         }
    //     }
    public Uni<Void> buscarDimensoesTempo(Long fatoId) {
        // Obs: nao existe entidade/repositorio Dimensao neste microservico (dimensaoService.buscarDimensaoTempoComEstrutura)
        return Uni.createFrom().voidItem();
    }


    // Migrado de TabelaService.buscarUnidades (src/main/java/br/com/sol7/olimpio/service/services/relatorios/TabelaService.java:33, camada service)
    // Observacao: parametro id: era Tabela (referencia por id)
    // Logica original (adaptar):
    // public List<Unidade> buscarUnidades(Tabela id) {
    //         return getConexaoRepository().buscarUnidades(id);
    //     }
    public Uni<List<Long>> buscarUnidades(Long id) {
        // Obs: depende do microservico basico (Unidade) - repository.buscarUnidades
        return Uni.createFrom().item(java.util.List.of());
    }


    // Migrado de TabelaService.buscarPerfils (src/main/java/br/com/sol7/olimpio/service/services/relatorios/TabelaService.java:37, camada service)
    // Observacao: parametro id: era Tabela (referencia por id)
    // Logica original (adaptar):
    // public List<Perfil> buscarPerfils(Tabela id) {
    //         return getConexaoRepository().buscarPerfils(id);
    //     }
    public Uni<List<Long>> buscarPerfils(Long id) {
        // Obs: depende do microservico basico (Perfil) - repository.buscarPerfils
        return Uni.createFrom().item(java.util.List.of());
    }


    // Migrado de TabelaService.buscarUsuarios (src/main/java/br/com/sol7/olimpio/service/services/relatorios/TabelaService.java:41, camada service)
    // Observacao: parametro id: era Tabela (referencia por id)
    // Logica original (adaptar):
    // public List<Usuario> buscarUsuarios(Tabela id) {
    //         return getConexaoRepository().buscarUsuarios(id);
    //     }
    public Uni<List<Long>> buscarUsuarios(Long id) {
        // Obs: depende do microservico basico (Usuario) - repository.buscarUsuarios
        return Uni.createFrom().item(java.util.List.of());
    }


    // Migrado de TabelaService.buscarTabelaPeloFato (src/main/java/br/com/sol7/olimpio/service/services/relatorios/TabelaService.java:45, camada service)
    // Observacao: parametro fatoId: era Estrutura (referencia por id)
    // Logica original (adaptar):
    // public List<Tabela> buscarTabelaPeloFato(Estrutura fato) {
    //         return getConexaoRepository().buscarTabelaPeloFato(fato);
    //     }
    public Uni<List<Long>> buscarTabelaPeloFato(Long fatoId) {
        return repository.buscarTabelaPeloFato(fatoId).map(list -> list.stream().map(x -> x.id).toList());
    }


    // Migrado de TabelaService.autoComplete (src/main/java/br/com/sol7/olimpio/service/services/relatorios/TabelaService.java:49, camada service)
    // Observacao: parametro estruturaId: era Estrutura (referencia por id)
    // Logica original (adaptar):
    // public List<Tabela> autoComplete(String query, Estrutura estrutura) {
    //         return this.getConexaoRepository().autoComplete(query.toLowerCase(), estrutura, new PageRequest(0, 10)).getContent();
    //     }
    public Uni<List<Long>> autoComplete(String query, Long estruturaId) {
        return repository.autoComplete(query.toLowerCase(), estruturaId).map(list -> list.stream().map(x -> x.id).toList());
    }

}
