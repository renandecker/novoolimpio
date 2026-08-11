package br.com.sol7.olimpio.pagamento.pix.provider;

/**
 * Ponto de extensao para a geracao real de cobrancas PIX junto a um PSP (ex.: Asaas, Banco
 * Central via PSP licenciado, ou uma futura API Fiserv Brasil).
 *
 * A collection Fiserv fornecida (fiserv_dev_postman_collection.json - Commerce Hub / Payments
 * Gateway) e a API global de e-commerce da Fiserv e NAO inclui nenhum endpoint de PIX. Para nao
 * bloquear o restante do microsservico, este contrato isola a geracao do QR Code/chave: basta
 * implementar esta interface (ex.: AsaasPixProviderClient) e trocar o @DefaultBean abaixo por
 * @Alternative/@Priority na implementacao real - nenhuma outra classe precisa mudar.
 */
public interface PixProviderClient {

    PixCharge criarCobranca(String cpfPagador, String descricao, java.math.BigDecimal valor, java.time.LocalDate vencimento);

    PixChargeStatus consultarStatus(String chargeId);

    record PixCharge(String chargeId, String qrcode, String chave, String situacao) {}

    /** endToEndId so vem preenchido quando situacao = "PAGO" (comprovante oficial do Banco Central). */
    record PixChargeStatus(String chargeId, String situacao, java.math.BigDecimal valorPago, String endToEndId) {}
}
