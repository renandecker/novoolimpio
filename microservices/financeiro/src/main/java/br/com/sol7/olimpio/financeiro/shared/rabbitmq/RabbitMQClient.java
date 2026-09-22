package br.com.sol7.olimpio.financeiro.shared.rabbitmq;

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
public class RabbitMQClient {

    @Inject
    @Channel("requests-out")
    MutinyEmitter<RabbitMQRequest> requestEmitter;

    @Inject
    @Channel("responses-out")
    MutinyEmitter<RabbitMQResponse> responseEmitter;

    private final Map<String, CompletableFuture<RabbitMQResponse>> pendingRequests = new ConcurrentHashMap<>();
    private final Map<String, Consumer<RabbitMQResponse>> responseHandlers = new ConcurrentHashMap<>();

    public Uni<RabbitMQResponse> request(String service, String action, Map<String, Object> params) {
        RabbitMQRequest request = RabbitMQRequest.of(service, action, params);
        String correlationId = request.getCorrelationId();

        CompletableFuture<RabbitMQResponse> future = new CompletableFuture<>();
        pendingRequests.put(correlationId, future);

        return requestEmitter.send(request)
                .onFailure().invoke(err -> {
                    pendingRequests.remove(correlationId);
                    future.completeExceptionally(err);
                })
                .replaceWith(Uni.createFrom().completionStage(future));
    }

    public void handleResponse(RabbitMQResponse response) {
        String correlationId = response.getCorrelationId();
        if (correlationId == null) {
            Log.warn("Received RabbitMQResponse without correlationId");
            return;
        }

        CompletableFuture<RabbitMQResponse> future = pendingRequests.remove(correlationId);
        if (future != null) {
            future.complete(response);
        } else {
            Consumer<RabbitMQResponse> handler = responseHandlers.get(correlationId);
            if (handler != null) {
                handler.accept(response);
            } else {
                Log.debugf("No handler found for correlationId: %s", correlationId);
            }
        }
    }

    public void registerResponseHandler(String correlationId, Consumer<RabbitMQResponse> handler) {
        responseHandlers.put(correlationId, handler);
    }

    public void removeResponseHandler(String correlationId) {
        responseHandlers.remove(correlationId);
    }

    public Uni<Void> sendResponse(RabbitMQResponse response) {
        return responseEmitter.send(response)
                .onFailure().invoke(err -> Log.errorf("Failed to send RabbitMQ response: %s", err.getMessage()));
    }
}