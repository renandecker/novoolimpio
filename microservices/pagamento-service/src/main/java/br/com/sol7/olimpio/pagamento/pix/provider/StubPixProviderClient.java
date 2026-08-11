package br.com.sol7.olimpio.pagamento.pix.provider;

import jakarta.enterprise.context.ApplicationScoped;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

/**
 * Implementacao padrao, usada enquanto nenhum PSP real (Asaas, etc.) estiver configurado.
 * Gera um registro "PENDENTE" com um identificador local, sem chamar nenhuma API externa.
 * Substitua por uma implementacao real (ex.: AsaasPixProviderClient) para produzir QR Codes
 * validos. Ver PixProviderClient para detalhes de como plugar.
 */
@ApplicationScoped
public class StubPixProviderClient implements PixProviderClient {

    @Override
    public PixCharge criarCobranca(String cpfPagador, String descricao, BigDecimal valor, LocalDate vencimento) {
        String chargeId = "STUB-" + UUID.randomUUID();
        String chaveFicticia = "pix@olimpio.local";
        String qrcodeFicticio = "00020126PENDENTE-CONFIGURAR-PSP-" + chargeId;
        return new PixCharge(chargeId, qrcodeFicticio, chaveFicticia, "PENDENTE");
    }

    @Override
    public PixChargeStatus consultarStatus(String chargeId) {
        return new PixChargeStatus(chargeId, "PENDENTE", null, null);
    }
}
