package br.com.sol7.olimpio.professor.nota.service;
import br.com.sol7.olimpio.professor.nota.entity.NotaMatricula;
import br.com.sol7.olimpio.professor.nota.repository.NotaMatriculaRepository;
import br.com.sol7.olimpio.professor.nota.dto.NotaMatriculaRequest;
import br.com.sol7.olimpio.professor.nota.dto.NotaMatriculaResponse;
import io.quarkus.hibernate.reactive.panache.common.WithTransaction;
import br.com.sol7.olimpio.shared.PagedResponse;
import io.smallrye.mutiny.Uni; import jakarta.enterprise.context.ApplicationScoped; import jakarta.inject.Inject; import jakarta.ws.rs.NotFoundException; import java.util.List;
@ApplicationScoped @WithTransaction public class NotaMatriculaService { @Inject NotaMatriculaRepository repository; public Uni<List<NotaMatriculaResponse>> list(){return repository.listAll().map(items->items.stream().map(this::toResponse).toList());}

    public Uni<PagedResponse<NotaMatriculaResponse>> paged(int page, int size) {
        int p = Math.max(0, page);
        int s = (size == 10 || size == 20 || size == 50 || size == 100) ? size : 10;
        return repository.findAll(io.quarkus.panache.common.Sort.by("id").descending()).page(io.quarkus.panache.common.Page.of(p, s)).list()
                .onItem().transformToUni(items -> repository.count()
                        .map(count -> new PagedResponse<>(items.stream().map(this::toResponse).toList(), count, p, s)));
    }
 public Uni<NotaMatriculaResponse> find(Long id){return repository.findById(id).onItem().ifNull().failWith(()->new NotFoundException("NotaMatricula not found")).map(this::toResponse);} public Uni<NotaMatriculaResponse> create(NotaMatriculaRequest r){var e=new NotaMatricula();apply(e,r);return repository.persist(e).replaceWith(()->toResponse(e));} public Uni<NotaMatriculaResponse> update(Long id,NotaMatriculaRequest r){return repository.findById(id).onItem().ifNull().failWith(()->new NotFoundException("NotaMatricula not found")).invoke(e->apply(e,r)).map(this::toResponse);} public Uni<Void> delete(Long id){return repository.deleteById(id).onItem().transformToUni(deleted->deleted?Uni.createFrom().voidItem():Uni.createFrom().failure(new NotFoundException("NotaMatricula not found")));} private void apply(NotaMatricula e,NotaMatriculaRequest r){e.grauNotaId=r.grauNotaId();e.grauConceitoId=r.grauConceitoId();e.matriculaId=r.matriculaId();e.oferecimentoComponenteCurricularId=r.oferecimentoComponenteCurricularId();e.nome=r.nome();e.descricao=r.descricao();} private NotaMatriculaResponse toResponse(NotaMatricula e){return new NotaMatriculaResponse(e.id,e.grauNotaId,e.grauConceitoId,e.matriculaId,e.oferecimentoComponenteCurricularId,e.nome,e.descricao);} 

    public Uni<List<NotaMatriculaResponse>> buscarPorOferecimento(Long oferecimentoComponenteCurricularId) {
        return repository.findByOferecimento(oferecimentoComponenteCurricularId).map(items -> items.stream().map(this::toResponse).toList());
    }

    public Uni<List<NotaMatriculaResponse>> buscarPorMatricula(Long matriculaId) {
        return repository.findByMatricula(matriculaId).map(items -> items.stream().map(this::toResponse).toList());
    }

}
