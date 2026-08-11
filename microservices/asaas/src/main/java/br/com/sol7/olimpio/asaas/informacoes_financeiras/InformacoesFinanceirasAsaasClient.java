package br.com.sol7.olimpio.asaas.informacoes_financeiras;

import br.com.sol7.olimpio.asaas.AsaasAuth;
import com.fasterxml.jackson.databind.JsonNode;
import io.smallrye.mutiny.Uni;
import jakarta.ws.rs.*;
import org.eclipse.microprofile.rest.client.inject.RegisterRestClient;
import org.eclipse.microprofile.rest.client.annotation.ClientHeaderParam;

/**
 * Cliente REST reativo para os endpoints Asaas do grupo "Informações financeiras" (gerado a partir da
 * collection Postman "Asaas Collection"). Repassa o corpo/consulta como JSON generico
 * (JsonNode) - ver AsaasAuth para o header de autenticacao (access_token).
 */
@RegisterRestClient(configKey = "asaas-api")
@ClientHeaderParam(name = "access_token", value = "{br.com.sol7.olimpio.asaas.AsaasAuth.token}")
public interface InformacoesFinanceirasAsaasClient {


    // Recuperar saldo da conta (GET /v3/finance/balance)
    @GET
    @Path("/v3/finance/balance")
    Uni<JsonNode> recuperarSaldoDaConta();


    // Estatísticas de cobranças (GET /v3/finance/payment/statistics)
    @GET
    @Path("/v3/finance/payment/statistics")
    Uni<JsonNode> estatisticasDeCobrancas(@QueryParam("customer") String customer, @QueryParam("billingType") String billingType, @QueryParam("status") String status, @QueryParam("anticipated") String anticipated, @QueryParam("dateCreated[ge]") String dateCreated_ge_, @QueryParam("dateCreated[le]") String dateCreated_le_, @QueryParam("dueDate[ge]") String dueDate_ge_, @QueryParam("dueDate[le]") String dueDate_le_, @QueryParam("estimatedCreditDate[ge]") String estimatedCreditDate_ge_, @QueryParam("estimatedCreditDate[le]") String estimatedCreditDate_le_, @QueryParam("externalReference") String externalReference);


    // Recuperar valores de split (GET /v3/finance/split/statistics)
    @GET
    @Path("/v3/finance/split/statistics")
    Uni<JsonNode> recuperarValoresDeSplit();

}
