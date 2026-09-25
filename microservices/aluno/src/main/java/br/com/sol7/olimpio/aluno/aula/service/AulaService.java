package br.com.sol7.olimpio.aluno.aula.service;

import br.com.sol7.olimpio.aluno.aula.entity.Aula;
import br.com.sol7.olimpio.aluno.aula.repository.AulaRepository;
import br.com.sol7.olimpio.aluno.aula.dto.AulaDtos.AulaAssistidaResponse;
import br.com.sol7.olimpio.aluno.aula.dto.AulaDtos.AulaResponse;
import br.com.sol7.olimpio.aluno.aula.dto.AulaDtos.AulaTurmaResponse;
import br.com.sol7.olimpio.aluno.aula.dto.AulaDtos.ContratoAulaResponse;
import br.com.sol7.olimpio.aluno.aula.dto.AulaDtos.OcorrenciaAulaResponse;
import br.com.sol7.olimpio.aluno.aula.dto.AulaDtos.OferecimentoAulaResponse;
import br.com.sol7.olimpio.aluno.aula.dto.AulaDtos.TurmaAulaResponse;
import br.com.sol7.olimpio.shared.TupleHelper;
import io.quarkus.hibernate.reactive.panache.common.WithTransaction;
import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.persistence.Tuple;
import jakarta.ws.rs.NotFoundException;

import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.List;

@ApplicationScoped
@WithTransaction
public class AulaService {

    private static final SimpleDateFormat DATA_FORMAT = new SimpleDateFormat("dd/MM/yyyy");

    @Inject
    AulaRepository repository;

    public Uni<AulaResponse> find(Long id) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("Aula not found"))
                .map(this::toResponse);
    }

    public Uni<List<AulaResponse>> aulasDaOcorrencia(Long ocorrenciaId) {
        return repository.aulasDaOcorrencia(ocorrenciaId)
                .map(items -> items.stream().map(this::toResponse).toList());
    }

    public Uni<List<AulaResponse>> aulasDoOferecimento(Long oferecimentoId) {
        return repository.aulasDoOferecimento(oferecimentoId)
                .map(items -> items.stream().map(this::toResponse).toList());
    }

    public Uni<List<ContratoAulaResponse>> contratos(String username) {
        return repository.pessoaIdPorUsername(username)
                .onItem().ifNull().failWith(() -> new NotFoundException("Aluno não encontrado"))
                .onItem().transformToUni(pessoaId -> repository.contratosDoAluno(pessoaId)
                        .map(rows -> rows.stream()
                                .map(row -> new ContratoAulaResponse(TupleHelper.getLong(row, "id"), TupleHelper.getString(row, "curso")))
                                .toList()));
    }

    public Uni<List<OferecimentoAulaResponse>> oferecimentos(Long contratoId) {
        return repository.oferecimentosDoContrato(contratoId)
                .map(rows -> rows.stream()
                        .map(row -> new OferecimentoAulaResponse(TupleHelper.getLong(row, "id"), TupleHelper.getString(row, "modulo")))
                        .toList());
    }

    public Uni<List<OcorrenciaAulaResponse>> ocorrencias(Long oferecimentoId) {
        return repository.ocorrenciasDoOferecimento(oferecimentoId)
                .map(rows -> rows.stream()
                        .map(row -> new OcorrenciaAulaResponse(TupleHelper.getLong(row, "id"),
                                formatData(TupleHelper.getDate(row, "data")),
                                TupleHelper.getBoolean(row, "aula_coringa"),
                                TupleHelper.getBoolean(row, "aula_presencial")))
                        .toList());
    }

    public Uni<List<TurmaAulaResponse>> turmas(String username) {
        return repository.pessoaIdPorUsername(username)
                .onItem().ifNull().failWith(() -> new NotFoundException("Aluno não encontrado"))
                .onItem().transformToUni(pessoaId -> repository.turmasDoAluno(pessoaId)
                        .map(rows -> rows.stream()
                                .map(row -> new TurmaAulaResponse(TupleHelper.getLong(row, "id"),
                                        TupleHelper.getString(row, "curso"),
                                        TupleHelper.getString(row, "componente"),
                                        TupleHelper.getInteger(row, "turma"),
                                        TupleHelper.getString(row, "unidade"),
                                        TupleHelper.getString(row, "professor")))
                                .toList()));
    }

    public Uni<List<AulaTurmaResponse>> aulasDaTurma(String username, Long oferecimentoId) {
        return repository.pessoaIdPorUsername(username)
                .onItem().ifNull().failWith(() -> new NotFoundException("Aluno não encontrado"))
                .onItem().transformToUni(pessoaId -> repository.aulasDaTurma(oferecimentoId, pessoaId)
                        .map(rows -> rows.stream()
                                .map(row -> new AulaTurmaResponse(TupleHelper.getLong(row, "id"),
                                        TupleHelper.getString(row, "nome"),
                                        TupleHelper.getString(row, "descricao"),
                                        formatData(TupleHelper.getDate(row, "data")),
                                        TupleHelper.getBoolean(row, "assistida")))
                                .toList()));
    }

    public Uni<AulaAssistidaResponse> marcarAssistida(String username, Long aulaId) {
        return repository.pessoaIdPorUsername(username)
                .onItem().ifNull().failWith(() -> new NotFoundException("Aluno não encontrado"))
                .onItem().transformToUni(pessoaId -> repository.marcarAssistida(aulaId, pessoaId)
                        .map(data -> new AulaAssistidaResponse(aulaId, pessoaId, data)));
    }

    public Uni<AulaAssistidaResponse> marcarAssistidaPorPessoa(Long pessoaId, Long aulaId) {
        return repository.marcarAssistida(aulaId, pessoaId)
                .map(data -> new AulaAssistidaResponse(aulaId, pessoaId, data));
    }

    public Uni<Boolean> jaAssistida(String username, Long aulaId) {
        return repository.pessoaIdPorUsername(username)
                .onItem().ifNull().failWith(() -> new NotFoundException("Aluno não encontrado"))
                .onItem().transformToUni(pessoaId -> repository.jaAssistida(aulaId, pessoaId));
    }

    private AulaResponse toResponse(Aula e) {
        return new AulaResponse(e.id, e.nome, e.descricao, e.ocorrenciaComponenteCurricularId);
    }

    private String formatData(Date d) {
        return d == null ? "" : DATA_FORMAT.format(d);
    }
}