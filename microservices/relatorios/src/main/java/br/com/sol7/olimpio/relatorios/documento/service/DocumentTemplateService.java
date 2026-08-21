package br.com.sol7.olimpio.relatorios.documento.service;

import br.com.sol7.olimpio.relatorios.documento.dto.DocumentTemplateResponse;
import br.com.sol7.olimpio.relatorios.documento.dto.DocumentTemplateRequest;
import br.com.sol7.olimpio.relatorios.documento.dto.DocumentTemplateOpcoesResponse;
import br.com.sol7.olimpio.relatorios.documento.entity.DocumentTemplate;
import br.com.sol7.olimpio.relatorios.documento.repository.DocumentTemplateRepository;
import br.com.sol7.olimpio.shared.PagedResponse;
import io.quarkus.hibernate.reactive.panache.Panache;
import io.quarkus.hibernate.reactive.panache.PanacheQuery;
import io.quarkus.panache.common.Parameters;
import io.quarkus.hibernate.reactive.panache.common.WithTransaction;
import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.NotFoundException;

import java.util.Base64;
import java.util.List;
import java.time.LocalDateTime;

@ApplicationScoped
@WithTransaction
public class DocumentTemplateService {

    @Inject
    DocumentTemplateRepository repository;

    public Uni<PagedResponse<DocumentTemplateResponse>> paged(int page, int size, String tipoRelatorio, Long relatorioId) {
        int p = Math.max(0, page);
        int s = (size == 10 || size == 20 || size == 50 || size == 100) ? size : 10;

        StringBuilder queryStr = new StringBuilder("SELECT t FROM DocumentTemplate t WHERE 1=1");
        Parameters params = Parameters.with("", "");

        if (tipoRelatorio != null && !tipoRelatorio.isBlank()) {
            queryStr.append(" AND t.tipoRelatorio = :tipoRelatorio");
            params = params.and("tipoRelatorio", tipoRelatorio);
        }
        if (relatorioId != null) {
            queryStr.append(" AND t.relatorioId = :relatorioId");
            params = params.and("relatorioId", relatorioId);
        }

        queryStr.append(" ORDER BY t.dataCadastro DESC");

        PanacheQuery<DocumentTemplate> query = DocumentTemplate.find(queryStr.toString(), params);
        return query.page(p, s).list()
                .chain(items -> query.count().map(count -> {
                    List<DocumentTemplateResponse> responses = items.stream().map(this::toResponse).toList();
                    long total = count;
                    int from = Math.min(p * s, responses.size());
                    int to = Math.min(from + s, responses.size());
                    return new PagedResponse<>(responses.subList(from, to), total, p, s);
                }));
    }

    public Uni<DocumentTemplateResponse> find(Long id) {
        return repository.findById(id)
                .onItem().ifNull().failWith(() -> new NotFoundException("Template not found"))
                .map(this::toResponse);
    }

    public Uni<DocumentTemplateResponse> create(DocumentTemplateRequest r) {
        return Panache.getSession()
                .chain(session -> {
                    DocumentTemplate e = new DocumentTemplate();
                    apply(e, r);
                    return session.persist(e).replaceWith(() -> toResponse(e));
                });
    }

    public Uni<DocumentTemplateResponse> update(Long id, DocumentTemplateRequest r) {
        return repository.findById(id)
                .onItem().ifNull().failWith(() -> new NotFoundException("Template not found"))
                .invoke(e -> apply(e, r))
                .onItem().transformToUni(e -> Panache.getSession().chain(s -> s.merge(e)).replaceWith(() -> toResponse(e)));
    }

    public Uni<Void> delete(Long id) {
        return repository.deleteById(id)
                .onItem().transformToUni(deleted -> deleted ? Uni.createFrom().voidItem()
                        : Uni.createFrom().failure(new NotFoundException("Template not found")));
    }

    public Uni<List<DocumentTemplateResponse>> listByRelatorio(String tipoRelatorio, Long relatorioId) {
        return repository.findByTipoRelatorioAndRelatorioId(tipoRelatorio, relatorioId)
                .map(list -> list.stream().map(this::toResponse).toList());
    }

    public Uni<DocumentTemplateOpcoesResponse> opcoes(String tipoRelatorio, Long relatorioId) {
        return listByRelatorio(tipoRelatorio, relatorioId)
                .map(templates -> new DocumentTemplateOpcoesResponse(tipoRelatorio, relatorioId, templates));
    }

    private void apply(DocumentTemplate e, DocumentTemplateRequest r) {
        e.nome = r.nome();
        e.descricao = r.descricao();
        e.arquivoNome = r.arquivoNome();
        if (r.arquivoDadosBase64() != null && !r.arquivoDadosBase64().isBlank()) {
            e.arquivoDados = Base64.getDecoder().decode(r.arquivoDadosBase64());
        }
        e.tipoRelatorio = r.tipoRelatorio();
        e.relatorioId = r.relatorioId();
        e.ativo = r.ativo() != null ? r.ativo() : true;
        e.dataAlteracao = LocalDateTime.now();
    }

    private DocumentTemplateResponse toResponse(DocumentTemplate e) {
        return new DocumentTemplateResponse(
                e.id,
                e.nome,
                e.descricao,
                e.arquivoNome,
                e.tipoRelatorio,
                e.relatorioId,
                e.ativo,
                e.dataCadastro,
                e.dataAlteracao,
                e.usuarioId
        );
    }
}