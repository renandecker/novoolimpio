package br.com.sol7.olimpio.professor.cadernochamada.service;
import br.com.sol7.olimpio.professor.cadernochamada.entity.CadernoComponenteCurricular;
import br.com.sol7.olimpio.professor.cadernochamada.repository.CadernoComponenteCurricularRepository;
import br.com.sol7.olimpio.professor.cadernochamada.dto.CadernoComponenteCurricularRequest;
import br.com.sol7.olimpio.professor.cadernochamada.dto.CadernoComponenteCurricularResponse;
import io.quarkus.hibernate.reactive.panache.common.WithTransaction;
import br.com.sol7.olimpio.shared.PagedResponse;
import io.smallrye.mutiny.Uni; import jakarta.enterprise.context.ApplicationScoped; import jakarta.inject.Inject; import jakarta.ws.rs.NotFoundException; import java.util.Date; import java.util.List;
@ApplicationScoped @WithTransaction public class CadernoComponenteCurricularService { @Inject CadernoComponenteCurricularRepository repository; public Uni<List<CadernoComponenteCurricularResponse>> list(){return repository.listAll().map(items->items.stream().map(this::toResponse).toList());}

    public Uni<PagedResponse<CadernoComponenteCurricularResponse>> paged(int page, int size) {
        int p = Math.max(0, page);
        int s = (size == 10 || size == 20 || size == 50 || size == 100) ? size : 10;
        return repository.findAll(io.quarkus.panache.common.Sort.by("id").descending()).page(io.quarkus.panache.common.Page.of(p, s)).list()
                .onItem().transformToUni(items -> repository.count()
                        .map(count -> new PagedResponse<>(items.stream().map(this::toResponse).toList(), count, p, s)));
    }
 public Uni<CadernoComponenteCurricularResponse> find(Long id){return repository.findById(id).onItem().ifNull().failWith(()->new NotFoundException("CadernoComponenteCurricular not found")).map(this::toResponse);} public Uni<CadernoComponenteCurricularResponse> create(CadernoComponenteCurricularRequest r){var e=new CadernoComponenteCurricular();apply(e,r);if(e.dataAlteracao==null){e.dataAlteracao=new Date();}return repository.persist(e).replaceWith(()->toResponse(e));} public Uni<CadernoComponenteCurricularResponse> update(Long id,CadernoComponenteCurricularRequest r){return repository.findById(id).onItem().ifNull().failWith(()->new NotFoundException("CadernoComponenteCurricular not found")).invoke(e->apply(e,r)).map(this::toResponse);} public Uni<Void> delete(Long id){return repository.deleteById(id).onItem().transformToUni(deleted->deleted?Uni.createFrom().voidItem():Uni.createFrom().failure(new NotFoundException("CadernoComponenteCurricular not found")));} private void apply(CadernoComponenteCurricular e,CadernoComponenteCurricularRequest r){e.ocorrenciaComponenteCurricularId=r.ocorrenciaComponenteCurricularId();e.matriculaId=r.matriculaId();e.dataAlteracao=r.dataAlteracao();e.presenca=r.presenca();} private CadernoComponenteCurricularResponse toResponse(CadernoComponenteCurricular e){return new CadernoComponenteCurricularResponse(e.id,e.ocorrenciaComponenteCurricularId,e.matriculaId,e.dataAlteracao,e.presenca);} 

    public Uni<List<CadernoComponenteCurricularResponse>> buscarPorOcorrencia(Long ocorrenciaComponenteCurricularId) {
        return repository.findByOcorrencia(ocorrenciaComponenteCurricularId).map(items -> items.stream().map(this::toResponse).toList());
    }

    public Uni<CadernoComponenteCurricularResponse> buscarPresenca(Long matriculaId, Long ocorrenciaComponenteCurricularId) {
        return repository.findByMatriculaAndOcorrencia(matriculaId, ocorrenciaComponenteCurricularId)
                .map(item -> item == null ? null : toResponse(item));
    }

}
