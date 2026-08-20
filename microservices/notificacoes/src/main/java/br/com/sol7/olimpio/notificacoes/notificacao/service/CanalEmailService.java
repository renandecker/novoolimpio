package br.com.sol7.olimpio.notificacoes.notificacao.service;

import br.com.sol7.olimpio.notificacoes.notificacao.dto.NotificacaoMessage;
import io.quarkus.hibernate.reactive.panache.Panache;
import io.smallrye.mutiny.Uni;
import io.vertx.core.Vertx;
import io.vertx.ext.mail.MailClient;
import io.vertx.ext.mail.MailConfig;
import io.vertx.ext.mail.MailMessage;
import io.vertx.ext.mail.StartTLSOptions;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@ApplicationScoped
public class CanalEmailService {

    private static final Logger LOGGER = LoggerFactory.getLogger(CanalEmailService.class);

    private record ConfigSmtp(String host, Integer port, String username, String password, Boolean tls, Boolean ssl) {
    }

    @Inject
    Vertx vertx;

    public Uni<Void> enviar(NotificacaoMessage msg) {
        return enviar(msg, null);
    }

    public Uni<Void> enviar(NotificacaoMessage msg, String destinatarioOverride) {
        if (msg == null) {
            return Uni.createFrom().voidItem();
        }
        return configSmtpPadrao()
                .chain(config -> {
                    if (config == null || config.host() == null || config.host().isBlank()) {
                        LOGGER.warn("Sem configuração de e-mail (bas_email). Notificação '{}' não enviada por e-mail.", msg.titulo());
                        return Uni.createFrom().voidItem();
                    }
                    return resolveDestinatario(msg.username(), destinatarioOverride)
                            .chain(to -> {
                                if (to == null || to.isBlank()) {
                                    LOGGER.warn("Sem e-mail do destinatário '{}'. Notificação '{}' não enviada por e-mail.", msg.username(), msg.titulo());
                                    return Uni.createFrom().voidItem();
                                }
                                return send(config, to, msg.titulo(), corpo(msg))
                                        .onFailure().invoke(err ->
                                                LOGGER.warn("Falha ao enviar e-mail da notificação '{}' para '{}': {}", msg.titulo(), to, err.getMessage()))
                                        .replaceWithVoid()
                                        .chain(() -> marcaEmailEnviado(msg.id()));
                            });
                });
    }

    private Uni<ConfigSmtp> configSmtpPadrao() {
        return Panache.getSession()
                .chain(session -> session.createNativeQuery(
                        "SELECT host, port, username, password, tls, ssl FROM bas_email WHERE fl_principal = true LIMIT 1")
                        .getResultList())
                .chain(list -> {
                    if (!list.isEmpty()) return Uni.createFrom().item(toConfigSmtp(list.get(0)));
                    return Panache.getSession()
                            .chain(session -> session.createNativeQuery(
                                    "SELECT host, port, username, password, tls, ssl FROM bas_email ORDER BY id ASC LIMIT 1")
                                    .getResultList())
                            .map(rows -> rows.isEmpty() ? null : toConfigSmtp(rows.get(0)));
                });
    }

    private ConfigSmtp toConfigSmtp(Object row) {
        Object[] cols = (Object[]) row;
        return new ConfigSmtp(
                cols[0] == null ? null : cols[0].toString(),
                cols[1] == null ? null : ((Number) cols[1]).intValue(),
                cols[2] == null ? null : cols[2].toString(),
                cols[3] == null ? null : cols[3].toString(),
                cols[4] == null ? null : (Boolean) cols[4],
                cols[5] == null ? null : (Boolean) cols[5]);
    }

    private Uni<String> resolveDestinatario(String username, String destinatarioOverride) {
        if (destinatarioOverride != null && !destinatarioOverride.isBlank()) {
            return Uni.createFrom().item(destinatarioOverride.trim());
        }
        return Panache.getSession()
                .chain(session -> session.createNativeQuery("""
                        SELECT p.email
                        FROM bas_login l
                        LEFT JOIN bas_usuario u ON u.id = l.id_usuario
                        LEFT JOIN bas_pessoa p ON p.id = u.id_pessoa
                        WHERE lower(l.username) = lower( ? 1)
                        LIMIT 1
                        """)
                                .setParameter(1, username)
                                .getResultList())
                .map(list -> list.isEmpty() || list.get(0) == null ? null : list.get(0).toString().trim());
    }

    private Uni<Void> marcaEmailEnviado(Long id) {
        if (id == null) {
            return Uni.createFrom().voidItem();
        }
        return Panache.getSession()
                .chain(session -> session.createNativeQuery(
                        "UPDATE not_notificacao SET email_enviado = true WHERE id = ?1 AND email_enviado = false")
                        .setParameter(1, id)
                        .executeUpdate())
                .replaceWithVoid();
    }

    private String corpo(NotificacaoMessage msg) {
        StringBuilder sb = new StringBuilder();
        sb.append("Olá ").append(msg.username()).append(",\n\n");
        sb.append(msg.titulo()).append("\n\n");
        if (msg.mensagem() != null && !msg.mensagem().isBlank()) {
            sb.append(msg.mensagem()).append("\n\n");
        }
        if (msg.link() != null && !msg.link().isBlank()) {
            sb.append("Acesse: ").append(msg.link()).append("\n");
        }
        sb.append("\nAtenciosamente,\nEquipe Olímpio");
        return sb.toString();
    }

    private Uni<io.vertx.ext.mail.MailResult> send(ConfigSmtp config, String to, String subject, String body) {
        MailConfig mailConfig = new MailConfig();
        mailConfig.setHostname(config.host());
        mailConfig.setPort(config.port() != null && config.port() > 0 ? config.port() : 587);
        mailConfig.setUsername(config.username());
        mailConfig.setPassword(config.password());
        if (Boolean.TRUE.equals(config.ssl())) {
            mailConfig.setSsl(true);
            mailConfig.setStarttls(StartTLSOptions.DISABLED);
        } else {
            mailConfig.setStarttls(Boolean.TRUE.equals(config.tls()) ? StartTLSOptions.OPTIONAL : StartTLSOptions.DISABLED);
        }

        MailMessage message = new MailMessage()
                .setFrom(config.username())
                .setTo(to)
                .setSubject(subject)
                .setText(body);

        MailClient client = MailClient.create(vertx, mailConfig);
        return Uni.createFrom().completionStage(client.sendMail(message).toCompletionStage())
                .onTermination().invoke(client::close);
    }
}
