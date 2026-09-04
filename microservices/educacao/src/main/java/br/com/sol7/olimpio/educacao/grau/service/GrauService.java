package br.com.sol7.olimpio.educacao.grau;

import io.quarkus.hibernate.reactive.panache.common.WithTransaction;
import br.com.sol7.olimpio.shared.PagedResponse;

import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.NotFoundException;

import java.util.List;

@ApplicationScoped
@WithTransaction
public class GrauService {

    @Inject
    GrauRepository repository;

    public Uni<List<GrauResponse>> list() {
        return repository.listAll().map(items -> items.stream().map(this::toResponse).toList());
    }

    public Uni<PagedResponse<GrauResponse>> paged(int page, int size) {
        int p = Math.max(0, page);
        int s = (size == 10 || size == 20 || size == 50 || size == 100) ? size : 10;
        return repository.findAll(io.quarkus.panache.common.Sort.by("id").descending()).page(io.quarkus.panache.common.Page.of(p, s)).list()
                .onItem().transformToUni(items -> repository.count()
                        .map(count -> new PagedResponse<>(items.stream().map(this::toResponse).toList(), count, p, s)));
    }


    public Uni<GrauResponse> find(Long id) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("Grau not found"))
                .map(this::toResponse);
    }

    public Uni<GrauResponse> create(GrauRequest r) {
        var e = new Grau();
        apply(e, r);
        return repository.persist(e).replaceWith(() -> toResponse(e));
    }

    public Uni<GrauResponse> update(Long id, GrauRequest r) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("Grau not found"))
                .invoke(e -> apply(e, r))
                .map(this::toResponse);
    }

    public Uni<Void> delete(Long id) {
        return repository.deleteById(id).onItem()
                .transformToUni(deleted -> deleted ? Uni.createFrom().voidItem()
                        : Uni.createFrom().failure(new NotFoundException("Grau not found")));
    }

    private void apply(Grau e, GrauRequest r) {
        e.descricao = r.descricao();
        e.tipoGrau = r.tipoGrau();
        e.frequenciaMinima = r.frequenciaMinima();
        e.mediaSemExame = r.mediaSemExame();
        e.mediaFinal = r.mediaFinal();
        e.notaMaxima = r.notaMaxima();
        e.conceitoSemExame = r.conceitoSemExame();
        e.conceitoFinal = r.conceitoFinal();
        e.cancelado = r.cancelado();
        e.limiteManual = r.limiteManual();
        e.limiteManualAluno = r.limiteManualAluno();
        e.recuperacao = r.recuperacao();
        e.manual = r.manual();
        e.manualAluno = r.manualAluno();
        e.pesoDistinto = r.pesoDistinto();
        e.notasParciais = r.notasParciais();
    }

    private GrauResponse toResponse(Grau e) {
        return new GrauResponse(e.id, e.descricao, e.tipoGrau, e.frequenciaMinima, e.mediaSemExame, e.mediaFinal, e.notaMaxima, e.conceitoSemExame, e.conceitoFinal, e.cancelado, e.limiteManual, e.limiteManualAluno, e.recuperacao, e.manual, e.manualAluno, e.pesoDistinto, e.notasParciais);
    }


    // Migrado de GrauService.buscarGrauComNota (src/main/java/br/com/sol7/olimpio/service/services/educacao/GrauService.java:19, camada service)
    // Observacao: retorno: era Grau (referencia por id); parametro grauId: era Grau (referencia por id)
    // JPQL original: select g from Grau g left join fetch g.grauNota n where g = ?1 order by n.numeroNota
    // Logica original (adaptar):
    // public Grau buscarGrauComNota(Grau grau) {
    //         return getGrauRepository().buscarGrauComNota(grau);
    //     }
    public Uni<Long> buscarGrauComNota(Long grauId) {
        return repository.buscarGrauComNota(grauId).map(list -> list.isEmpty() ? null : list.get(0).id);
    }


    // Migrado de GrauService.buscarGrauComConceito (src/main/java/br/com/sol7/olimpio/service/services/educacao/GrauService.java:23, camada service)
    // Observacao: retorno: era Grau (referencia por id); parametro grauId: era Grau (referencia por id)
    // JPQL original: select g from Grau g left join fetch g.grauConceito c where g = ?1 order by c.ordem
    // Logica original (adaptar):
    // public Grau buscarGrauComConceito(Grau grau) {
    //         return getGrauRepository().buscarGrauComConceito(grau);
    //     }
    public Uni<Long> buscarGrauComConceito(Long grauId) {
        return repository.buscarGrauComConceito(grauId).map(list -> list.isEmpty() ? null : list.get(0).id);
    }

}

