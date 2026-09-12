package br.com.sol7.olimpio.financeiro.shared.kafka;

import io.quarkus.logging.Log;
import io.smallrye.mutiny.Uni;
import io.smallrye.mutiny.infrastructure.Infrastructure;
import io.smallrye.reactive.messaging.MutinyEmitter;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.eclipse.microprofile.reactive.messaging.Channel;

import java.util.Map;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ConcurrentHashMap;
import java.util.function.Consumer;

@ApplicationScoped
public class KafkaClient {

    @Inject
    @Channel("kafka-requests-out")
    MutinyEmitter<KafkaRequest> requestEmitter;

    @Inject
    @Channel("kafka-responses-out")
    MutinyEmitter<KafkaResponse> responseEmitter;

    private final Map<String, CompletableFuture<KafkaResponse>> pendingRequests = new ConcurrentHashMap<>();
    private final Map<String, Consumer<KafkaResponse>> responseHandlers = new ConcurrentHashMap<>();

    public Uni<KafkaResponse> request(String service, String action, Map<String, Object> params) {
        KafkaRequest request = KafkaRequest.of(service, action, params);
        String correlationId = request.getCorrelationId();

        CompletableFuture<KafkaResponse> future = new CompletableFuture<>();
        pendingRequests.put(correlationId, future);

        return requestEmitter.send(request)
                .onFailure().invoke(err -> {
                    pendingRequests.remove(correlationId);
                    future.completeExceptionally(err);
                })
                .replaceWith(Uni.createFrom().completionStage(future));
    }

    public void handleResponse(KafkaResponse response) {
        String correlationId = response.getCorrelationId();
        if (correlationId == null) {
            Log.warn("Received KafkaResponse without correlationId");
            return;
        }

        CompletableFuture<KafkaResponse> future = pendingRequests.remove(correlationId);
        if (future != null) {
            future.complete(response);
        } else {
            Consumer<KafkaResponse> handler = responseHandlers.get(correlationId);
            if (handler != null) {
                handler.accept(response);
            } else {
                Log.debugf("No handler found for correlationId: %s", correlationId);
            }
        }
    }

    public void registerResponseHandler(String correlationId, Consumer<KafkaResponse> handler) {
        responseHandlers.put(correlationId, handler);
    }

    public void removeResponseHandler(String correlationId) {
        responseHandlers.remove(correlationId);
    }

    public Uni<Void> sendResponse(KafkaResponse response) {
        return responseEmitter.send(response)
                .onFailure().invoke(err -> Log.errorf("Failed to send Kafka response: %s", err.getMessage()));
    }
}