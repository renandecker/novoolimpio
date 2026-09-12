package br.com.sol7.olimpio.pagamento.cartaopessoa.service;

import br.com.sol7.olimpio.pagamento.cartaopessoa.dto.CadastrarCartaoRequest;
import br.com.sol7.olimpio.pagamento.cartaopessoa.dto.CartaoPessoaResponse;
import br.com.sol7.olimpio.pagamento.cartaopessoa.entity.CartaoPessoa;
import br.com.sol7.olimpio.pagamento.cartaopessoa.repository.CartaoPessoaRepository;
import br.com.sol7.olimpio.pagamento.gateway.fiserv.FiservGatewayService;
import com.fasterxml.jackson.databind.JsonNode;
import io.quarkus.hibernate.reactive.panache.common.WithSession;
import io.quarkus.hibernate.reactive.panache.common.WithTransaction;
import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.BadRequestException;
import jakarta.ws.rs.NotFoundException;

import java.time.LocalDateTime;
import java.util.List;

@ApplicationScoped
public class CartaoPessoaService {

    @Inject
    CartaoPessoaRepository repository;
    @Inject
    FiservGatewayService fiserv;

    @WithSession
    public Uni<List<CartaoPessoaResponse>> listarPorPessoa(Long idPessoa) {
        return repository.listarPorPessoa(idPessoa).map(list -> list.stream().map(this::toResponse).toList());
    }

    @WithTransaction
    public Uni<CartaoPessoaResponse> cadastrar(CadastrarCartaoRequest r) {
        // 1) Tokeniza o cartao na Fiserv (POST /payment-tokens) - nao gera cobranca, apenas cadastro.
        return fiserv.tokenizarCartao(r.numero(), r.cvv(), r.validadeMes(), r.validadeAno())
                .onItem().transformToUni(json -> {
                    validarRespostaFiserv(json);
                    JsonNode tokenNode = json.path("paymentToken");
                    String token = tokenNode.path("value").asText(null);
                    String brand = tokenNode.path("brand").asText(null);
                    String last4 = tokenNode.path("last4").asText(ultimosDigitos(r.numero()));
                    if (token == null) {
                        return Uni.createFrom().failure(
                                new BadRequestException("Fiserv nao retornou um paymentToken valido"));
                    }

                    var entity = new CartaoPessoa();
                    entity.idPessoa = r.idPessoa();
                    entity.cpf = r.cpf();
                    entity.bin = bin(r.numero());
                    entity.ultimosDigitos = last4;
                    entity.bandeira = brand;
                    entity.nomeTitular = r.nomeTitular();
                    entity.validadeMes = r.validadeMes();
                    entity.validadeAno = r.validadeAno();
                    entity.paymentToken = token;
                    entity.fiservTokenId = json.path("ipgTransactionId").asText(null);
                    entity.apelido = r.apelido();
                    entity.principal = r.principal();
                    entity.dataCadastro = LocalDateTime.now();

                    return repository.persist(entity).map(v -> toResponse(entity));
                });
    }

    @WithTransaction
    public Uni<Void> inativar(Long idPessoa, Long idCartao) {
        return repository.buscarAtivoDaPessoa(idPessoa, idCartao)
                .onItem().ifNull().failWith(() -> new NotFoundException("Cartao nao encontrado para esta pessoa"))
                .invoke(entity -> {
                    entity.ativo = false;
                    entity.dataAlteracao = LocalDateTime.now();
                }).replaceWithVoid();
    }

    /**
     * Usado internamente pelo modulo de pagamento para recuperar o token de cobranca.
     */
    @WithSession
    public Uni<CartaoPessoa> buscarEntidadeAtiva(Long idPessoa, Long idCartao) {
        return repository.buscarAtivoDaPessoa(idPessoa, idCartao)
                .onItem().ifNull().failWith(() -> new NotFoundException("Cartao nao encontrado ou inativo"));
    }

    private void validarRespostaFiserv(JsonNode json) {
        String status = json.path("requestStatus").asText("SUCCESS");
        if ("FAILED".equalsIgnoreCase(status) || "DECLINED".equalsIgnoreCase(status)) {
            String mensagem = json.path("error").path("message").asText("Falha ao tokenizar cartao na Fiserv");
            throw new BadRequestException(mensagem);
        }
    }

    private String bin(String numero) {
        return numero.substring(0, Math.min(8, numero.length()));
    }

    private String ultimosDigitos(String numero) {
        return numero.substring(Math.max(0, numero.length() - 4));
    }

    public CartaoPessoaResponse toResponse(CartaoPessoa e) {
        return new CartaoPessoaResponse(e.id, e.idPessoa, e.cpf, e.bin, e.ultimosDigitos, e.bandeira,
                e.nomeTitular, e.validadeMes, e.validadeAno, e.apelido, e.ativo, e.principal, e.dataCadastro);
    }
}
