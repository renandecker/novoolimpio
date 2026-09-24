package br.com.sol7.olimpio.notificacoes.notificacao.service;

import br.com.sol7.olimpio.notificacoes.notificacao.dto.NotificacaoMessage;
import io.quarkus.hibernate.reactive.panache.Panache;
import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.eclipse.microprofile.config.inject.ConfigProperty;
import org.eclipse.microprofile.rest.client.inject.RestClient;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

import java.util.Optional;

@ApplicationScoped
public class CanalWhatsappService {

    private static final Logger LOGGER = LoggerFactory.getLogger(CanalWhatsappService.class);

    @Inject
    @RestClient
    WhatsappClient whatsappClient;

    @ConfigProperty(name = "olimpio.notificacoes.whatsapp.service-url", defaultValue = "http://localhost:3000")
    Optional<String> whatsappServiceUrl;

    public Uni<Void> enviar(NotificacaoMessage msg) {
        if (msg == null) {
            return Uni.createFrom().voidItem();
        }
        return resolvePhone(msg.username())
                .chain(phone -> {
                    if (phone == null || phone.isBlank()) {
                        LOGGER.warn("Telefone/WhatsApp não encontrado para o usuário '{}'. Mensagem não enviada.", msg.username());
                        return Uni.createFrom().voidItem();
                    }

                    String text = formatMessage(msg);
                    return whatsappClient.sendMessage(phone, text)
                            .onItem().transformToUni(resp -> {
                                if (resp.getStatus() >= 200 && resp.getStatus() < 300) {
                                    return Uni.createFrom().voidItem();
                                } else {
                                    LOGGER.warn("Erro no microsserviço notificacoes-whatsap (status {})", resp.getStatus());
                                    return Uni.createFrom().failure(new RuntimeException("WhatsApp microservice error: " + resp.getStatus()));
                                }
                            })
                            .onFailure().invoke(err ->
                                    LOGGER.warn("Falha ao enviar mensagem WhatsApp para '{}': {}", phone, err.getMessage()))
                            .replaceWithVoid()
                            .chain(() -> marcaWhatsappEnviado(msg.id()));
                });
    }

    private Uni<String> resolvePhone(String username) {
        if (username == null || username.isBlank()) {
            return Uni.createFrom().item("");
        }
        return Panache.getSession()
                .chain(session -> session.createNativeQuery("""
                        SELECT p.telefone
                        FROM bas_login l
                        LEFT JOIN bas_usuario u ON u.id = l.id_usuario
                        LEFT JOIN bas_pessoa p ON p.id = u.id_pessoa
                        WHERE lower(l.username) = lower(?1)
                        LIMIT 1
                        """)
                        .setParameter(1, username)
                        .getResultList())
                .map(list -> {
                    if (!list.isEmpty() && list.get(0) != null) {
                        return list.get(0).toString().trim();
                    }
                    return "";
                });
    }

    private Uni<Void> marcaWhatsappEnviado(Long id) {
        if (id == null) {
            return Uni.createFrom().voidItem();
        }
        return Panache.getSession()
                .chain(session -> session.createNativeQuery(
                        "UPDATE not_notificacao SET whatsapp_enviado = true WHERE id = ?1 AND whatsapp_enviado = false")
                        .setParameter(1, id)
                        .executeUpdate())
                .replaceWithVoid();
    }

    private String formatMessage(NotificacaoMessage msg) {
        StringBuilder sb = new StringBuilder();
        sb.append("💬 *").append(msg.titulo()).append("*\n\n");
        if (msg.mensagem() != null && !msg.mensagem().isBlank()) {
            sb.append(msg.mensagem()).append("\n\n");
        }
        if (msg.link() != null && !msg.link().isBlank()) {
            sb.append("🔗 ").append(msg.link()).append("\n");
        }
        sb.append("\n_Equipe Olímpio_");
        return sb.toString();
    }

    @org.eclipse.microprofile.rest.client.inject.RegisterRestClient(configKey = "whatsapp-service")
    public interface WhatsappClient {
        @POST
        @Path("/api/send")
        @Consumes(MediaType.APPLICATION_JSON)
        @Produces(MediaType.APPLICATION_JSON)
        Uni<Response> sendMessage(
                @QueryParam("phone") String phone,
                @QueryParam("message") String message
        );
    }
}
