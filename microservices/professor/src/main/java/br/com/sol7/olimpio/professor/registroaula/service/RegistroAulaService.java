package br.com.sol7.olimpio.professor.registroaula.service;
import br.com.sol7.olimpio.professor.registroaula.entity.RegistroAula;
import br.com.sol7.olimpio.professor.registroaula.repository.RegistroAulaRepository;
import br.com.sol7.olimpio.professor.registroaula.dto.RegistroAulaRequest;
import br.com.sol7.olimpio.professor.registroaula.dto.RegistroAulaResponse;
import io.quarkus.hibernate.reactive.panache.common.WithTransaction;
import br.com.sol7.olimpio.shared.PagedResponse;
import io.smallrye.mutiny.Uni; import jakarta.enterprise.context.ApplicationScoped; import jakarta.inject.Inject; import jakarta.ws.rs.NotFoundException; import java.util.List;
@ApplicationScoped @WithTransaction public class RegistroAulaService { @Inject RegistroAulaRepository repository; public Uni<List<RegistroAulaResponse>> list(){return repository.listAll().map(items->items.stream().map(this::toResponse).toList());}

    public Uni<PagedResponse<RegistroAulaResponse>> paged(int page, int size) {
        int p = Math.max(0, page);
        int s = (size == 10 || size == 20 || size == 50 || size == 100) ? size : 10;
        return repository.findAll(io.quarkus.panache.common.Sort.by("id").descending()).page(io.quarkus.panache.common.Page.of(p, s)).list()
                .onItem().transformToUni(items -> repository.count()
                        .map(count -> new PagedResponse<>(items.stream().map(this::toResponse).toList(), count, p, s)));
    }
 public Uni<RegistroAulaResponse> find(Long id){return repository.findById(id).onItem().ifNull().failWith(()->new NotFoundException("RegistroAula not found")).map(this::toResponse);} public Uni<RegistroAulaResponse> create(RegistroAulaRequest r){var e=new RegistroAula();apply(e,r);return repository.persist(e).replaceWith(()->toResponse(e));} public Uni<RegistroAulaResponse> update(Long id,RegistroAulaRequest r){return repository.findById(id).onItem().ifNull().failWith(()->new NotFoundException("RegistroAula not found")).invoke(e->apply(e,r)).map(this::toResponse);} public Uni<Void> delete(Long id){return repository.deleteById(id).onItem().transformToUni(deleted->deleted?Uni.createFrom().voidItem():Uni.createFrom().failure(new NotFoundException("RegistroAula not found")));} private void apply(RegistroAula e,RegistroAulaRequest r){e.ocorrenciaComponenteCurricularId=r.ocorrenciaComponenteCurricularId();e.descricao=r.descricao();} private RegistroAulaResponse toResponse(RegistroAula e){return new RegistroAulaResponse(e.id,e.ocorrenciaComponenteCurricularId,e.descricao);} 

    public Uni<List<RegistroAulaResponse>> buscarPorOcorrencia(Long ocorrenciaComponenteCurricularId) {
        return repository.findByOcorrencia(ocorrenciaComponenteCurricularId).map(items -> items.stream().map(this::toResponse).toList());
    }

}
