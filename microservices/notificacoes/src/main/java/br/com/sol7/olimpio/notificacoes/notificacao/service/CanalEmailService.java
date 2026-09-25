package br.com.sol7.olimpio.notificacoes.notificacao.service;

import br.com.sol7.olimpio.notificacoes.notificacao.dto.NotificacaoMessage;
import br.com.sol7.olimpio.shared.TupleHelper;
import io.quarkus.hibernate.reactive.panache.Panache;
import io.smallrye.mutiny.Uni;
import io.vertx.core.Vertx;
import io.vertx.ext.mail.MailClient;
import io.vertx.ext.mail.MailConfig;
import io.vertx.ext.mail.MailMessage;
import io.vertx.ext.mail.StartTLSOptions;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.persistence.Tuple;
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

    /**
     * Envia um e-mail transacional direto (sem partir de uma notificação gravada),
     * ex.: e-mail de fechamento de caixa publicado pelo schedule-service no tópico
     * {@code olimpio.financeiro.email-manual}. Usa o mesmo SMTP de {@code bas_email}.
     */
    public Uni<Void> enviarDireto(String destinatario, String assunto, String corpoHtml) {
        if (destinatario == null || destinatario.isBlank()) {
            LOGGER.warn("Destinatário vazio - e-mail direto '{}' não enviado.", assunto);
            return Uni.createFrom().voidItem();
        }
        return configSmtpPadrao()
                .chain(config -> {
                    if (config == null || config.host() == null || config.host().isBlank()) {
                        LOGGER.warn("Sem configuração de e-mail (bas_email). E-mail direto '{}' não enviado.", assunto);
                        return Uni.createFrom().voidItem();
                    }
                    return send(config, destinatario.trim(), assunto, corpoHtml)
                            .onFailure().invoke(err ->
                                    LOGGER.warn("Falha ao enviar e-mail direto '{}' para '{}': {}", assunto, destinatario, err.getMessage()))
                            .replaceWithVoid();
                });
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
                                    "SELECT host, port, username, password, tls, ssl FROM bas_email ORDER BY id ASC LIMIT 1", Tuple.class)
                                    .getResultList())
                            .map(rows -> rows.isEmpty() ? null : toConfigSmtp(rows.get(0)));
                });
    }

    private ConfigSmtp toConfigSmtp(Object row) {
        Tuple t = (Tuple) row;
        return new ConfigSmtp(
                TupleHelper.getString(t, "host"),
                TupleHelper.getInteger(t, "port"),
                TupleHelper.getString(t, "username"),
                TupleHelper.getString(t, "password"),
                TupleHelper.getBoolean(t, "tls"),
                TupleHelper.getBoolean(t, "ssl"));
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
                        WHERE lower(l.username) = lower(?1)
                        LIMIT 1
                        """, Tuple.class)
                                .setParameter(1, username)
                                .getResultList())
                .map(list -> list.isEmpty() || list.get(0) == null ? null : TupleHelper.getString(list.get(0), "email"));
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
