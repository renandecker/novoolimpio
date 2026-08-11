package br.com.sol7.olimpio.professor.professor.service;
import br.com.sol7.olimpio.professor.professor.entity.Professor;
import br.com.sol7.olimpio.professor.professor.repository.ProfessorRepository;
import br.com.sol7.olimpio.professor.professor.dto.ProfessorRequest;
import br.com.sol7.olimpio.professor.professor.dto.ProfessorResponse;
import br.com.sol7.olimpio.professor.professor.dto.ProfessorAutoCompleteResponse;
import io.quarkus.hibernate.reactive.panache.common.WithTransaction;
import br.com.sol7.olimpio.shared.PagedResponse;

import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.NotFoundException;
import java.util.List;
import java.util.Date;

@ApplicationScoped
@WithTransaction
public class ProfessorService {

    @Inject ProfessorRepository repository;

    public Uni<List<ProfessorResponse>> list() {
        return repository.listAll().map(items -> items.stream().map(this::toResponse).toList());
    }

    public Uni<PagedResponse<ProfessorResponse>> paged(int page, int size) {
        int p = Math.max(0, page);
        int s = (size == 10 || size == 20 || size == 50 || size == 100) ? size : 10;
        return repository.findAll(io.quarkus.panache.common.Sort.by("id").descending()).page(io.quarkus.panache.common.Page.of(p, s)).list()
                .onItem().transformToUni(items -> repository.count()
                        .map(count -> new PagedResponse<>(items.stream().map(this::toResponse).toList(), count, p, s)));
    }

    public Uni<ProfessorResponse> find(Long id) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("Professor not found"))
                .map(this::toResponse);
    }

    public Uni<ProfessorResponse> create(ProfessorRequest r) {
        var e = new Professor();
        apply(e, r);
        return repository.persist(e).replaceWith(() -> toResponse(e));
    }

    public Uni<ProfessorResponse> update(Long id, ProfessorRequest r) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("Professor not found"))
                .invoke(e -> apply(e, r))
                .map(this::toResponse);
    }

    public Uni<Void> delete(Long id) {
        return repository.deleteById(id).onItem()
                .transformToUni(deleted -> deleted ? Uni.createFrom().voidItem()
                        : Uni.createFrom().failure(new NotFoundException("Professor not found")));
    }

    private void apply(Professor e, ProfessorRequest r) { e.pessoaId = r.pessoaId(); e.ativo = r.ativo(); e.cadernoBola = r.cadernoBola(); e.dataInicio = r.dataInicio(); e.dataFim = r.dataFim(); }

    private ProfessorResponse toResponse(Professor e) {
        return new ProfessorResponse(e.id, e.pessoaId, e.ativo, e.cadernoBola, e.dataInicio, e.dataFim);
    }

    public Uni<Void> buscarDetalhes(String event) {
        return Uni.createFrom().voidItem();
    }

    public Uni<List<ProfessorAutoCompleteResponse>> autoCompleteProfessor(String query) {
        if (query == null || query.trim().length() < 3) {
            return Uni.createFrom().item(java.util.List.of());
        }
        String q = query.toLowerCase().trim();
        return repository.autoCompleteProfessor(q).map(list -> list.stream()
                .map(row -> {
                    Object[] arr = (Object[]) row;
                    Long id = ((Number) arr[0]).longValue();
                    String nome = arr[1] == null ? "" : arr[1].toString();
                    return new ProfessorAutoCompleteResponse(id, nome);
                })
                .toList());
    }

    public Uni<Void> carregarProfessor(Long professorId) {
        return Uni.createFrom().voidItem();
    }

    public Uni<Long> buscarProfessorComUnidades(Long entityId) {
                return repository.buscarProfessorComUnidades(entityId).map(list -> list.isEmpty() ? null : list.get(0).id);
    }

    public Uni<Long> buscarProfessorComComponenteCurricular(Long entityId) {
                return repository.buscarProfessorComComponenteCurricular(entityId).map(list -> list.isEmpty() ? null : list.get(0).id);
    }

    public Uni<List<Long>> buscarListaProfessoresParaTurma(Long componenteCurricularId, Long unidadeId) {
                return repository.buscarListaProfessoresParaTurma(componenteCurricularId, unidadeId).map(list -> list.stream().map(x -> x.id).toList());
    }

    public Uni<List<Long>> buscarDisponibilidadeProfessorTurno(Date data, Long professorId, Date inicio, Date fim) {
        return Uni.createFrom().item(java.util.List.of());
    }

    public Uni<List<Long>> buscarDisponibilidadeProfessorTurnoComOferecimento(Date data, Long professorId, Date inicio, Date fim, Long oferecimentoComponenteCurricularId) {
        return Uni.createFrom().item(java.util.List.of());
    }

    public Uni<Long> buscarDisponibilidadeComDiaSemana(Long dpId) {
        return repository.buscarDisponibilidadeComDiaSemana(dpId).map(list -> list.isEmpty() ? null : list.get(0).id);
    }

    public Uni<List<Long>> autoCompleteProfessorComCoponente(String query, Long componenteCurricularId, Long unidadeId) {
        return repository.autoCompleteProfessorFisicaComComponenteUnidade(query.toLowerCase(), componenteCurricularId, unidadeId)
                .chain(fisica -> repository.autoCompleteProfessorJuridicaComComponenteUnidade(query.toLowerCase(), componenteCurricularId, unidadeId)
                        .map(juridica -> java.util.stream.Stream.concat(fisica.stream(), juridica.stream()).map(x -> x.id).toList()));
    }

    public Uni<List<Long>> buscarProfessorPorUnidades(List<Long> unidade) {
                return repository.buscarProfessorPorUnidades(unidade).map(list -> list.stream().map(x -> x.id).toList());
    }

}
