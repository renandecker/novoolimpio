package br.com.sol7.olimpio.aluno.controller;

import br.com.sol7.olimpio.aluno.dto.AlunoDtos.AlunoPerfilResponse;
import br.com.sol7.olimpio.aluno.dto.AlunoDtos.BoletimResponse;
import br.com.sol7.olimpio.aluno.dto.AlunoDtos.DashboardResponse;
import br.com.sol7.olimpio.aluno.dto.AlunoDtos.FinanceiroResponse;
import br.com.sol7.olimpio.aluno.dto.AlunoDtos.FrequenciaResponse;
import br.com.sol7.olimpio.aluno.dto.AlunoDtos.MatriculaResponse;
import br.com.sol7.olimpio.aluno.service.AlunoService;
import io.smallrye.mutiny.Uni;
import jakarta.inject.Inject;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.container.ContainerRequestContext;
import jakarta.ws.rs.core.Context;
import jakarta.ws.rs.core.MediaType;
import java.util.List;

@Path("/api/aluno")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class AlunoController {

    @Inject AlunoService service;

    @GET
    @Path("/perfil")
    public Uni<AlunoPerfilResponse> perfil(@Context ContainerRequestContext ctx) {
        return service.perfil(username(ctx));
    }

    @GET
    @Path("/dashboard")
    public Uni<DashboardResponse> dashboard(@Context ContainerRequestContext ctx) {
        return service.dashboard(username(ctx));
    }

    @GET
    @Path("/matriculas")
    public Uni<List<MatriculaResponse>> matriculas(@Context ContainerRequestContext ctx) {
        return service.matriculas(username(ctx));
    }

    @GET
    @Path("/boletim")
    public Uni<List<BoletimResponse>> boletimCompleto(@Context ContainerRequestContext ctx) {
        return service.boletimCompleto(username(ctx));
    }

    @GET
    @Path("/boletim/{matriculaId}")
    public Uni<BoletimResponse> boletim(@Context ContainerRequestContext ctx, @PathParam("matriculaId") Long matriculaId) {
        return service.boletim(username(ctx), matriculaId);
    }

    @GET
    @Path("/frequencia/{matriculaId}")
    public Uni<FrequenciaResponse> frequencia(@Context ContainerRequestContext ctx, @PathParam("matriculaId") Long matriculaId) {
        return service.frequencia(username(ctx), matriculaId);
    }

    @GET
    @Path("/financeiro")
    public Uni<FinanceiroResponse> financeiro(@Context ContainerRequestContext ctx) {
        return service.financeiro(username(ctx));
    }

    private String username(ContainerRequestContext ctx) {
        Object user = ctx.getProperty("authenticatedUser");
        return user == null ? "" : user.toString();
    }
}
