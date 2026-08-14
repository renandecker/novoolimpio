package br.com.sol7.olimpio.aluno.aula.controller;

import br.com.sol7.olimpio.aluno.aula.dto.AulaDtos.AulaAssistidaRequest;
import br.com.sol7.olimpio.aluno.aula.dto.AulaDtos.AulaAssistidaResponse;
import br.com.sol7.olimpio.aluno.aula.dto.AulaDtos.AulaResponse;
import br.com.sol7.olimpio.aluno.aula.dto.AulaDtos.ContratoAulaResponse;
import br.com.sol7.olimpio.aluno.aula.dto.AulaDtos.OcorrenciaAulaResponse;
import br.com.sol7.olimpio.aluno.aula.dto.AulaDtos.OferecimentoAulaResponse;
import br.com.sol7.olimpio.aluno.aula.service.AulaService;
import io.smallrye.mutiny.Uni;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.QueryParam;
import jakarta.ws.rs.container.ContainerRequestContext;
import jakarta.ws.rs.core.Context;
import jakarta.ws.rs.core.MediaType;
import java.util.List;

@Path("/api/aluno/aula")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class AulaController {

    @Inject
    AulaService service;

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

    @GET
    @Path("/{id}")
    public Uni<AulaResponse> find(@PathParam("id") Long id) {
        return service.find(id);
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
