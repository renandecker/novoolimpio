package br.com.sol7.olimpio.asaas.notificacoes;

import br.com.sol7.olimpio.asaas.AsaasAuth;
import com.fasterxml.jackson.databind.JsonNode;
import io.smallrye.mutiny.Uni;
import jakarta.ws.rs.*;
import org.eclipse.microprofile.rest.client.inject.RegisterRestClient;
import org.eclipse.microprofile.rest.client.annotation.ClientHeaderParam;

/**
 * Cliente REST reativo para os endpoints Asaas do grupo "Notificações" (gerado a partir da
 * collection Postman "Asaas Collection"). Repassa o corpo/consulta como JSON generico
 * (JsonNode) - ver AsaasAuth para o header de autenticacao (access_token).
 */
@RegisterRestClient(configKey = "asaas-api")
@ClientHeaderParam(name = "access_token", value = "{br.com.sol7.olimpio.asaas.AsaasAuth.token}")
public interface NotificacoesAsaasClient {


    // Atualizar notificação existente (PUT /v3/notifications/:id)
    @PUT
    @Path("/v3/notifications/{id}")
    Uni<JsonNode> atualizarNotificacaoExistente(@PathParam("id") String id, JsonNode body);


    // Atualizar notificações existentes em lote (PUT /v3/notifications/batch)
    @PUT
    @Path("/v3/notifications/batch")
    Uni<JsonNode> atualizarNotificacoesExistentesEmLote(JsonNode body);

}
