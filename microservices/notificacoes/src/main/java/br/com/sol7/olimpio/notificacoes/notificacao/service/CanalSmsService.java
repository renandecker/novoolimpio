package br.com.sol7.olimpio.notificacoes.notificacao.service;

import br.com.sol7.olimpio.notificacoes.notificacao.dto.NotificacaoMessage;
import br.com.sol7.olimpio.shared.TupleHelper;
import io.quarkus.hibernate.reactive.panache.Panache;
import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.persistence.Tuple;
import org.eclipse.microprofile.config.inject.ConfigProperty;
import org.eclipse.microprofile.rest.client.inject.RestClient;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

import java.util.Optional;

@ApplicationScoped
public class CanalSmsService {

    private static final Logger LOGGER = LoggerFactory.getLogger(CanalSmsService.class);

    @Inject
    @RestClient
    SmsGatewayClient smsGatewayClient;

    @ConfigProperty(name = "olimpio.notificacoes.sms.primary-provider", defaultValue = "textbee")
    Optional<String> primaryProviderConfig; // "textbee" ou "smsgatewayme"

    @ConfigProperty(name = "olimpio.notificacoes.sms.textbee.api-key", defaultValue = "")
    Optional<String> textbeeApiKeyConfig;

    @ConfigProperty(name = "olimpio.notificacoes.sms.textbee.device-id", defaultValue = "")
    Optional<String> textbeeDeviceIdConfig;

    @ConfigProperty(name = "olimpio.notificacoes.sms.smsgatewayme.api-key", defaultValue = "")
    Optional<String> smsgatewaymeApiKeyConfig;

    @ConfigProperty(name = "olimpio.notificacoes.sms.smsgatewayme.device-id", defaultValue = "")
    Optional<String> smsgatewaymeDeviceIdConfig;

    public Uni<Void> enviar(NotificacaoMessage msg) {
        if (msg == null) {
            return Uni.createFrom().voidItem();
        }
        return resolveConfigSms()
                .chain(config -> {
                    String phone = resolvePhone(msg.username(), config.defaultPhone);
                    if (phone == null || phone.isBlank()) {
                        LOGGER.warn("Telefone do destinatário não encontrado para '{}'. SMS não enviado.", msg.username());
                        return Uni.createFrom().voidItem();
                    }

                    String text = formatMessage(msg);

                    // Tentativa Primária com fallback automático para o provedor secundário em caso de falha/intermitência
                    return tentarEnviar(config.primaryProvider, config, phone, text)
                            .onFailure().recoverWithUni(err -> {
                                LOGGER.warn("Provedor SMS primário ({}) falhou ({}). Tentando provedor secundário...", config.primaryProvider, err.getMessage());
                                String secondaryProvider = "textbee".equalsIgnoreCase(config.primaryProvider) ? "smsgatewayme" : "textbee";
                                return tentarEnviar(secondaryProvider, config, phone, text)
                                        .onFailure().invoke(errSec ->
                                                LOGGER.warn("Provedor SMS secundário ({}) também falhou: {}", secondaryProvider, errSec.getMessage()));
                            })
                            .chain(() -> marcaSmsEnviado(msg.id()));
                });
    }

    private record SmsConfig(
            String primaryProvider,
            String textbeeKey,
            String textbeeDevice,
            String smsgwKey,
            String smsgwDevice,
            String defaultPhone
    ) {}

    private Uni<SmsConfig> resolveConfigSms() {
        return Panache.getSession()
                .chain(session -> session.createNativeQuery(
                        "SELECT destinatario, descricao FROM not_config_canal WHERE canal = 'SMS' LIMIT 1", Tuple.class)
                        .getResultList())
                .map(list -> {
                    String primary = primaryProviderConfig.orElse("textbee").trim().toLowerCase();
                    String tbKey = textbeeApiKeyConfig.orElse("");
                    String tbDev = textbeeDeviceIdConfig.orElse("");
                    String sgKey = smsgatewaymeApiKeyConfig.orElse("");
                    String sgDev = smsgatewaymeDeviceIdConfig.orElse("");
                    String defPhone = "";

                    if (!list.isEmpty() && list.get(0) != null) {
                        Tuple row = (Tuple) list.get(0);
                        String dest = TupleHelper.getString(row, "destinatario");
                        String desc = TupleHelper.getString(row, "descricao");
                        if (dest != null && !dest.isBlank()) {
                            defPhone = dest;
                        }
                        if (desc != null && !desc.isBlank()) {
                            if (desc.contains(":")) {
                                String[] parts = desc.split(":");
                                if (parts.length > 0 && !parts[0].isBlank()) tbKey = parts[0].trim();
                                if (parts.length > 1 && !parts[1].isBlank()) tbDev = parts[1].trim();
                            } else {
                                tbKey = desc;
                            }
                        }
                    }
                    return new SmsConfig(primary, tbKey, tbDev, sgKey, sgDev, defPhone);
                });
    }

    private String resolvePhone(String username, String defaultPhone) {
        if (username == null || username.isBlank()) {
            return defaultPhone;
        }
        return defaultPhone; // Poderia buscar em bas_pessoa via query reativa se necessário
    }

    private Uni<Void> tentarEnviar(String provider, SmsConfig config, String phone, String text) {
        if ("textbee".equalsIgnoreCase(provider)) {
            if (config.textbeeKey == null || config.textbeeKey.isBlank()) {
                return Uni.createFrom().failure(new RuntimeException("Textbee API Key não configurada"));
            }
            return smsGatewayClient.sendTextbee(config.textbeeKey, config.textbeeDevice, phone, text)
                    .chain(resp -> checkResponse(resp, "Textbee"));
        } else {
            if (config.smsgwKey == null || config.smsgwKey.isBlank()) {
                return Uni.createFrom().failure(new RuntimeException("SMS Gateway Me API Key não configurada"));
            }
            return smsGatewayClient.sendSmsGatewayMe(config.smsgwKey, config.smsgwDevice, phone, text)
                    .chain(resp -> checkResponse(resp, "SMS Gateway Me"));
        }
    }

    private Uni<Void> checkResponse(Response resp, String providerName) {
        if (resp.getStatus() >= 200 && resp.getStatus() < 300) {
            return Uni.createFrom().voidItem();
        } else {
            return Uni.createFrom().failure(new RuntimeException(providerName + " API error status: " + resp.getStatus()));
        }
    }

    private Uni<Void> marcaSmsEnviado(Long id) {
        if (id == null) {
            return Uni.createFrom().voidItem();
        }
        return Panache.getSession()
                .chain(session -> session.createNativeQuery(
                        "UPDATE not_notificacao SET sms_enviado = true WHERE id = ?1 AND sms_enviado = false")
                        .setParameter(1, id)
                        .executeUpdate())
                .replaceWithVoid();
    }

    private String formatMessage(NotificacaoMessage msg) {
        StringBuilder sb = new StringBuilder();
        sb.append(msg.titulo());
        if (msg.mensagem() != null && !msg.mensagem().isBlank()) {
            sb.append(": ").append(msg.mensagem());
        }
        if (sb.length() > 160) {
            return sb.substring(0, 157) + "...";
        }
        return sb.toString();
    }

    @org.eclipse.microprofile.rest.client.inject.RegisterRestClient(baseUri = "https://api.textbee.dev")
    public interface SmsGatewayClient {
        @POST
        @Path("/api/v1/gateway/devices/{deviceId}/send-sms")
        @Consumes(MediaType.APPLICATION_JSON)
        @Produces(MediaType.APPLICATION_JSON)
        Uni<Response> sendTextbee(
                @HeaderParam("x-api-key") String apiKey,
                @PathParam("deviceId") String deviceId,
                @QueryParam("recipients") String recipients,
                @QueryParam("message") String message
        );

        @POST
        @Path("/api/v4/smsgateway/send")
        @Consumes(MediaType.APPLICATION_JSON)
        @Produces(MediaType.APPLICATION_JSON)
        Uni<Response> sendSmsGatewayMe(
                @HeaderParam("Authorization") String apiKey,
                @QueryParam("device") String deviceId,
                @QueryParam("number") String number,
                @QueryParam("message") String message
        );
    }
}
