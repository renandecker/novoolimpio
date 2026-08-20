package br.com.sol7.olimpio.central.coordenador;

import io.quarkus.hibernate.reactive.panache.common.WithTransaction;
import br.com.sol7.olimpio.shared.PagedResponse;
import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.NotFoundException;

import java.util.List;

import io.smallrye.mutiny.Uni;

@ApplicationScoped
@WithTransaction
public class CoordenadorService {
    @Inject
    CoordenadorRepository repository;

    public Uni<List<CoordenadorResponse>> list() {
        return repository.listAll().map(items -> items.stream().map(this::toResponse).toList());
    }

    public Uni<PagedResponse<CoordenadorResponse>> paged(int page, int size) {
        int p = Math.max(0, page);
        int s = (size == 10 || size == 20 || size == 50 || size == 100) ? size : 10;
        return repository.findAll(io.quarkus.panache.common.Sort.by("id").descending()).page(io.quarkus.panache.common.Page.of(p, s)).list()
                .onItem().transformToUni(items -> repository.count()
                        .map(count -> new PagedResponse<>(items.stream().map(this::toResponse).toList(), count, p, s)));
    }

    public Uni<CoordenadorResponse> find(Long id) {
        return repository.findById(id).onItem().ifNull().failWith(() -> new NotFoundException("Coordenador not found")).map(this::toResponse);
    }

    public Uni<CoordenadorResponse> create(CoordenadorRequest r) {
        var e = new Coordenador();
        apply(e, r);
        return repository.persist(e).replaceWith(() -> toResponse(e));
    }

    public Uni<CoordenadorResponse> update(Long id, CoordenadorRequest r) {
        return repository.findById(id).onItem().ifNull().failWith(() -> new NotFoundException("Coordenador not found")).invoke(e -> apply(e, r)).map(this::toResponse);
    }

    public Uni<Void> delete(Long id) {
        return repository.deleteById(id).onItem().transformToUni(deleted -> deleted ? Uni.createFrom().voidItem() : Uni.createFrom().failure(new NotFoundException("Coordenador not found")));
    }

    private void apply(Coordenador e, CoordenadorRequest r) {
        e.nome = r.nome();
        e.dadosJson = r.dadosJson();
    }

    private CoordenadorResponse toResponse(Coordenador e) {
        return new CoordenadorResponse(e.id, e.nome, e.dadosJson);
    }

    // Migrado de CoordenadorController.autoCompleteCoordenador (src/main/java/br/com/sol7/olimpio/control/controllers/central/CoordenadorController.java:121, camada controller)
    // Logica original (adaptar):
    // public List<Usuario> autoCompleteCoordenador(String query) {
    //         return operadorService.autoCompleteCoordenador(query);
    //     }
    public Uni<List<Long>> autoCompleteCoordenador(String query) {
        return repository.find("lower(nome) like '%' || ?1 || '%' order by nome", query.toLowerCase()).list().map(list -> list.stream().map(x -> x.id).toList());
    }


    // Migrado de CoordenadorController.buscarLigacoesPrioritarias (src/main/java/br/com/sol7/olimpio/control/controllers/central/CoordenadorController.java:548, camada controller)
    // Logica original (adaptar):
    // public void buscarLigacoesPrioritarias() {
    //         filaPrioritarias = filaPrioritariaService.buscarFilaPriotitariaAtivas();
    //         if (ObjectUtil.nullOrEmpty(filaPrioritarias)) {
    //             filaPrioritarias = new ArrayList<>();
    //         }
    //     }
    public Uni<Void> buscarLigacoesPrioritarias() {
        // Obs: depende do microservico filaprioritaria (filaPrioritariaService)
        return Uni.createFrom().voidItem();
    }


    // Migrado de CoordenadorController.buscarLigacoes (src/main/java/br/com/sol7/olimpio/control/controllers/central/CoordenadorController.java:644, camada controller)
    // Observacao: parametro opId: era Operador (referencia por id)
    // Logica original (adaptar):
    // public void buscarLigacoes(Operador op) {
    //         pieModel = new PieChartModel();
    //         long total = 0;
    //         pieModel.setTitle("Ligações de " + op.getOperador().getLogin());
    //         pieModel.setLegendPosition("w");
    //         pieModel.setFill(false);
    //         pieModel.setShowDataLabels(true);
    //         pieModel.setDiameter(250);
    //         pieModel.setSliceMargin(2);
    //         pieModel.setDataFormat("value");
    //         pieModel.setSeriesColors("E60000,FF00C4,C400FF,B17BEF,0E00A5,00C2BF,00C20A,D7E203,A57306,727272,222222,FFFFFF");
    //         for (ResultadoContato resultadoContato : resultadoContatoService.findAll()) {
    // // ... (truncado, ver fonte original)
    public Uni<Void> buscarLigacoes(Long opId) {
        // Obs: logica de UI do controlador JSF legado (pie chart), sem equivalente reativo
        return Uni.createFrom().voidItem();
    }

}