package br.com.sol7.olimpio.login.service;

import br.com.sol7.olimpio.login.entity.ConfiguracaoEmail;
import br.com.sol7.olimpio.login.repository.ConfiguracaoEmailRepository;
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
public class MailService {
    private static final Logger LOGGER = LoggerFactory.getLogger(MailService.class);

    @Inject Vertx vertx;
    @Inject ConfiguracaoEmailRepository emailConfigRepository;

    public Uni<Void> sendTemporaryPassword(String to, String username, String temporaryPassword) {
        String subject = "Olímpio - Redefinição de senha";
        String body = """
            Olá %s,

            Recebemos uma solicitação para redefinir a sua senha de acesso ao sistema Olímpio.

            Sua senha provisória é: %s

            Acesse o sistema com essa senha e, em seguida, utilize a opção "Trocar senha" do menu para definir uma nova senha pessoal.

            Se você não solicitou essa alteração, ignore este e-mail.

            Atenciosamente,
            Equipe Olímpio
            """.formatted(username, temporaryPassword);
        return emailConfigRepository.findConfiguracaoEmailPadrao()
                .onItem().transformToUni(config -> {
                    if (config == null || config.host == null || config.host.isBlank()) {
                        LOGGER.warn("Sem configuração de e-mail na tabela bas_email. Senha provisória do usuário '{}': {}", username, temporaryPassword);
                        return Uni.createFrom().voidItem();
                    }
                    return send(config, to, subject, body)
                            .onFailure().invoke(error ->
                                    LOGGER.warn("Falha ao enviar e-mail de redefinição de senha para '{}': {}", to, error.getMessage()))
                            .replaceWithVoid();
                });
    }

    private Uni<io.vertx.ext.mail.MailResult> send(ConfiguracaoEmail config, String to, String subject, String body) {
        MailConfig mailConfig = new MailConfig();
        mailConfig.setHostname(config.host);
        mailConfig.setPort(config.port != null && config.port > 0 ? config.port : 587);
        mailConfig.setUsername(config.username);
        mailConfig.setPassword(config.password);
        if (Boolean.TRUE.equals(config.ssl)) {
            mailConfig.setSsl(true);
            mailConfig.setStarttls(StartTLSOptions.DISABLED);
        } else {
            mailConfig.setStarttls(Boolean.TRUE.equals(config.tls) ? StartTLSOptions.OPTIONAL : StartTLSOptions.DISABLED);
        }

        MailMessage message = new MailMessage()
                .setFrom(config.username)
                .setTo(to)
                .setSubject(subject)
                .setText(body);

        MailClient client = MailClient.create(vertx, mailConfig);
        return Uni.createFrom().completionStage(client.sendMail(message).toCompletionStage())
                .onTermination().invoke(() -> client.close());
    }
}
