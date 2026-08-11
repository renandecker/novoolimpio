package br.com.sol7.olimpio.central.operacional;
import io.quarkus.hibernate.reactive.panache.common.WithTransaction;
import br.com.sol7.olimpio.shared.PagedResponse;

import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.NotFoundException;
import java.util.List;

@ApplicationScoped
@WithTransaction
public class OperacionalService {

    @Inject OperacionalRepository repository;

    // Migrado de SchedulingService.verificarOperacionalVencidos()
    public Uni<Void> verificarOperacionalVencidos() {
        return repository.buscarOperacionalExpirados()
                .chain(lista -> {
                    Uni<Void> chain = Uni.createFrom().voidItem();
                    for (var op : lista) {
                        chain = chain.chain(() -> repository.atualizarStatusExpirado(op.id).replaceWithVoid());
                    }
                    return chain;
                });
    }

    public Uni<List<OperacionalResponse>> list() {
        return repository.listAll().map(items -> items.stream().map(this::toResponse).toList());
    }

    public Uni<PagedResponse<OperacionalResponse>> paged(int page, int size) {
        int p = Math.max(0, page);
        int s = (size == 10 || size == 20 || size == 50 || size == 100) ? size : 10;
        return repository.findAll(io.quarkus.panache.common.Sort.by("id").descending()).page(io.quarkus.panache.common.Page.of(p, s)).list()
                .onItem().transformToUni(items -> repository.count()
                        .map(count -> new PagedResponse<>(items.stream().map(this::toResponse).toList(), count, p, s)));
    }


    public Uni<OperacionalResponse> find(Long id) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("Operacional not found"))
                .map(this::toResponse);
    }

    public Uni<OperacionalResponse> create(OperacionalRequest r) {
        var e = new Operacional();
        apply(e, r);
        return repository.persist(e).replaceWith(() -> toResponse(e));
    }

    public Uni<OperacionalResponse> update(Long id, OperacionalRequest r) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("Operacional not found"))
                .invoke(e -> apply(e, r))
                .map(this::toResponse);
    }

    public Uni<Void> delete(Long id) {
        return repository.deleteById(id).onItem()
                .transformToUni(deleted -> deleted ? Uni.createFrom().voidItem()
                        : Uni.createFrom().failure(new NotFoundException("Operacional not found")));
    }

    private void apply(Operacional e, OperacionalRequest r) { e.pacoteId = r.pacoteId(); e.status = r.status(); e.direcionamento = r.direcionamento(); e.coordenadorId = r.coordenadorId(); }

    private OperacionalResponse toResponse(Operacional e) {
        return new OperacionalResponse(e.id, e.pacoteId, e.status, e.direcionamento, e.coordenadorId);
    }


    // Migrado de OperacionalController.buscarOperacionaisDoCoordenador (src/main/java/br/com/sol7/olimpio/control/controllers/central/OperacionalController.java:235, camada controller)
    // Logica original (adaptar):
    // public List<Operacional> buscarOperacionaisDoCoordenador() {
    //         if (!ObjectUtil.nullOrEmpty(operacionalService.buscarOperacionaisDoCoordenador(usuarioLogadoController.getUsuario()))) {
    //             return operacionalService.buscarOperacionaisDoCoordenador(usuarioLogadoController.getUsuario());
    //         }
    //         return new ArrayList<>();
    //     }
    public Uni<List<Long>> buscarOperacionaisDoCoordenador() {
        // Obs: depende do usuario logado do microservico basico; usar buscarOperacionaisDoCoordenador2(coordenadorId)
        return Uni.createFrom().item(java.util.List.of());
    }


    // Migrado de OperacionalController.buscarFiltros (src/main/java/br/com/sol7/olimpio/control/controllers/central/OperacionalController.java:242, camada controller)
    // Observacao: parametro operacionalId: era Operacional (referencia por id)
    // Logica original (adaptar):
    // public void buscarFiltros(Operacional operacional) {
    //         if (!ObjectUtil.nullOrEmpty(operacional)) {
    //             filtroPacotes = pacoteService.buscarFiltrosUtilizados(operacional.getPacote());
    //         } else {
    //             filtroPacotes = new ArrayList<>();
    //         }
    // 
    //         filtrosAcao = (List<String>) hibernateService.executeSQL("SELECT distinct(descricao) " +
    //                 "  FROM cen_operacional op" +
    //                 "  inner join com_pacote_prospecto pac on (op.id_pacote = pac.id_pacote)" +
    //                 "  inner join com_historico_acoes hit on (pac.id_prospecto = hit.id_prospecto)" +
    //                 "  inner join com_acao a on (a.id = hit.id_acao) where op.id = " + operacional. ...
    // // ... (truncado, ver fonte original)
    public Uni<Void> buscarFiltros(Long operacionalId) {
        // Obs: logica de UI do controlador JSF legado e depende do microservico comercial (pacoteService/hibernateService)
        return Uni.createFrom().voidItem();
    }


    // Migrado de OperacionalController.buscarTodos (src/main/java/br/com/sol7/olimpio/control/controllers/central/OperacionalController.java:259, camada controller)
    // Logica original (adaptar):
    // public void buscarTodos() {
    //         if (!ObjectUtil.nullOrEmpty(operacional)) {
    //             buscarLigacoes(operacional);
    //         }
    //     }
    public Uni<Void> buscarTodos() {
        // Obs: logica de UI do controlador JSF legado (navegacao de tela), sem equivalente reativo
        return Uni.createFrom().voidItem();
    }


    // Migrado de OperacionalController.buscarProspectos (src/main/java/br/com/sol7/olimpio/control/controllers/central/OperacionalController.java:270, camada controller)
    // Observacao: parametro opId: era Operacional (referencia por id)
    // Logica original (adaptar):
    // public void buscarProspectos(Operacional op) {
    //         prospectos = operacionalService.buscarProspectos(op);
    //     }
    public Uni<Void> buscarProspectos(Long opId) {
        // Obs: logica de UI do controlador JSF legado (estado prospectos) e depende do microservico comercial (Prospecto)
        return Uni.createFrom().voidItem();
    }


    // Migrado de OperacionalController.buscarLigacoes (src/main/java/br/com/sol7/olimpio/control/controllers/central/OperacionalController.java:274, camada controller)
    // Observacao: parametro opId: era Operacional (referencia por id)
    // Logica original (adaptar):
    // public void buscarLigacoes(Operacional op) {
    //         if (!ObjectUtil.nullOrEmpty(op)) {
    //             operacional = op;
    //             pieModel = new PieChartModel();
    //             long total = 0;
    //             for (ResultadoContato resultadoContato : resultadoContatoService.findAll()) {
    //                 long valor = ligacaoService.resultadoPorOperacional(operacional, resultadoContato.getId());
    //                 pieModel.set(resultadoContato.getDescricao() + ": " + valor, valor);
    //                 total = total + valor;
    //             }
    //             pieModel.set("Total: " + total, 0);
    //             pieModel.setTitle(titulo);
    // // ... (truncado, ver fonte original)
    public Uni<Void> buscarLigacoes(Long opId) {
        // Obs: logica de UI do controlador JSF legado (pie chart), sem equivalente reativo
        return Uni.createFrom().voidItem();
    }


    // Migrado de OperacionalController.buscarLigacoesComUsuario (src/main/java/br/com/sol7/olimpio/control/controllers/central/OperacionalController.java:298, camada controller)
    // Logica original (adaptar):
    // public void buscarLigacoesComUsuario() {
    //         pieModel = new PieChartModel();
    //         long total = 0;
    //         titulo = "Ligações do(a): " + usuarioSelecionado.getLogin();
    //         pieModel.setTitle(titulo);
    //         pieModel.setLegendPosition("w");
    //         pieModel.setFill(false);
    //         pieModel.setShowDataLabels(true);
    //         pieModel.setDiameter(250);
    //         pieModel.setSliceMargin(2);
    //         pieModel.setDataFormat("value");
    //         pieModel.setSeriesColors("E60000,FF00C4,C400FF,B17BEF,0E00A5,00C2BF,00C20A,D7E203,A57306,727272,222222,FFFFFF");
    // // ... (truncado, ver fonte original)
    public Uni<Void> buscarLigacoesComUsuario() {
        // Obs: logica de UI do controlador JSF legado (pie chart), sem equivalente reativo
        return Uni.createFrom().voidItem();
    }


    // Migrado de OperacionalService.buscarOperacionalComCoordenador (src/main/java/br/com/sol7/olimpio/service/services/central/OperacionalService.java:32, camada service)
    // Observacao: retorno: era Operacional (referencia por id)
    // JPQL original: select op from Operacional op left join fetch op.coordenador where op.id = ?1
    // Logica original (adaptar):
    // public Operacional buscarOperacionalComCoordenador(Integer id) {
    //         return getOperacionalRepository().buscarOperacionalComCoordenador(id);
    //     }
    public Uni<Long> buscarOperacionalComCoordenador(Integer id) {
                return repository.buscarOperacionalComCoordenador(id).map(list -> list.isEmpty() ? null : list.get(0).id);
    }


    // Migrado de OperacionalService.buscarOperacionaisDoCoordenador (src/main/java/br/com/sol7/olimpio/service/services/central/OperacionalService.java:36, camada service)
    // Observacao: parametro coordenadorId: era Usuario (referencia por id)
    // Logica original (adaptar):
    // public List<Operacional> buscarOperacionaisDoCoordenador(Usuario coordenador) {
    //         return getOperacionalRepository().buscarOperacionaisDoCoordenador(coordenador);
    //     }
    public Uni<List<Long>> buscarOperacionaisDoCoordenador2(Long coordenadorId) {
                return repository.find("coordenadorId = ?1 and status = 'INICIADO'", coordenadorId).list().map(list -> list.stream().map(x -> x.id).toList());
    }


    // Migrado de OperacionalService.buscarCoordenadorOperacional (src/main/java/br/com/sol7/olimpio/service/services/central/OperacionalService.java:40, camada service)
    // Observacao: retorno: era Usuario (referencia por id); parametro operacionalId: era Operacional (referencia por id)
    // JPQL original: Select o.coordenador from Operacional o where o = ?1
    // Logica original (adaptar):
    // public Usuario buscarCoordenadorOperacional(Operacional operacional) {
    //         return getOperacionalRepository().buscarCoordenadorOperacional(operacional);
    //     }
    public Uni<Long> buscarCoordenadorOperacional(Long operacionalId) {
        return repository.buscarCoordenadorOperacional(operacionalId).map(list -> list.isEmpty() ? null : ((Number) list.get(0)).longValue());
    }

}
