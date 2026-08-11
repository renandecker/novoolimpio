package br.com.sol7.olimpio.financeiro.lote.controller;

import br.com.sol7.olimpio.financeiro.lote.dto.LoteCobrancaEmailRequest;
import br.com.sol7.olimpio.financeiro.lote.dto.LoteCobrancaLigacaoRequest;
import br.com.sol7.olimpio.financeiro.lote.dto.LoteCobrancaResponse;
import br.com.sol7.olimpio.financeiro.lote.service.LoteCobrancaService;
import io.smallrye.mutiny.Uni;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.QueryParam;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

import java.util.List;

@Path("/api/financeiro/cobranca/lote")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class LoteCobrancaController {

    @Inject
    LoteCobrancaService service;

    @GET
    @Path("/modelos-email")
    public Uni<List<LoteCobrancaResponse.ModeloEmail>> modelosEmail() {
        return service.modelosEmail();
    }

    @GET
    @Path("/alunos")
    public Uni<LoteCobrancaResponse.ResumoAlunos> alunos(@QueryParam("etapasCobrancaId") Long etapasCobrancaId,
                                                         @QueryParam("situacao") String situacao,
                                                         @QueryParam("tipo") Integer tipo,
                                                         @QueryParam("q") String q) {
        return service.alunos(etapasCobrancaId, situacao, tipo, q);
    }

    @POST
    @Path("/email")
    public Uni<LoteCobrancaResponse.Resumo> enviarEmail(@Valid LoteCobrancaEmailRequest request) {
        return service.enviarEmail(request);
    }

    @POST
    @Path("/ligacao")
    public Uni<Response> iniciarLigacao(@Valid LoteCobrancaLigacaoRequest request) {
        return service.iniciarLigacao(request)
                .map(resultado -> Response.status(Response.Status.CREATED).entity(resultado).build());
    }
}
