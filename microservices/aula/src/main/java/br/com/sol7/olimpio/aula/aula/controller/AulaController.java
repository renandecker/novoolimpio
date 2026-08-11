package br.com.sol7.olimpio.aula.aula.controller;

import br.com.sol7.olimpio.aula.aula.service.AulaService;
import br.com.sol7.olimpio.aula.dto.AulaDtos.AulaAssistidaRequest;
import br.com.sol7.olimpio.aula.dto.AulaDtos.AulaAssistidaResponse;
import br.com.sol7.olimpio.aula.dto.AulaDtos.AulaRequest;
import br.com.sol7.olimpio.aula.dto.AulaDtos.AulaResponse;
import br.com.sol7.olimpio.aula.dto.AulaDtos.ContratoAulaResponse;
import br.com.sol7.olimpio.aula.dto.AulaDtos.OcorrenciaAulaResponse;
import br.com.sol7.olimpio.aula.dto.AulaDtos.OferecimentoAulaResponse;
import br.com.sol7.olimpio.shared.PagedResponse;
import io.smallrye.mutiny.Uni;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.DELETE;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.PUT;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.QueryParam;
import jakarta.ws.rs.container.ContainerRequestContext;
import jakarta.ws.rs.core.Context;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import java.util.List;

@Path("/api/aula/aula")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class AulaController {

    @Inject
    AulaService service;

    @GET
    public Uni<List<AulaResponse>> list() {
        return service.list();
    }

    @GET
    @Path("/paged")
    public Uni<PagedResponse<AulaResponse>> paged(@QueryParam("page") Integer page, @QueryParam("size") Integer size) {
        return service.paged(page == null ? 0 : page, size == null ? 10 : size);
    }

    @GET
    @Path("/{id}")
    public Uni<AulaResponse> find(@PathParam("id") Long id) {
        return service.find(id);
    }

    @POST
    public Uni<Response> create(@Valid AulaRequest r) {
        return service.create(r).map(item -> Response.status(Response.Status.CREATED).entity(item).build());
    }

    @PUT
    @Path("/{id}")
    public Uni<AulaResponse> update(@PathParam("id") Long id, @Valid AulaRequest r) {
        return service.update(id, r);
    }

    @DELETE
    @Path("/{id}")
    public Uni<Void> delete(@PathParam("id") Long id) {
        return service.delete(id);
    }

    @GET
    @Path("/contratos")
    public Uni<List<ContratoAulaResponse>> contratos(@Context ContainerRequestContext ctx) {
        return service.contratos(username(ctx));
    }

    @GET
    @Path("/oferecimentos")
    public Uni<List<OferecimentoAulaResponse>> oferecimentos(@QueryParam("contratoId") Long contratoId) {
        return service.oferecimentos(contratoId);
    }

    @GET
    @Path("/ocorrencias")
    public Uni<List<OcorrenciaAulaResponse>> ocorrencias(@QueryParam("oferecimentoId") Long oferecimentoId) {
        return service.ocorrencias(oferecimentoId);
    }

    @GET
    @Path("/por-ocorrencia")
    public Uni<List<AulaResponse>> aulasDaOcorrencia(@QueryParam("ocorrenciaId") Long ocorrenciaId) {
        return service.aulasDaOcorrencia(ocorrenciaId);
    }

    @GET
    @Path("/por-oferecimento")
    public Uni<List<AulaResponse>> aulasDoOferecimento(@QueryParam("oferecimentoId") Long oferecimentoId) {
        return service.aulasDoOferecimento(oferecimentoId);
    }

    @POST
    @Path("/{id}/assistida")
    public Uni<AulaAssistidaResponse> marcarAssistida(@Context ContainerRequestContext ctx,
                                                      @PathParam("id") Long aulaId,
                                                      @Valid AulaAssistidaRequest request) {
        if (request != null && request.pessoaId() != null) {
            return service.marcarAssistidaPorPessoa(request.pessoaId(), aulaId);
        }
        return service.marcarAssistida(username(ctx), aulaId);
    }

    @GET
    @Path("/{id}/assistida")
    public Uni<Boolean> jaAssistida(@Context ContainerRequestContext ctx, @PathParam("id") Long aulaId) {
        return service.jaAssistida(username(ctx), aulaId);
    }

    private String username(ContainerRequestContext ctx) {
        Object user = ctx.getProperty("authenticatedUser");
        return user == null ? "" : user.toString();
    }
}
