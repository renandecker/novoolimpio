package br.com.sol7.olimpio.professor.nota.service;
import br.com.sol7.olimpio.professor.nota.entity.GrauNota;
import br.com.sol7.olimpio.professor.nota.repository.GrauNotaRepository;
import br.com.sol7.olimpio.professor.nota.dto.GrauNotaRequest;
import br.com.sol7.olimpio.professor.nota.dto.GrauNotaResponse;
import io.quarkus.hibernate.reactive.panache.common.WithTransaction;
import br.com.sol7.olimpio.shared.PagedResponse;
import io.smallrye.mutiny.Uni; import jakarta.enterprise.context.ApplicationScoped; import jakarta.inject.Inject; import jakarta.ws.rs.NotFoundException; import java.util.List;
@ApplicationScoped @WithTransaction public class GrauNotaService { @Inject GrauNotaRepository repository; public Uni<List<GrauNotaResponse>> list(){return repository.listAll().map(items->items.stream().map(this::toResponse).toList());}

    public Uni<PagedResponse<GrauNotaResponse>> paged(int page, int size) {
        int p = Math.max(0, page);
        int s = (size == 10 || size == 20 || size == 50 || size == 100) ? size : 10;
        return repository.findAll(io.quarkus.panache.common.Sort.by("id").descending()).page(io.quarkus.panache.common.Page.of(p, s)).list()
                .onItem().transformToUni(items -> repository.count()
                        .map(count -> new PagedResponse<>(items.stream().map(this::toResponse).toList(), count, p, s)));
    }
 public Uni<GrauNotaResponse> find(Long id){return repository.findById(id).onItem().ifNull().failWith(()->new NotFoundException("GrauNota not found")).map(this::toResponse);} public Uni<GrauNotaResponse> create(GrauNotaRequest r){var e=new GrauNota();apply(e,r);return repository.persist(e).replaceWith(()->toResponse(e));} public Uni<GrauNotaResponse> update(Long id,GrauNotaRequest r){return repository.findById(id).onItem().ifNull().failWith(()->new NotFoundException("GrauNota not found")).invoke(e->apply(e,r)).map(this::toResponse);} public Uni<Void> delete(Long id){return repository.deleteById(id).onItem().transformToUni(deleted->deleted?Uni.createFrom().voidItem():Uni.createFrom().failure(new NotFoundException("GrauNota not found")));} private void apply(GrauNota e,GrauNotaRequest r){e.grauId=r.grauId();e.numeroNota=r.numeroNota();e.peso=r.peso();e.nome=r.nome();e.descricao=r.descricao();e.qtdeNota=r.qtdeNota();e.qtdeNotaAluno=r.qtdeNotaAluno();} private GrauNotaResponse toResponse(GrauNota e){return new GrauNotaResponse(e.id,e.grauId,e.numeroNota,e.peso,e.nome,e.descricao,e.qtdeNota,e.qtdeNotaAluno);} 

    public Uni<List<GrauNotaResponse>> buscarPorGrau(Long grauId) {
        return repository.findByGrau(grauId).map(items -> items.stream().map(this::toResponse).toList());
    }

}
