package br.com.sol7.olimpio.pagamento.parcelacartao.service;

import br.com.sol7.olimpio.pagamento.cartaopessoa.entity.CartaoPessoa;
import br.com.sol7.olimpio.pagamento.cartaopessoa.service.CartaoPessoaService;
import br.com.sol7.olimpio.pagamento.gateway.fiserv.FiservGatewayService;
import br.com.sol7.olimpio.pagamento.parcela.entity.Parcela;
import br.com.sol7.olimpio.pagamento.parcela.repository.ParcelaRepository;
import br.com.sol7.olimpio.pagamento.parcelacartao.dto.PagamentoCartaoRequest;
import br.com.sol7.olimpio.pagamento.parcelacartao.dto.ParcelaCartaoResponse;
import br.com.sol7.olimpio.pagamento.parcelacartao.entity.ParcelaCartao;
import br.com.sol7.olimpio.pagamento.parcelacartao.repository.ParcelaCartaoRepository;
import com.fasterxml.jackson.databind.JsonNode;
import io.quarkus.hibernate.reactive.panache.common.WithSession;
import io.quarkus.hibernate.reactive.panache.common.WithTransaction;
import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.BadRequestException;
import jakarta.ws.rs.NotFoundException;
import java.time.LocalDateTime;
import java.util.Set;

/**
 * Efetua a cobranca de uma parcela (fin_parcela) via cartao - a vista (PaymentCardSaleTransaction
 * / PaymentTokenSaleTransaction, POST /v2/payments) ou parcelado (PaymentMethodPaymentSchedulesRequest,
 * POST /v2/payment-schedules) - e persiste o resultado em fin_parcela_cartao, vinculando-o de
 * volta a fin_parcela.id_parcela_cartao (mesmo padrao de fin_parcela_boleto/fin_parcela_pix).
 */
@ApplicationScoped
public class ParcelaCartaoService {

    private static final Set<String> STATUS_APROVADO = Set.of("APPROVED", "SUCCESS", "SETTLED", "AUTHORIZED", "CAPTURED");

    @Inject ParcelaCartaoRepository repository;
    @Inject ParcelaRepository parcelaRepository;
    @Inject CartaoPessoaService cartaoPessoaService;
    @Inject FiservGatewayService fiserv;

    @WithTransaction
    public Uni<ParcelaCartaoResponse> pagar(PagamentoCartaoRequest r) {
        validar(r);
        return parcelaRepository.findById(r.idParcela())
                .onItem().ifNull().failWith(() -> new NotFoundException("Parcela nao encontrada"))
                .onItem().transformToUni(parcela -> executarCobranca(r).onItem()
                        .transformToUni(json -> persistirResultado(parcela, r, json)));
    }

    private Uni<JsonNode> executarCobranca(PagamentoCartaoRequest r) {
        String merchantTransactionId = "PARC-" + r.idParcela() + "-" + System.currentTimeMillis();
        boolean vista = ParcelaCartao.TIPO_VISTA.equalsIgnoreCase(r.tipoPagamento());

        if (r.usaCartaoCadastrado()) {
            return cartaoPessoaService.buscarEntidadeAtiva(r.idPessoa(), r.idCartaoPessoa())
                    .onItem().transformToUni(cartao -> vista
                            ? fiserv.venderAVistaComToken(merchantTransactionId, r.valor().toPlainString(), cartao.paymentToken)
                            : fiserv.venderParceladoComToken(merchantTransactionId, r.qtdParcelas(), r.valor().toPlainString(), cartao.paymentToken));
        }

        return vista
                ? fiserv.venderAVistaComCartao(merchantTransactionId, r.valor().toPlainString(),
                        r.numeroCartao(), r.cvvCartao(), r.validadeMes(), r.validadeAno())
                : fiserv.venderParceladoComCartao(merchantTransactionId, r.qtdParcelas(), r.valor().toPlainString(),
                        r.numeroCartao(), r.cvvCartao(), r.validadeMes(), r.validadeAno());
    }

    private Uni<ParcelaCartaoResponse> persistirResultado(Parcela parcela, PagamentoCartaoRequest r, JsonNode json) {
        boolean vista = ParcelaCartao.TIPO_VISTA.equalsIgnoreCase(r.tipoPagamento());

        var entity = new ParcelaCartao();
        entity.idCartaoPessoa = r.idCartaoPessoa();
        entity.tipoPagamento = vista ? ParcelaCartao.TIPO_VISTA : ParcelaCartao.TIPO_PARCELADO;
        entity.qtdParcelas = vista ? 1 : r.qtdParcelas();
        entity.valor = r.valor();
        entity.merchantTransactionId = json.path("merchantTransactionId").asText(null);
        entity.ipgTransactionId = json.path("ipgTransactionId").asText(null);
        entity.orderId = json.path("orderId").asText(null);
        if (!vista) {
            entity.paymentScheduleId = entity.orderId;
        }
        entity.status = status(json);
        entity.codigoAutorizacao = json.path("approvalCode").asText(json.path("processor").path("authorizationCode").asText(null));
        entity.mensagemRetorno = json.path("processor").path("responseMessage")
                .asText(json.path("error").path("message").asText(null));
        entity.dataTransacao = LocalDateTime.now();

        return repository.persist(entity).onItem().transformToUni(persisted -> {
            parcela.idParcelaCartao = entity.id;
            parcela.formaPagamento = vista ? "CARTAO_VISTA" : "CARTAO_PARCELADO";
            if (STATUS_APROVADO.contains(entity.status)) {
                parcela.dataPagamento = LocalDateTime.now();
            }
            return parcelaRepository.persist(parcela).map(v -> toResponse(entity));
        });
    }

    @WithSession
    public Uni<ParcelaCartaoResponse> buscar(Long id) {
        return repository.findById(id)
                .onItem().ifNull().failWith(() -> new NotFoundException("Transacao de cartao nao encontrada"))
                .map(this::toResponse);
    }

    private String status(JsonNode json) {
        String transactionStatus = json.path("transactionStatus").asText(null);
        if (transactionStatus != null) return transactionStatus.toUpperCase();
        String requestStatus = json.path("requestStatus").asText(null);
        return requestStatus == null ? "DESCONHECIDO" : requestStatus.toUpperCase();
    }

    private void validar(PagamentoCartaoRequest r) {
        boolean tipoValido = ParcelaCartao.TIPO_VISTA.equalsIgnoreCase(r.tipoPagamento())
                || ParcelaCartao.TIPO_PARCELADO.equalsIgnoreCase(r.tipoPagamento());
        if (!tipoValido) {
            throw new BadRequestException("tipoPagamento deve ser VISTA ou PARCELADO");
        }
        if (ParcelaCartao.TIPO_PARCELADO.equalsIgnoreCase(r.tipoPagamento()) && r.qtdParcelas() < 2) {
            throw new BadRequestException("qtdParcelas deve ser >= 2 para pagamento PARCELADO");
        }
        if (!r.usaCartaoCadastrado()
                && (r.numeroCartao() == null || r.cvvCartao() == null || r.validadeMes() == null || r.validadeAno() == null)) {
            throw new BadRequestException("Informe idCartaoPessoa (cartao cadastrado) ou os dados completos do cartao");
        }
    }

    private ParcelaCartaoResponse toResponse(ParcelaCartao e) {
        return new ParcelaCartaoResponse(e.id, null, e.idCartaoPessoa, e.tipoPagamento, e.qtdParcelas, e.valor,
                e.status, e.ipgTransactionId, e.orderId, e.codigoAutorizacao, e.mensagemRetorno, e.dataTransacao);
    }
}
