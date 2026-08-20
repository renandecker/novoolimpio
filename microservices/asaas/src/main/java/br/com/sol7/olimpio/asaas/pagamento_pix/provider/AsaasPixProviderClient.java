package br.com.sol7.olimpio.asaas.pagamento_pix.provider;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

import java.math.BigDecimal;
import java.time.LocalDate;

import org.eclipse.microprofile.rest.client.inject.RestClient;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Implementacao real de {@link PixProviderClient} usando o Asaas (mesmo PSP do asaas-service).
 * Fluxo movido do fiserv para o asaas-service. Como NAO esta marcada com @DefaultBean,
 * o Quarkus a injeta no lugar do StubPixProviderClient automaticamente.
 * <p>
 * Fluxo de criacao: garante um cliente Asaas (busca por CPF/CNPJ ou cria), cria a cobranca
 * PIX (POST /v3/payments, billingType=PIX) e obtem o payload EMV do QR Code
 * (GET /v3/payments/{id}/pixQrCode). A consulta de status usa GET /v3/payments/{id}.
 */
@ApplicationScoped
public class AsaasPixProviderClient implements PixProviderClient {

    private static final Logger LOGGER = LoggerFactory.getLogger(AsaasPixProviderClient.class);

    @Inject
    @RestClient
    PagamentoPixAsaasClient client;

    @Inject
    ObjectMapper mapper;

    @Override
    public Uni<PixCharge> criarCobranca(String cpfPagador, String descricao, BigDecimal valor, LocalDate vencimento) {
        return garantirCliente(cpfPagador)
                .onItem().transformToUni(customerId -> {
                    ObjectNode body = mapper.createObjectNode();
                    body.put("customer", customerId);
                    body.put("billingType", "PIX");
                    body.put("value", valor);
                    body.put("dueDate", vencimento.toString());
                    body.put("description", descricao);
                    return client.criarCobrancaPix(body);
                })
                .onItem().transformToUni(payment -> {
                    String chargeId = payment.path("id").asText(null);
                    if (chargeId == null) {
                        LOGGER.error("Asaas nao retornou id da cobranca: {}", payment);
                        return Uni.createFrom().failure(new IllegalStateException("Falha ao criar cobranca PIX no Asaas"));
                    }
                    String situacao = normalizarStatus(payment.path("status").asText("PENDING"));
                    return client.obterQrCodePix(chargeId)
                            .map(qr -> new PixCharge(chargeId, qr.path("payload").asText(null), null, situacao))
                            .onFailure().invoke(err -> LOGGER.warn(
                                    "Nao foi possivel obter o QR Code PIX ({}): {} - a cobranca foi criada", chargeId, err.getMessage()))
                            .onFailure().recoverWithItem(new PixCharge(chargeId, null, null, situacao));
                });
    }

    @Override
    public Uni<PixChargeStatus> consultarStatus(String chargeId) {
        return client.recuperarCobranca(chargeId)
                .map(payment -> new PixChargeStatus(
                        chargeId,
                        normalizarStatus(payment.path("status").asText("PENDING")),
                        valorPago(payment),
                        payment.path("pixTransaction").path("endToEndId").asText(null)));
    }

    private Uni<String> garantirCliente(String cpfCnpj) {
        return client.listarClientes(cpfCnpj)
                .map(resposta -> {
                    JsonNode dados = resposta.path("data");
                    return dados.isArray() && dados.size() > 0 ? dados.get(0).path("id").asText(null) : null;
                })
                .onItem().transformToUni(existing -> existing != null
                        ? Uni.createFrom().item(existing)
                        : criarCliente(cpfCnpj));
    }

    private Uni<String> criarCliente(String cpfCnpj) {
        ObjectNode body = mapper.createObjectNode();
        body.put("name", "Cliente Olimpio " + cpfCnpj);
        body.put("cpfCnpj", cpfCnpj);
        return client.criarCliente(body).map(c -> c.path("id").asText(null));
    }

    private BigDecimal valorPago(JsonNode payment) {
        JsonNode valor = payment.path("paidValue");
        if (valor.isNumber()) {
            return valor.decimalValue();
        }
        if (valor.isTextual()) {
            try {
                return new BigDecimal(valor.asText());
            } catch (NumberFormatException ignored) {
                return null;
            }
        }
        return null;
    }

    private String normalizarStatus(String status) {
        if (status == null) {
            return "PENDENTE";
        }
        return switch (status.toUpperCase()) {
            case "RECEIVED","CONFIRMED" ->"PAGO";
            case "REFUNDED" ->"ESTORNADO";
            case "OVERDUE" ->"VENCIDO";
            default ->"PENDENTE";
        } ;
    }
}
