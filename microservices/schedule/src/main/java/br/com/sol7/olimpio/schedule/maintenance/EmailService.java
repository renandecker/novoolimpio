package br.com.sol7.olimpio.schedule.maintenance;

import io.smallrye.mutiny.Uni;
import io.vertx.mutiny.core.Vertx;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.eclipse.microprofile.config.inject.ConfigProperty;
import org.jboss.logging.Logger;

import io.quarkus.mailer.Mail;
import io.quarkus.mailer.reactive.ReactiveMailer;

@ApplicationScoped
public class EmailService {

    private static final Logger LOG = Logger.getLogger(EmailService.class);

    @Inject
    ReactiveMailer mailer;

    @Inject
    Vertx vertx;

    @ConfigProperty(name = "schedule.email.enabled", defaultValue = "true")
    boolean emailEnabled;

    public Uni<Void> enviarEmailFechamentoCaixa(String destinatario, String assunto, String corpoHtml) {
        if (!emailEnabled) {
            LOG.info("Envio de e-mail desabilitado via configuracao (schedule.email.enabled=false)");
            return Uni.createFrom().voidItem();
        }
        if (destinatario == null || destinatario.isBlank()) {
            LOG.warn("Destinatario vazio - e-mail de fechamento de caixa nao enviado");
            return Uni.createFrom().voidItem();
        }
        return mailer.send(Mail.withHtml(destinatario, assunto, corpoHtml))
                .onItem().invoke(() -> LOG.infof("E-mail de fechamento de caixa enviado para %s", destinatario))
                .onFailure().invoke(e -> LOG.errorf(e, "Falha ao enviar e-mail de fechamento de caixa para %s", destinatario))
                .replaceWithVoid();
    }
}