package br.com.sol7.olimpio.relatorios.documento.controller;

import br.com.sol7.olimpio.relatorios.documento.dto.DocumentTemplateResponse;
import br.com.sol7.olimpio.relatorios.documento.dto.DocumentTemplateRequest;
import br.com.sol7.olimpio.relatorios.documento.dto.DocumentTemplateOpcoesResponse;
import br.com.sol7.olimpio.relatorios.documento.dto.DocumentExportRequest;
import br.com.sol7.olimpio.relatorios.documento.dto.DocumentExportResponse;
import br.com.sol7.olimpio.relatorios.documento.entity.DocumentTemplate;
import br.com.sol7.olimpio.relatorios.documento.service.DocumentGenerationService;
import br.com.sol7.olimpio.relatorios.documento.service.DocumentTemplateService;
import br.com.sol7.olimpio.relatorios.documento.repository.DocumentTemplateRepository;
import br.com.sol7.olimpio.shared.PagedResponse;
import io.smallrye.mutiny.Uni;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

import java.util.Map;

@Path("/api/relatorios/documentos")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class DocumentTemplateController {

    @Inject
    DocumentTemplateService service;

    @Inject
    DocumentGenerationService generationService;

    @Inject
    DocumentTemplateRepository templateRepository;

    @GET
    public Uni<PagedResponse<DocumentTemplateResponse>> listar(
            @QueryParam("page") Integer page,
            @QueryParam("size") Integer size,
            @QueryParam("tipoRelatorio") String tipoRelatorio,
            @QueryParam("relatorioId") Long relatorioId) {
        return service.paged(page == null ? 0 : page, size == null ? 10 : size, tipoRelatorio, relatorioId);
    }

    @GET
    @Path("/{id}")
    public Uni<DocumentTemplateResponse> buscar(@PathParam("id") Long id) {
        return service.find(id);
    }

    @POST
    public Uni<DocumentTemplateResponse> criar(DocumentTemplateRequest request) {
        return service.create(request);
    }

    @PUT
    @Path("/{id}")
    public Uni<DocumentTemplateResponse> atualizar(@PathParam("id") Long id, DocumentTemplateRequest request) {
        return service.update(id, request);
    }

    @DELETE
    @Path("/{id}")
    public Uni<Response> remover(@PathParam("id") Long id) {
        return service.delete(id)
                .replaceWith(Response.noContent()::build);
    }

    @GET
    @Path("/opcoes")
    public Uni<DocumentTemplateOpcoesResponse> opcoes(
            @QueryParam("tipoRelatorio") String tipoRelatorio,
            @QueryParam("relatorioId") Long relatorioId) {
        return service.opcoes(tipoRelatorio, relatorioId);
    }

    @POST
    @Path("/exportar/tabela/{tabelaId}")
    public Uni<DocumentExportResponse> exportarTabela(
            @PathParam("tabelaId") Long tabelaId,
            DocumentExportRequest request) {
        if (request.templateId() == null) {
            return Uni.createFrom().failure(new NotFoundException("Template ID é obrigatório"));
        }
        return templateRepository.findById(request.templateId())
                .onItem().ifNull().failWith(() -> new NotFoundException("Template não encontrado"))
                .onItem().transformToUni(template -> generationService.gerarDocumento(template, request, Map.of()));
    }
}