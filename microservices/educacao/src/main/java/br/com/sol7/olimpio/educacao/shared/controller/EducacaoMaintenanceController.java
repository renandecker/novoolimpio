package br.com.sol7.olimpio.educacao.shared.controller;

import br.com.sol7.olimpio.educacao.shared.rabbitmq.EducacaoRabbitMQProducer;
import io.smallrye.mutiny.Uni;
import jakarta.inject.Inject;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.core.Response;

import java.util.Map;

/**
 * Endpoints REST para disparar manualmente as rotinas de manutencao do dominio educacao
 * no microsservico schedule via RabbitMQ. As acoes sao assincronas: o schedule recebe o
 * trigger e executa a rotina.
 */
@Path("/api/educacao/maintenance")
public class EducacaoMaintenanceController {

    @Inject
    EducacaoRabbitMQProducer rabbitMQProducer;

    @POST
    @Path("/corrigir-avaliacoes")
    public Uni<Response> corrigirAvaliacoes() {
        return rabbitMQProducer.enviarTriggerCorrigirAvaliacoes("corrigirAvaliacoes")
                .map(v -> Response.accepted().entity(Map.of("status", "trigger enviado", "action", "corrigirAvaliacoes")).build());
    }

    @POST
    @Path("/carregar-chamadas-pendentes")
    public Uni<Response> carregarChamadasPendentes() {
        return rabbitMQProducer.enviarTriggerCarregarChamadasPendentes("carregarChamadasPendentes")
                .map(v -> Response.accepted().entity(Map.of("status", "trigger enviado", "action", "carregarChamadasPendentes")).build());
    }

    @POST
    @Path("/remover-extratores-antigos")
    public Uni<Response> removerExtratoresAntigos() {
        return rabbitMQProducer.enviarTriggerRemoverExtratoresAntigos("removerExtratoresAntigos")
                .map(v -> Response.accepted().entity(Map.of("status", "trigger enviado", "action", "removerExtratoresAntigos")).build());
    }
}

