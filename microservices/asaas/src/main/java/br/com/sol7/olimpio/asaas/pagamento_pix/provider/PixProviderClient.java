package br.com.sol7.olimpio.asaas.pagamento_pix.provider;

import io.smallrye.mutiny.Uni;
import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * Ponto de extensao para a geracao real de cobrancas PIX junto a um PSP (ex.: Asaas).
 * Fluxo movido do fiserv para o asaas-service.
 *
 * A implementacao default (StubPixProviderClient, marcada com @DefaultBean) e automaticamente
 * substituida quando existe outra implementacao ativa do contrato (ex.: AsaasPixProviderClient).
 *
 * Os metodos sao reativos (Uni) para permitir implementacoes que chamam PSPs reais.
 */
public interface PixProviderClient {

    Uni<PixCharge> criarCobranca(String cpfPagador, String descricao, BigDecimal valor, LocalDate vencimento);

    Uni<PixChargeStatus> consultarStatus(String chargeId);

    record PixCharge(String chargeId, String qrcode, String chave, String situacao) {}

    /** endToEndId so vem preenchido quando situacao = "PAGO" (comprovante oficial do Banco Central). */
    record PixChargeStatus(String chargeId, String situacao, BigDecimal valorPago, String endToEndId) {}
}
