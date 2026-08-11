package br.com.sol7.olimpio.asaas.informacoes_financeiras;

import com.fasterxml.jackson.databind.JsonNode;
import io.smallrye.mutiny.Uni;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import org.eclipse.microprofile.rest.client.inject.RestClient;

/**
 * Endpoints do asaas para o grupo Asaas "Informações financeiras". So repassa para a API do Asaas (via
 * InformacoesFinanceirasAsaasClient) - o access_token real do Asaas fica so aqui no servidor (ver AsaasAuth),
 * nunca precisa ser conhecido por quem chama o asaas.
 */
@Path("/api/asaas")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class InformacoesFinanceirasController {

    @Inject
    @RestClient
    InformacoesFinanceirasAsaasClient client;


    @GET
    @Path("/v3/finance/balance")
    public Uni<JsonNode> recuperarSaldoDaConta() {
        return client.recuperarSaldoDaConta();
    }

    @GET
    @Path("/v3/finance/payment/statistics")
    public Uni<JsonNode> estatisticasDeCobrancas(@QueryParam("customer") String customer, @QueryParam("billingType") String billingType, @QueryParam("status") String status, @QueryParam("anticipated") String anticipated, @QueryParam("dateCreated[ge]") String dateCreated_ge_, @QueryParam("dateCreated[le]") String dateCreated_le_, @QueryParam("dueDate[ge]") String dueDate_ge_, @QueryParam("dueDate[le]") String dueDate_le_, @QueryParam("estimatedCreditDate[ge]") String estimatedCreditDate_ge_, @QueryParam("estimatedCreditDate[le]") String estimatedCreditDate_le_, @QueryParam("externalReference") String externalReference) {
        return client.estatisticasDeCobrancas(customer, billingType, status, anticipated, dateCreated_ge_, dateCreated_le_, dueDate_ge_, dueDate_le_, estimatedCreditDate_ge_, estimatedCreditDate_le_, externalReference);
    }

    @GET
    @Path("/v3/finance/split/statistics")
    public Uni<JsonNode> recuperarValoresDeSplit() {
        return client.recuperarValoresDeSplit();
    }
}
