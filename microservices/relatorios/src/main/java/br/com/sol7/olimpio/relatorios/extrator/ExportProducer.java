package br.com.sol7.olimpio.relatorios.extrator;

import br.com.sol7.olimpio.relatorios.extrator.dto.ExportRequest;
import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import org.eclipse.microprofile.reactive.messaging.Channel;
import org.eclipse.microprofile.reactive.messaging.Emitter;
import jakarta.inject.Inject;

@ApplicationScoped
public class ExportProducer {

    @Inject
    @Channel("export-requests")
    Emitter<ExportRequest> emitter;

    public Uni<Void> enviar(ExportRequest request) {
        return Uni.createFrom().completionStage(emitter.send(request));
    }
}
