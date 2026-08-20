package br.com.sol7.olimpio.comercial.atendimentoconsultor;

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
public class AtendimentoConsultorService {
    @Inject
    AtendimentoConsultorRepository repository;

    public Uni<List<AtendimentoConsultorResponse>> list() {
        return repository.listAll().map(items -> items.stream().map(this::toResponse).toList());
    }

    public Uni<PagedResponse<AtendimentoConsultorResponse>> paged(int page, int size) {
        int p = Math.max(0, page);
        int s = (size == 10 || size == 20 || size == 50 || size == 100) ? size : 10;
        return repository.findAll(io.quarkus.panache.common.Sort.by("id").descending()).page(io.quarkus.panache.common.Page.of(p, s)).list()
                .onItem().transformToUni(items -> repository.count()
                        .map(count -> new PagedResponse<>(items.stream().map(this::toResponse).toList(), count, p, s)));
    }

    public Uni<AtendimentoConsultorResponse> find(Long id) {
        return repository.findById(id).onItem().ifNull().failWith(() -> new NotFoundException("AtendimentoConsultor not found")).map(this::toResponse);
    }

    public Uni<AtendimentoConsultorResponse> create(AtendimentoConsultorRequest r) {
        var e = new AtendimentoConsultor();
        apply(e, r);
        return repository.persist(e).replaceWith(() -> toResponse(e));
    }

    public Uni<AtendimentoConsultorResponse> update(Long id, AtendimentoConsultorRequest r) {
        return repository.findById(id).onItem().ifNull().failWith(() -> new NotFoundException("AtendimentoConsultor not found")).invoke(e -> apply(e, r)).map(this::toResponse);
    }

    public Uni<Void> delete(Long id) {
        return repository.deleteById(id).onItem().transformToUni(deleted -> deleted ? Uni.createFrom().voidItem() : Uni.createFrom().failure(new NotFoundException("AtendimentoConsultor not found")));
    }

    private void apply(AtendimentoConsultor e, AtendimentoConsultorRequest r) {
        e.nome = r.nome();
        e.dadosJson = r.dadosJson();
    }

    private AtendimentoConsultorResponse toResponse(AtendimentoConsultor e) {
        return new AtendimentoConsultorResponse(e.id, e.nome, e.dadosJson);
    }

    // Migrado de AtendimentoConsultorController.buscarTurmasOferecidas (src/main/java/br/com/sol7/olimpio/control/controllers/comercial/AtendimentoConsultorController.java:116, camada controller)
    // Observacao: parametro curriculoId: era Curriculo (referencia por id)
    // Logica original (adaptar):
    // public void buscarTurmasOferecidas(Curriculo curriculo) {
    //         listaDiasSemanas = new ArrayList<>();
    //         filterOferecimentoComponenteCurriculars = new LinkedHashSet<>();
    //         List<ComponenteCurricular> componentes = new ArrayList<>();
    //         for (MatrizCurricular matriz : curriculo.getMatrizCurriculares()) {
    //             componentes.add(matriz.getComponenteCurricular());
    //         }
    //         if (!ObjectUtil.nullOrEmpty(componentes)) {
    //             oferecimentoComponenteCurriculars = oferecimentoComponenteCurricularService.listarOferecimentosDisponiveis(componentes, usuarioLogadoController.getUnidadesDisponiveis(), null);
    //         }
    // 
    //         for (OferecimentoComponenteCurricular o : ofer ...
    // // ... (truncado, ver fonte original)
    public Uni<Void> buscarTurmasOferecidas(Long curriculoId) {
        // Obs: depende do microservico educacao (Curriculo/MatrizCurricular/OferecimentoComponenteCurricular)
        return Uni.createFrom().voidItem();
    }

}