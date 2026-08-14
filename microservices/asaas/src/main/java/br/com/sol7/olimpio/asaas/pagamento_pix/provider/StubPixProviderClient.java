package br.com.sol7.olimpio.asaas.pagamento_pix.provider;

import io.quarkus.arc.DefaultBean;
import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

/**
 * Implementacao padrao (@DefaultBean), usada enquanto nenhum PSP real (Asaas, etc.) estiver
 * presente no classpath/ativo. Gera um registro "PENDENTE" com um identificador local, sem
 * chamar nenhuma API externa. Assim que uma implementacao real (ex.: AsaasPixProviderClient)
 * existir, o Quarkus descarta esta e injeta a real - nenhuma outra classe precisa mudar.
 */
@ApplicationScoped
@DefaultBean
public class StubPixProviderClient implements PixProviderClient {

    @Override
    public Uni<PixCharge> criarCobranca(String cpfPagador, String descricao, BigDecimal valor, LocalDate vencimento) {
        String chargeId = "STUB-" + UUID.randomUUID();
        String chaveFicticia = "pix@olimpio.local";
        String qrcodeFicticio = "00020126PENDENTE-CONFIGURAR-PSP-" + chargeId;
        return Uni.createFrom().item(new PixCharge(chargeId, qrcodeFicticio, chaveFicticia, "PENDENTE"));
    }

    @Override
    public Uni<PixChargeStatus> consultarStatus(String chargeId) {
        return Uni.createFrom().item(new PixChargeStatus(chargeId, "PENDENTE", null, null));
    }
}
