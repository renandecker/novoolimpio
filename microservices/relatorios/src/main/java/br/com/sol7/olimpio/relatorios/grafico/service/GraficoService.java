package br.com.sol7.olimpio.relatorios.grafico;
import io.quarkus.hibernate.reactive.panache.common.WithTransaction;
import br.com.sol7.olimpio.shared.PagedResponse;

import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.NotFoundException;
import java.util.List;

@ApplicationScoped
@WithTransaction
public class GraficoService {

    @Inject GraficoRepository repository;

    public Uni<List<GraficoResponse>> list() {
        return repository.listAll().map(items -> items.stream().map(this::toResponse).toList());
    }

    public Uni<PagedResponse<GraficoResponse>> paged(int page, int size) {
        int p = Math.max(0, page);
        int s = (size == 10 || size == 20 || size == 50 || size == 100) ? size : 10;
        return repository.findAll(io.quarkus.panache.common.Sort.by("id").descending()).page(io.quarkus.panache.common.Page.of(p, s)).list()
                .onItem().transformToUni(items -> repository.count()
                        .map(count -> new PagedResponse<>(items.stream().map(this::toResponse).toList(), count, p, s)));
    }


    public Uni<GraficoResponse> find(Long id) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("Grafico not found"))
                .map(this::toResponse);
    }

    public Uni<GraficoResponse> create(GraficoRequest r) {
        var e = new Grafico();
        apply(e, r);
        return repository.persist(e).replaceWith(() -> toResponse(e));
    }

    public Uni<GraficoResponse> update(Long id, GraficoRequest r) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("Grafico not found"))
                .invoke(e -> apply(e, r))
                .map(this::toResponse);
    }

    public Uni<Void> delete(Long id) {
        return repository.deleteById(id).onItem()
                .transformToUni(deleted -> deleted ? Uni.createFrom().voidItem()
                        : Uni.createFrom().failure(new NotFoundException("Grafico not found")));
    }

    private void apply(Grafico e, GraficoRequest r) { e.nome = r.nome(); e.todosUnidades = r.todosUnidades(); e.todosPerfis = r.todosPerfis(); e.todosUsuarios = r.todosUsuarios(); e.formatoData = r.formatoData(); e.dataAlteracao = r.dataAlteracao(); e.tipo = r.tipo(); e.ordemGrafico = r.ordemGrafico(); e.exibirPercentual = r.exibirPercentual(); e.exibirLegenda = r.exibirLegenda(); e.colunaLegenda = r.colunaLegenda(); e.limite = r.limite(); e.coluna = r.coluna(); e.altura = r.altura(); e.margem = r.margem(); e.diametro = r.diametro(); e.exibirValor = r.exibirValor(); e.valorAcumulado = r.valorAcumulado(); e.tipoEixo = r.tipoEixo(); e.posicao = r.posicao(); e.estruturaId = r.estruturaId(); e.dimensaoReferenciaId = r.dimensaoReferenciaId(); e.dimensaoInformacaoId = r.dimensaoInformacaoId(); e.medidaInformacaoId = r.medidaInformacaoId(); e.dimensaoCombinadoId = r.dimensaoCombinadoId(); e.medidaCombinadoId = r.medidaCombinadoId(); }

    private GraficoResponse toResponse(Grafico e) {
        return new GraficoResponse(e.id, e.nome, e.todosUnidades, e.todosPerfis, e.todosUsuarios, e.formatoData, e.dataAlteracao, e.tipo, e.ordemGrafico, e.exibirPercentual, e.exibirLegenda, e.colunaLegenda, e.limite, e.coluna, e.altura, e.margem, e.diametro, e.exibirValor, e.valorAcumulado, e.tipoEixo, e.posicao, e.estruturaId, e.dimensaoReferenciaId, e.dimensaoInformacaoId, e.medidaInformacaoId, e.dimensaoCombinadoId, e.medidaCombinadoId);
    }


    // Migrado de GraficoController.autoCompleteDimensao (src/main/java/br/com/sol7/olimpio/control/controllers/relatorios/GraficoController.java:215, camada controller)
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


    // Migrado de GraficoController.autoCompleteMedida (src/main/java/br/com/sol7/olimpio/control/controllers/relatorios/GraficoController.java:249, camada controller)
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


    // Migrado de GraficoService.buscarUnidades (src/main/java/br/com/sol7/olimpio/service/services/relatorios/GraficoService.java:29, camada service)
    // Observacao: parametro id: era Grafico (referencia por id)
    // Logica original (adaptar):
    // public List<Unidade> buscarUnidades(Grafico id) {
    //         return getConexaoRepository().buscarUnidades(id);
    //     }
    public Uni<List<Long>> buscarUnidades(Long id) {
        // Obs: depende do microservico basico (Unidade) - repository.buscarUnidades
        return Uni.createFrom().item(java.util.List.of());
    }


    // Migrado de GraficoService.buscarPerfils (src/main/java/br/com/sol7/olimpio/service/services/relatorios/GraficoService.java:33, camada service)
    // Observacao: parametro id: era Grafico (referencia por id)
    // Logica original (adaptar):
    // public List<Perfil> buscarPerfils(Grafico id) {
    //         return getConexaoRepository().buscarPerfils(id);
    //     }
    public Uni<List<Long>> buscarPerfils(Long id) {
        // Obs: depende do microservico basico (Perfil) - repository.buscarPerfils
        return Uni.createFrom().item(java.util.List.of());
    }


    // Migrado de GraficoService.buscarUsuarios (src/main/java/br/com/sol7/olimpio/service/services/relatorios/GraficoService.java:37, camada service)
    // Observacao: parametro id: era Grafico (referencia por id)
    // Logica original (adaptar):
    // public List<Usuario> buscarUsuarios(Grafico id) {
    //         return getConexaoRepository().buscarUsuarios(id);
    //     }
    public Uni<List<Long>> buscarUsuarios(Long id) {
        // Obs: depende do microservico basico (Usuario) - repository.buscarUsuarios
        return Uni.createFrom().item(java.util.List.of());
    }


    // Migrado de GraficoService.buscarGraficoPeloFato (src/main/java/br/com/sol7/olimpio/service/services/relatorios/GraficoService.java:41, camada service)
    // Observacao: parametro fatoId: era Estrutura (referencia por id)
    // Logica original (adaptar):
    // public List<Grafico> buscarGraficoPeloFato(Estrutura fato) {
    //         return getConexaoRepository().buscarGraficoPeloFato(fato);
    //     }
    public Uni<List<Long>> buscarGraficoPeloFato(Long fatoId) {
        return repository.buscarGraficoPeloFato(fatoId).map(list -> list.stream().map(x -> x.id).toList());
    }


    // Migrado de GraficoService.autoComplete (src/main/java/br/com/sol7/olimpio/service/services/relatorios/GraficoService.java:45, camada service)
    // Observacao: parametro estruturaId: era Estrutura (referencia por id)
    // Logica original (adaptar):
    // public List<Grafico> autoComplete(String query, Estrutura estrutura) {
    //         return this.getConexaoRepository().autoComplete(query.toLowerCase(), estrutura, new PageRequest(0, 10)).getContent();
    //     }
    public Uni<List<Long>> autoComplete(String query, Long estruturaId) {
        return repository.autoComplete(query.toLowerCase(), estruturaId).map(list -> list.stream().map(x -> x.id).toList());
    }

}
