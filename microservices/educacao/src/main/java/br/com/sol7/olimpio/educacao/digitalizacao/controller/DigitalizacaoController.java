package br.com.sol7.olimpio.educacao.digitalizacao;

import io.smallrye.mutiny.Uni;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.*;
import jakarta.ws.rs.container.ContainerRequestContext;
import jakarta.ws.rs.core.Context;

import java.util.List;
import java.util.Map;
import java.util.Set;

@Path("/api/educacao/digitalizacao")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class DigitalizacaoController {
    @Inject
    DigitalizacaoService service;

    @GET
    @Path("/turmasDisponiveis")
    public Uni<List<DigitalizacaoService.TurmaOption>> turmasDisponiveis(
            @QueryParam("query") String query) {
        // unidades would come from authenticated user context
        return service.turmasDisponiveis(query != null ? query : "", List.of());
    }

    @POST
    @Path("/carregarDiasAula")
    public Uni<DigitalizacaoService.CarregarDiasAulaResponse> carregarDiasAula(
            Map<String, Object> body) {
        Long oferecimentoId = ((Number) body.get("oferecimentoComponenteCurricularId")).longValue();
        return service.carregarDiasAula(oferecimentoId);
    }

    @GET
    @Path("/digitalizacaoChamadas")
    public Uni<List<DigitalizacaoService.ChamadaItem>> digitalizacaoChamadas(
            @QueryParam("turmaId") Long turmaId) {
        return service.digitalizacaoChamadas(turmaId);
    }

    @POST
    @Path("/carregarOcorrencia")
    public Uni<DigitalizacaoService.CarregarOcorrenciaResponse> carregarOcorrencia(
            Map<String, Object> body) {
        Long digitalizacaoChamadaId = ((Number) body.get("digitalizacaoChamadaId")).longValue();
        return service.carregarOcorrencia(digitalizacaoChamadaId);
    }

    @GET
    @Path("/autoCompleteAluno")
    public Uni<List<DigitalizacaoService.AlunoOption>> autoCompleteAluno(
            @QueryParam("query") String query) {
        // unidades would come from authenticated user context
        return service.autoCompleteAluno(query != null ? query : "", List.of());
    }

    @GET
    @Path("/carregarDocumentosAluno")
    public Uni<List<DigitalizacaoService.DocumentoAlunoItem>> carregarDocumentosAluno(
            @QueryParam("pessoaId") Long pessoaId) {
        return service.carregarDocumentosAluno(pessoaId);
    }

    @POST
    @Path("/salvarDocumentoAluno")
    public Uni<Void> salvarDocumentoAluno(
            Map<String, Object> body) {
        Long pessoaId = ((Number) body.get("pessoaId")).longValue();
        String nomeDocumento = (String) body.get("nomeDocumento");
        String arquivo = (String) body.get("arquivo");
        Long usuarioId = 1L; // would come from auth context
        return service.salvarDocumentoAluno(pessoaId, nomeDocumento, arquivo, usuarioId);
    }

    @POST
    @Path("/inserirArquivo")
    public Uni<Void> inserirArquivo(
            Map<String, Object> body) {
        Long contratoId = ((Number) body.get("contratoId")).longValue();
        String arquivo = (String) body.get("arquivo");
        Long usuarioId = 1L; // would come from auth context
        return service.inserirArquivo(contratoId, arquivo, usuarioId);
    }

    @POST
    @Path("/inserirChamada")
    public Uni<Void> inserirChamada(
            Map<String, Object> body) {
        Long digitalizacaoChamadaId = ((Number) body.get("digitalizacaoChamadaId")).longValue();
        String arquivo = (String) body.get("arquivo");
        Long usuarioId = 1L; // would come from auth context
        return service.inserirChamada(digitalizacaoChamadaId, arquivo, usuarioId);
    }

    @POST
    @Path("/salvarChamada")
    public Uni<Void> salvarChamada(
            Map<String, Object> body) {
        Long digitalizacaoChamadaId = ((Number) body.get("digitalizacaoChamadaId")).longValue();
        Long usuarioId = 1L; // would come from auth context
        return service.salvarChamada(digitalizacaoChamadaId, usuarioId);
    }
}