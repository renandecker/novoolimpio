package br.com.sol7.olimpio.educacao.lote.controller;

import br.com.sol7.olimpio.educacao.lote.dto.LoteNapEmailRequest;
import br.com.sol7.olimpio.educacao.lote.dto.LoteNapLigacaoRequest;
import br.com.sol7.olimpio.educacao.lote.dto.LoteNapResponse;
import br.com.sol7.olimpio.educacao.lote.service.LoteNapService;
import br.com.sol7.olimpio.educacao.shared.rabbitmq.EducacaoRabbitMQProducer;
import com.fasterxml.jackson.databind.ObjectMapper;
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

@Path("/api/educacao/nap/lote")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class LoteNapController {

    @Inject
    LoteNapService service;

    @Inject
    EducacaoRabbitMQProducer rabbitMQProducer;

    @Inject
    ObjectMapper objectMapper;

    @GET
    @Path("/modelos-email")
    public Uni<List<LoteNapResponse.ModeloEmail>> modelosEmail() {
        return service.modelosEmail();
    }

    @GET
    @Path("/alunos")
    public Uni<LoteNapResponse.ResumoAlunos> alunos(@QueryParam("etapasNapId") Long etapasNapId,
                                                    @QueryParam("situacao") String situacao,
                                                    @QueryParam("tipo") Integer tipo,
                                                    @QueryParam("q") String q) {
        return service.alunos(etapasNapId, situacao, tipo, q);
    }

    @POST
    @Path("/email")
    public Uni<String> enviarEmail(@Valid LoteNapEmailRequest request) throws Exception {
        String json = objectMapper.writeValueAsString(request);
        return rabbitMQProducer.enviarTriggerEmailNap(json)
                .replaceWith("Trigger de email NAP enviado para o notificacoes");
    }

    @POST
    @Path("/ligacao")
    public Uni<Response> iniciarLigacao(@Valid LoteNapLigacaoRequest request) {
        return service.iniciarLigacao(request)
                .map(resultado -> Response.status(Response.Status.CREATED).entity(resultado).build());
    }
}
