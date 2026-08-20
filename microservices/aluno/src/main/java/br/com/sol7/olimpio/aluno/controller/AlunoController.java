package br.com.sol7.olimpio.aluno.controller;

import br.com.sol7.olimpio.aluno.dto.AlunoDtos.AlunoPerfilResponse;
import br.com.sol7.olimpio.aluno.dto.AlunoDtos.BoletimResponse;
import br.com.sol7.olimpio.aluno.dto.AlunoDtos.DashboardResponse;
import br.com.sol7.olimpio.aluno.dto.AlunoDtos.FinanceiroResponse;
import br.com.sol7.olimpio.aluno.dto.AlunoDtos.FrequenciaResponse;
import br.com.sol7.olimpio.aluno.dto.AlunoDtos.HistoricoAlunoResponse;
import br.com.sol7.olimpio.aluno.dto.AlunoDtos.HistoricoCobrancaResponse;
import br.com.sol7.olimpio.aluno.dto.AlunoDtos.HistoricoNapResponse;
import br.com.sol7.olimpio.aluno.dto.AlunoDtos.MatriculaResponse;
import br.com.sol7.olimpio.aluno.dto.AlunoDtos.PessoaDadosResponse;
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

    @Inject
    AlunoService service;

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

    // Endpoints de gestão do aluno (administrativo): dados por pessoaId, usados pelas modais da
    // tela "Gestão do Aluno" (espelham os dialogs de gestaoAluno.xhtml).

    @GET
    @Path("/gestao/{pessoaId}/perfil")
    public Uni<PessoaDadosResponse> gestaoPerfil(@PathParam("pessoaId") Long pessoaId) {
        return service.pessoaDados(pessoaId);
    }

    @GET
    @Path("/gestao/{pessoaId}/contratantes")
    public Uni<List<PessoaDadosResponse>> gestaoContratantes(@PathParam("pessoaId") Long pessoaId) {
        return service.responsaveis(pessoaId);
    }

    @GET
    @Path("/gestao/{pessoaId}/financeiro")
    public Uni<FinanceiroResponse> gestaoFinanceiro(@PathParam("pessoaId") Long pessoaId) {
        return service.financeiroPorPessoa(pessoaId);
    }

    @GET
    @Path("/gestao/{pessoaId}/historico-nap")
    public Uni<HistoricoNapResponse> gestaoHistoricoNap(@PathParam("pessoaId") Long pessoaId) {
        return service.historicoNap(pessoaId);
    }

    @GET
    @Path("/gestao/{pessoaId}/historico-cobranca")
    public Uni<HistoricoCobrancaResponse> gestaoHistoricoCobranca(@PathParam("pessoaId") Long pessoaId) {
        return service.historicoCobranca(pessoaId);
    }

    @GET
    @Path("/gestao/{pessoaId}/boletim")
    public Uni<List<BoletimResponse>> gestaoBoletim(@PathParam("pessoaId") Long pessoaId) {
        return service.boletimCompletoPorPessoa(pessoaId);
    }

    @GET
    @Path("/gestao/{pessoaId}/frequencias")
    public Uni<List<FrequenciaResponse>> gestaoFrequencias(@PathParam("pessoaId") Long pessoaId) {
        return service.frequenciasPorPessoa(pessoaId);
    }

    @GET
    @Path("/gestao/{pessoaId}/historico-aluno")
    public Uni<List<HistoricoAlunoResponse>> gestaoHistoricoAluno(@PathParam("pessoaId") Long pessoaId) {
        return service.historicoAluno(pessoaId);
    }

    private String username(ContainerRequestContext ctx) {
        Object user = ctx.getProperty("authenticatedUser");
        return user == null ? "" : user.toString();
    }
}
