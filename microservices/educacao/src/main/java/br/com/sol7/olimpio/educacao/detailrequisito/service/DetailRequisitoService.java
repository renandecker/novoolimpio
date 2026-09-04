package br.com.sol7.olimpio.educacao.detailrequisito;

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
public class DetailRequisitoService {
    @Inject
    DetailRequisitoRepository repository;

    public Uni<List<DetailRequisitoResponse>> list() {
        return repository.listAll().map(items -> items.stream().map(this::toResponse).toList());
    }

    public Uni<PagedResponse<DetailRequisitoResponse>> paged(int page, int size) {
        int p = Math.max(0, page);
        int s = (size == 10 || size == 20 || size == 50 || size == 100) ? size : 10;
        return repository.findAll(io.quarkus.panache.common.Sort.by("id").descending()).page(io.quarkus.panache.common.Page.of(p, s)).list()
                .onItem().transformToUni(items -> repository.count()
                        .map(count -> new PagedResponse<>(items.stream().map(this::toResponse).toList(), count, p, s)));
    }

    public Uni<DetailRequisitoResponse> find(Long id) {
        return repository.findById(id).onItem().ifNull().failWith(() -> new NotFoundException("DetailRequisito not found")).map(this::toResponse);
    }

    public Uni<DetailRequisitoResponse> create(DetailRequisitoRequest r) {
        var e = new DetailRequisito();
        apply(e, r);
        return repository.persist(e).replaceWith(() -> toResponse(e));
    }

    public Uni<DetailRequisitoResponse> update(Long id, DetailRequisitoRequest r) {
        return repository.findById(id).onItem().ifNull().failWith(() -> new NotFoundException("DetailRequisito not found")).invoke(e -> apply(e, r)).map(this::toResponse);
    }

    public Uni<Void> delete(Long id) {
        return repository.deleteById(id).onItem().transformToUni(deleted -> deleted ? Uni.createFrom().voidItem() : Uni.createFrom().failure(new NotFoundException("DetailRequisito not found")));
    }

    private void apply(DetailRequisito e, DetailRequisitoRequest r) {
        e.nome = r.nome();
        e.dadosJson = r.dadosJson();
    }

    private DetailRequisitoResponse toResponse(DetailRequisito e) {
        return new DetailRequisitoResponse(e.id, e.nome, e.dadosJson);
    }

    // Migrado de DetailRequisitoController.autoComplete (src/main/java/br/com/sol7/olimpio/control/controllers/educacao/DetailRequisitoController.java:31, camada controller)
    // Logica original (adaptar):
    // public List<MatrizCurricular> autoComplete(String query) {
    //         return curriculoController.getMatrizCurriculares();
    //     }
    public Uni<List<Long>> autoComplete(String query) {
        // Obs: depende do microservico curriculo (MatrizCurricular)
        return Uni.createFrom().item(java.util.List.of());
    }


    // Migrado de DetailRequisitoController.buscarMatrizCurricularPorComponente (src/main/java/br/com/sol7/olimpio/control/controllers/educacao/DetailRequisitoController.java:67, camada controller)
    // Observacao: retorno: era MatrizCurricular (referencia por id); parametro cId: era ComponenteCurricular (referencia por id)
    // Logica original (adaptar):
    // public MatrizCurricular buscarMatrizCurricularPorComponente(ComponenteCurricular c) {
    //         if (ObjectUtil.nullOrEmpty(c)) {
    //             return new MatrizCurricular();
    //         }
    //         for (MatrizCurricular matrizCurricular : curriculoController.getMatrizCurriculares()) {
    //             if (c.equals(matrizCurricular.getComponenteCurricular())) {
    //                 return matrizCurricular;
    //             }
    //         }
    //         return new MatrizCurricular();
    //     }
    public Uni<Long> buscarMatrizCurricularPorComponente(Long cId) {
        // Obs: depende do microservico curriculo (MatrizCurricular)
        return Uni.createFrom().item(null);
    }

}
