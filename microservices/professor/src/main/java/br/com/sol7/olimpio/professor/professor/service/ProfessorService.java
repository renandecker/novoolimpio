package br.com.sol7.olimpio.professor.professor.service;

import br.com.sol7.olimpio.professor.professor.entity.Professor;
import br.com.sol7.olimpio.professor.professor.repository.ProfessorRepository;
import br.com.sol7.olimpio.professor.professor.dto.ProfessorRequest;
import br.com.sol7.olimpio.professor.professor.dto.ProfessorResponse;
import br.com.sol7.olimpio.professor.professor.dto.ProfessorAutoCompleteResponse;
import io.quarkus.hibernate.reactive.panache.common.WithTransaction;
import br.com.sol7.olimpio.shared.PagedResponse;
import br.com.sol7.olimpio.shared.TupleHelper;

import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.persistence.Tuple;
import jakarta.ws.rs.NotFoundException;

import java.util.List;
import java.util.Date;

import br.com.sol7.olimpio.professor.shared.notificacao.NotificacaoEventProducer;

@ApplicationScoped
@WithTransaction
public class ProfessorService {

    @Inject
    ProfessorRepository repository;
    @Inject
    NotificacaoEventProducer notificacaoEventProducer;

    public Uni<List<ProfessorResponse>> list() {
        return repository.listAllWithNome();
    }

    public Uni<PagedResponse<ProfessorResponse>> paged(int page, int size) {
        int p = Math.max(0, page);
        int s = (size == 10 || size == 20 || size == 50 || size == 100) ? size : 10;
        String sql = "SELECT p.id AS id, p.id_pessoa AS id_pessoa, p.fl_ativo AS fl_ativo, p.caderno_bola AS caderno_bola, p.dt_inicio AS dt_inicio, p.dt_fim AS dt_fim, " +
                "COALESCE(pf.nome, pj.nome_fantasia, '') AS nome " +
                "FROM edc_professor p " +
                "LEFT JOIN bas_pessoa pes ON pes.id = p.id_pessoa " +
                "LEFT JOIN bas_pessoa_fisica pf ON pf.id_pessoa = pes.id " +
                "LEFT JOIN bas_pessoa_juridica pj ON pj.id_pessoa = pes.id " +
                "ORDER BY p.id DESC";
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(sql, Tuple.class)
                        .setFirstResult(p * s)
                        .setMaxResults(s)
                        .getResultList())
                .onItem().transform(list -> list.stream()
                        .map(tuple -> (Tuple) tuple)
                        .map(t -> new ProfessorResponse(
                                TupleHelper.getLong(t, "id"),
                                TupleHelper.getLong(t, "id_pessoa"),
                                TupleHelper.getBoolean(t, "fl_ativo"),
                                TupleHelper.getBoolean(t, "caderno_bola"),
                                TupleHelper.getDate(t, "dt_inicio"),
                                TupleHelper.getDate(t, "dt_fim"),
                                TupleHelper.getString(t, "nome")
                        ))
                        .toList())
                .onItem().transformToUni(list -> repository.count()
                        .map(count -> new PagedResponse<ProfessorResponse>(list, count, p, s)));
    }

    public Uni<ProfessorResponse> find(Long id) {
        return repository.findByIdWithNome(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("Professor not found"));
    }

    public Uni<ProfessorResponse> create(ProfessorRequest r) {
        var e = new Professor();
        apply(e, r);
        return repository.persist(e)
                .chain(saved -> repository.findByIdWithNome(saved.id))
                .chain(resp -> notificacaoEventProducer.enviar(null, "PROFESSOR", "ALTERACAO_PROFESSOR",
                        "Registro de professor criado: " + resp.nome(),
                        "O registro do professor '" + resp.nome() + "' foi criado.",
                        "/view/configuracao/notificacoes-professor")
                        .replaceWith(() -> resp));
    }

    public Uni<ProfessorResponse> update(Long id, ProfessorRequest r) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("Professor not found"))
                .invoke(e -> apply(e, r))
                .chain(saved -> repository.findByIdWithNome(saved.id))
                .chain(resp -> notificacaoEventProducer.enviar(null, "PROFESSOR", "ALTERACAO_PROFESSOR",
                        "Registro de professor alterado: " + resp.nome(),
                        "O seu registro de professor foi alterado.",
                        "/view/configuracao/notificacoes-professor")
                        .replaceWith(() -> resp));
    }

    public Uni<Void> delete(Long id) {
        return repository.deleteById(id).onItem()
                .transformToUni(deleted -> deleted ? Uni.createFrom().voidItem()
                        : Uni.createFrom().failure(new NotFoundException("Professor not found")));
    }

    private void apply(Professor e, ProfessorRequest r) {
        e.pessoaId = r.pessoaId();
        e.ativo = r.ativo();
        e.cadernoBola = r.cadernoBola();
        e.dataInicio = r.dataInicio();
        e.dataFim = r.dataFim();
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
                    Tuple t = (Tuple) row;
                    Long id = TupleHelper.getLong(t, "id");
                    String nome = TupleHelper.getString(t, "nome");
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
