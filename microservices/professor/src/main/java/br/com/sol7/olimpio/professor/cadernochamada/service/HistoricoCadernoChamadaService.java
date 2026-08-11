package br.com.sol7.olimpio.professor.cadernochamada.service;
import br.com.sol7.olimpio.professor.cadernochamada.entity.HistoricoCadernoChamada;
import br.com.sol7.olimpio.professor.cadernochamada.repository.HistoricoCadernoChamadaRepository;
import br.com.sol7.olimpio.professor.cadernochamada.dto.HistoricoCadernoChamadaRequest;
import br.com.sol7.olimpio.professor.cadernochamada.dto.HistoricoCadernoChamadaResponse;
import io.quarkus.hibernate.reactive.panache.common.WithTransaction;
import br.com.sol7.olimpio.shared.PagedResponse;
import io.smallrye.mutiny.Uni; import jakarta.enterprise.context.ApplicationScoped; import jakarta.inject.Inject; import jakarta.ws.rs.NotFoundException; import java.util.Date; import java.util.List;
@ApplicationScoped @WithTransaction public class HistoricoCadernoChamadaService { @Inject HistoricoCadernoChamadaRepository repository; public Uni<List<HistoricoCadernoChamadaResponse>> list(){return repository.listAll().map(items->items.stream().map(this::toResponse).toList());}

    public Uni<PagedResponse<HistoricoCadernoChamadaResponse>> paged(int page, int size) {
        int p = Math.max(0, page);
        int s = (size == 10 || size == 20 || size == 50 || size == 100) ? size : 10;
        return repository.findAll(io.quarkus.panache.common.Sort.by("id").descending()).page(io.quarkus.panache.common.Page.of(p, s)).list()
                .onItem().transformToUni(items -> repository.count()
                        .map(count -> new PagedResponse<>(items.stream().map(this::toResponse).toList(), count, p, s)));
    }
 public Uni<HistoricoCadernoChamadaResponse> find(Long id){return repository.findById(id).onItem().ifNull().failWith(()->new NotFoundException("HistoricoCadernoChamada not found")).map(this::toResponse);} public Uni<HistoricoCadernoChamadaResponse> create(HistoricoCadernoChamadaRequest r){var e=new HistoricoCadernoChamada();apply(e,r);if(e.data==null){e.data=new Date();}return repository.persist(e).replaceWith(()->toResponse(e));} public Uni<HistoricoCadernoChamadaResponse> update(Long id,HistoricoCadernoChamadaRequest r){return repository.findById(id).onItem().ifNull().failWith(()->new NotFoundException("HistoricoCadernoChamada not found")).invoke(e->apply(e,r)).map(this::toResponse);} public Uni<Void> delete(Long id){return repository.deleteById(id).onItem().transformToUni(deleted->deleted?Uni.createFrom().voidItem():Uni.createFrom().failure(new NotFoundException("HistoricoCadernoChamada not found")));} private void apply(HistoricoCadernoChamada e,HistoricoCadernoChamadaRequest r){e.usuarioId=r.usuarioId();e.data=r.data();e.matriculaId=r.matriculaId();e.ocorrenciaComponenteCurricularId=r.ocorrenciaComponenteCurricularId();e.presencaAnterior=r.presencaAnterior();e.presencaPosterior=r.presencaPosterior();} private HistoricoCadernoChamadaResponse toResponse(HistoricoCadernoChamada e){return new HistoricoCadernoChamadaResponse(e.id,e.usuarioId,e.data,e.matriculaId,e.ocorrenciaComponenteCurricularId,e.presencaAnterior,e.presencaPosterior);} 

    public Uni<List<HistoricoCadernoChamadaResponse>> buscarPorOcorrencia(Long ocorrenciaComponenteCurricularId) {
        return repository.findByOcorrencia(ocorrenciaComponenteCurricularId).map(items -> items.stream().map(this::toResponse).toList());
    }

}
