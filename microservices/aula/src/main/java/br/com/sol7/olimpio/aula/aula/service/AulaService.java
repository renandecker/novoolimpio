package br.com.sol7.olimpio.aula.aula.service;

import br.com.sol7.olimpio.aula.aula.entity.Aula;
import br.com.sol7.olimpio.aula.aula.repository.AulaRepository;
import br.com.sol7.olimpio.aula.dto.AulaDtos.AulaRequest;
import br.com.sol7.olimpio.aula.dto.AulaDtos.AulaResponse;
import br.com.sol7.olimpio.aula.dto.AulaDtos.AulaAssistidaResponse;
import br.com.sol7.olimpio.aula.dto.AulaDtos.ContratoAulaResponse;
import br.com.sol7.olimpio.aula.dto.AulaDtos.OcorrenciaAulaResponse;
import br.com.sol7.olimpio.aula.dto.AulaDtos.OferecimentoAulaResponse;
import br.com.sol7.olimpio.shared.PagedResponse;
import io.quarkus.hibernate.reactive.panache.common.WithTransaction;
import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
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

    public Uni<List<AulaResponse>> list() {
        return repository.listAll().map(items -> items.stream().map(this::toResponse).toList());
    }

    public Uni<PagedResponse<AulaResponse>> paged(int page, int size) {
        int p = Math.max(0, page);
        int s = (size == 10 || size == 20 || size == 50 || size == 100) ? size : 10;
        return repository.findAll(io.quarkus.panache.common.Sort.by("id").descending()).page(io.quarkus.panache.common.Page.of(p, s)).list()
                .onItem().transformToUni(items -> repository.count()
                        .map(count -> new PagedResponse<>(items.stream().map(this::toResponse).toList(), count, p, s)));
    }

    public Uni<AulaResponse> find(Long id) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("Aula not found"))
                .map(this::toResponse);
    }

    public Uni<AulaResponse> create(AulaRequest r) {
        var e = new Aula();
        apply(e, r);
        return repository.persistAndFlush(e).replaceWith(() -> toResponse(e));
    }

    public Uni<AulaResponse> update(Long id, AulaRequest r) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("Aula not found"))
                .invoke(e -> apply(e, r))
                .map(this::toResponse);
    }

    public Uni<Void> delete(Long id) {
        return repository.deleteById(id).onItem()
                .transformToUni(deleted -> deleted ? Uni.createFrom().voidItem()
                        : Uni.createFrom().failure(new NotFoundException("Aula not found")));
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
                                .map(row -> new ContratoAulaResponse(asLong(row[0]), asString(row[1])))
                                .toList()));
    }

    public Uni<List<OferecimentoAulaResponse>> oferecimentos(Long contratoId) {
        return repository.oferecimentosDoContrato(contratoId)
                .map(rows -> rows.stream()
                        .map(row -> new OferecimentoAulaResponse(asLong(row[0]), asString(row[1])))
                        .toList());
    }

    public Uni<List<OcorrenciaAulaResponse>> ocorrencias(Long oferecimentoId) {
        return repository.ocorrenciasDoOferecimento(oferecimentoId)
                .map(rows -> rows.stream()
                        .map(row -> new OcorrenciaAulaResponse(asLong(row[0]),
                                formatData(asDate(row[1])),
                                asBoolean(row[2]),
                                asBoolean(row[3])))
                        .toList());
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

    private void apply(Aula e, AulaRequest r) {
        e.nome = r.nome();
        e.descricao = r.descricao();
        e.ocorrenciaComponenteCurricularId = r.ocorrenciaComponenteCurricularId();
    }

    private AulaResponse toResponse(Aula e) {
        return new AulaResponse(e.id, e.nome, e.descricao, e.ocorrenciaComponenteCurricularId);
    }

    private String asString(Object o) { return o == null ? "" : o.toString(); }

    private Long asLong(Object o) {
        if (o == null) return null;
        if (o instanceof Number n) return n.longValue();
        return Long.valueOf(o.toString());
    }

    private Date asDate(Object o) {
        if (o == null) return null;
        if (o instanceof Date d) return d;
        return java.sql.Date.valueOf(o.toString());
    }

    private boolean asBoolean(Object o) {
        if (o == null) return false;
        if (o instanceof Boolean b) return b;
        return "true".equalsIgnoreCase(o.toString()) || "1".equals(o.toString());
    }

    private String formatData(Date d) {
        return d == null ? "" : DATA_FORMAT.format(d);
    }
}
