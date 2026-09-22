package br.com.sol7.olimpio.financeiro.rabbitmq;

import br.com.sol7.olimpio.financeiro.shared.rabbitmq.RabbitMQClient;
import br.com.sol7.olimpio.financeiro.shared.rabbitmq.RabbitMQRequest;
import br.com.sol7.olimpio.financeiro.shared.rabbitmq.RabbitMQResponse;
import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.eclipse.microprofile.reactive.messaging.Incoming;

import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.function.Consumer;

@ApplicationScoped
public class FinanceiroRabbitMQClient {

    @Inject
    RabbitMQClient rabbitMQClient;

    private final Map<String, Consumer<RabbitMQResponse>> responseHandlers = new ConcurrentHashMap<>();

    // Call basico service for unidade queries
    public Uni<List<Long>> unidadeAutoComplete(String query) {
        return rabbitMQClient.request("basico", "unidade.autoComplete", Map.of("query", query))
                .onItem().transform(RabbitMQResponse::getIdList);
    }

    public Uni<List<Long>> unidadeAutoCompleteComUsuario(String query, Long usuarioId) {
        return rabbitMQClient.request("basico", "unidade.autoCompleteComUsuario", Map.of("query", query, "usuarioId", usuarioId))
                .onItem().transform(RabbitMQResponse::getIdList);
    }

    public Uni<List<Long>> unidadeAutoCompleteDoUsuario(Long usuarioId) {
        return rabbitMQClient.request("basico", "unidade.autoCompleteDoUsuario", Map.of("usuarioId", usuarioId))
                .onItem().transform(RabbitMQResponse::getIdList);
    }

    public Uni<List<Long>> unidadeAutoCompleteComUnidades(String query, List<Long> unidadesIds) {
        return rabbitMQClient.request("basico", "unidade.autoCompleteComUnidades", Map.of("query", query, "unidadesIds", unidadesIds))
                .onItem().transform(RabbitMQResponse::getIdList);
    }

    public Uni<List<Long>> unidadeBuscarTodos() {
        return rabbitMQClient.request("basico", "unidade.buscarTodos", Map.of())
                .onItem().transform(RabbitMQResponse::getIdList);
    }

    public Uni<Long> unidadeBuscarUnidadeComTelefones(Long unidadeId) {
        return rabbitMQClient.request("basico", "unidade.buscarUnidadeComTelefones", Map.of("unidadeId", unidadeId))
                .onItem().transform(r -> r.getData(Long.class));
    }

    // Call basico service for usuario queries
    public Uni<List<Long>> usuarioAutoComplete(String query) {
        return rabbitMQClient.request("basico", "usuario.autoComplete", Map.of("query", query))
                .onItem().transform(RabbitMQResponse::getIdList);
    }

    public Uni<List<Long>> usuarioAutoCompleteComUnidade(String query, Long unidadeId) {
        return rabbitMQClient.request("basico", "usuario.autoCompleteComUnidade", Map.of("query", query, "unidadeId", unidadeId))
                .onItem().transform(RabbitMQResponse::getIdList);
    }

    public Uni<List<Long>> usuarioBuscaTodos() {
        return rabbitMQClient.request("basico", "usuario.buscaTodos", Map.of())
                .onItem().transform(RabbitMQResponse::getIdList);
    }

    public Uni<List<Long>> usuarioAutoCompleteUsuario(String query, Long unidadeId) {
        return rabbitMQClient.request("basico", "usuario.autoCompleteUsuario", Map.of("query", query, "unidadeId", unidadeId))
                .onItem().transform(RabbitMQResponse::getIdList);
    }

    public Uni<List<Long>> usuarioBuscarUsuarioPorPerfil(Long perfilId) {
        return rabbitMQClient.request("basico", "usuario.buscarUsuarioPorPerfil", Map.of("perfilId", perfilId))
                .onItem().transform(RabbitMQResponse::getIdList);
    }

    public Uni<List<Long>> usuarioBuscarUsuarioPorUnidades(List<Long> unidadeIds) {
        return rabbitMQClient.request("basico", "usuario.buscarUsuarioPorUnidades", Map.of("unidadeIds", unidadeIds))
                .onItem().transform(RabbitMQResponse::getIdList);
    }

    public Uni<List<Long>> usuarioBuscarUsuarioPorUnidade(Long unidadeId) {
        return rabbitMQClient.request("basico", "usuario.buscarUsuarioPorUnidade", Map.of("unidadeId", unidadeId))
                .onItem().transform(RabbitMQResponse::getIdList);
    }

    public Uni<List<Long>> usuarioBuscarUnidadesDisponiveis(Long usuarioId) {
        return rabbitMQClient.request("basico", "usuario.buscarUnidadesDisponiveis", Map.of("usuarioId", usuarioId))
                .onItem().transform(RabbitMQResponse::getIdList);
    }

    // Call basico service for pessoa queries
    public Uni<List<Long>> pessoaAutoCompletePessoaFisicaUnidade(String query, Long unidadeId) {
        return rabbitMQClient.request("basico", "pessoa.autoCompletePessoaFisicaUnidade", Map.of("query", query, "unidadeId", unidadeId))
                .onItem().transform(RabbitMQResponse::getIdList);
    }

    public Uni<List<Long>> pessoaAutoCompletePessoaJuridicaUnidade(String query, Long unidadeId) {
        return rabbitMQClient.request("basico", "pessoa.autoCompletePessoaJuridicaUnidade", Map.of("query", query, "unidadeId", unidadeId))
                .onItem().transform(RabbitMQResponse::getIdList);
    }

    // Call basico service for perfil queries
    public Uni<List<Long>> perfilBuscarTodos() {
        return rabbitMQClient.request("basico", "perfil.buscarTodos", Map.of())
                .onItem().transform(RabbitMQResponse::getIdList);
    }

    // Handle responses from basico
    @Incoming("responses-in")
    public void handleResponse(RabbitMQResponse response) {
        rabbitMQClient.handleResponse(response);
    }
}