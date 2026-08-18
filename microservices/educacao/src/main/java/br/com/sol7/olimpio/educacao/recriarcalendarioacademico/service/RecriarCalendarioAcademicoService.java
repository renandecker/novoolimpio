package br.com.sol7.olimpio.educacao.recriarcalendarioacademico;
import io.quarkus.hibernate.reactive.panache.common.WithTransaction;
import br.com.sol7.olimpio.educacao.shared.PagedResponse;
import io.smallrye.mutiny.Uni; import jakarta.enterprise.context.ApplicationScoped; import jakarta.inject.Inject; import jakarta.ws.rs.NotFoundException; import java.util.List;
@ApplicationScoped @WithTransaction public class RecriarCalendarioAcademicoService { @Inject RecriarCalendarioAcademicoRepository repository; public Uni<List<RecriarCalendarioAcademicoResponse>> list(){return repository.listAll().map(items->items.stream().map(this::toResponse).toList());}

    public Uni<PagedResponse<RecriarCalendarioAcademicoResponse>> paged(int page, int size) {
        int p = Math.max(0, page);
        int s = (size == 10 || size == 20 || size == 50 || size == 100) ? size : 10;
        return repository.findAll(io.quarkus.panache.common.Sort.by("id").descending()).page(io.quarkus.panache.common.Page.of(p, s)).list()
                .onItem().transformToUni(items -> repository.count()
                        .map(count -> new PagedResponse<>(items.stream().map(this::toResponse).toList(), count, p, s)));
    }
 public Uni<RecriarCalendarioAcademicoResponse> find(Long id){return repository.findById(id).onItem().ifNull().failWith(()->new NotFoundException("RecriarCalendarioAcademico not found")).map(this::toResponse);} public Uni<RecriarCalendarioAcademicoResponse> create(RecriarCalendarioAcademicoRequest r){var e=new RecriarCalendarioAcademico();apply(e,r);return repository.persist(e).replaceWith(()->toResponse(e));} public Uni<RecriarCalendarioAcademicoResponse> update(Long id,RecriarCalendarioAcademicoRequest r){return repository.findById(id).onItem().ifNull().failWith(()->new NotFoundException("RecriarCalendarioAcademico not found")).invoke(e->apply(e,r)).map(this::toResponse);} public Uni<Void> delete(Long id){return repository.deleteById(id).onItem().transformToUni(deleted->deleted?Uni.createFrom().voidItem():Uni.createFrom().failure(new NotFoundException("RecriarCalendarioAcademico not found")));} private void apply(RecriarCalendarioAcademico e,RecriarCalendarioAcademicoRequest r){e.nome=r.nome();e.dadosJson=r.dadosJson();} private RecriarCalendarioAcademicoResponse toResponse(RecriarCalendarioAcademico e){return new RecriarCalendarioAcademicoResponse(e.id,e.nome,e.dadosJson);} }
