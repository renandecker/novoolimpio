package br.com.sol7.olimpio.schedule.pagamento;

import io.smallrye.mutiny.Uni;
import io.vertx.mutiny.sqlclient.Pool;
import io.vertx.mutiny.sqlclient.Row;
import io.vertx.mutiny.sqlclient.Tuple;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.jboss.logging.Logger;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Set;

/**
 * Aplica a confirmação de pagamento na parcela ({@code fin_parcela}) a partir dos
 * eventos do tópico {@code olimpio.pagamento.confirmado} (fiserv/cartão e asaas/PIX).
 *
 * <p>Baixa aplicada:
 * <ul>
 *   <li>status de confirmação (APPROVED/SUCCESS/SETTLED/AUTHORIZED/CAPTURED para cartão;
 *       PAGO/RECEIVED/CONFIRMED/PAID para PIX) → {@code data_pagamento} (mantém a primeira),
 *       {@code valor_pago}, {@code forma_pagamento} e o vínculo
 *       ({@code id_parcela_cartao} ou {@code id_parcela_pix}) quando ainda nulo;</li>
 *   <li>status de reversão (VOIDED/RETURNED/REVERSED/CANCELADO/ESTORNADO/CANCELLED/REFUNDED)
 *       → limpa {@code data_pagamento} (estorno/cancelamento);</li>
 *   <li>qualquer outro status → apenas registrado no log, sem tocar na parcela.</li>
 * </ul>
 *
 * <p>Idempotência: evento com o mesmo {@code (id_gateway, status)} já registrado em
 * {@code fin_pagamento_confirmado_log} é ignorado; parcela já baixada não tem a
 * {@code data_pagamento} sobrescrita. Todo evento processado gera uma linha de
 * auditoria em {@code fin_pagamento_confirmado_log} (ver migration
 * {@code 0061__schedule_pagamento_confirmado_log.sql}).
 *
 * <p>Acesso ao banco compartilhado {@code olimpio} via datasource reativo (SQL nativo).
 */
@ApplicationScoped
public class PagamentoConfirmadoService {

    private static final Logger LOG = Logger.getLogger(PagamentoConfirmadoService.class);

    private static final Set<String> STATUS_APROVADO = Set.of(
            "APPROVED", "SUCCESS", "SETTLED", "AUTHORIZED", "CAPTURED",
            "PAGO", "RECEIVED", "CONFIRMED", "PAID");
    private static final Set<String> STATUS_REVERSO = Set.of(
            "VOIDED", "RETURNED", "REVERSED", "CANCELADO", "ESTORNADO", "CANCELLED", "REFUNDED");

    @Inject
    Pool pool;

    private static final String SQL_BUSCAR_PARCELA =
            "SELECT id, data_pagamento, valor_pago, forma_pagamento, id_parcela_cartao, id_parcela_pix " +
                    "FROM fin_parcela WHERE id = $1";

    private static final String SQL_JA_PROCESSADO =
            "SELECT id FROM fin_pagamento_confirmado_log WHERE id_gateway = $1 AND status = $2 LIMIT 1";

    private static final String SQL_BAIXAR_PARCELA =
            "UPDATE fin_parcela SET " +
                    " data_pagamento = COALESCE(data_pagamento, $2), " +
                    " valor_pago = COALESCE($3, valor_pago), " +
                    " forma_pagamento = COALESCE($4, forma_pagamento), " +
                    " id_parcela_cartao = COALESCE(id_parcela_cartao, $5), " +
                    " id_parcela_pix = COALESCE(id_parcela_pix, $6) " +
                    "WHERE id = $1";

    private static final String SQL_ESTORNAR_PARCELA =
            "UPDATE fin_parcela SET data_pagamento = NULL WHERE id = $1";

    private static final String SQL_INSERIR_LOG =
            "INSERT INTO fin_pagamento_confirmado_log " +
                    "(id_parcela, id_transacao, id_pessoa, forma_pagamento, status, valor, id_gateway, data_confirmacao, resultado) " +
                    "VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)";

    public Uni<Void> processar(PagamentoConfirmadoEvent event) {
        if (event == null || event.idParcela() == null) {
            LOG.warn("PagamentoConfirmado - evento invalido (sem idParcela), ignorado");
            return Uni.createFrom().voidItem();
        }
        String status = event.status() == null ? "" : event.status().toUpperCase();
        return jaProcessado(event.idGateway(), status)
                .chain(duplicado -> {
                    if (duplicado) {
                        LOG.infof("PagamentoConfirmado - evento duplicado ignorado (parcela %d, gateway %s, status %s)",
                                event.idParcela(), event.idGateway(), status);
                        return Uni.createFrom().voidItem();
                    }
                    if (STATUS_APROVADO.contains(status)) {
                        return baixarParcela(event)
                                .chain(v -> registrarLog(event, "BAIXADA"));
                    }
                    if (STATUS_REVERSO.contains(status)) {
                        return estornarParcela(event)
                                .chain(v -> registrarLog(event, "ESTORNADA"));
                    }
                    LOG.warnf("PagamentoConfirmado - status '%s' nao mapeado (parcela %d), apenas registrado",
                            status, event.idParcela());
                    return registrarLog(event, "STATUS_IGNORADO");
                });
    }

    private Uni<Void> baixarParcela(PagamentoConfirmadoEvent event) {
        String forma = event.formaPagamento();
        Long idCartao = forma != null && forma.toUpperCase().startsWith("CARTAO") ? event.idTransacao() : null;
        Long idPix = "PIX".equalsIgnoreCase(forma) ? event.idTransacao() : null;
        LocalDateTime dataPagamento = event.dataConfirmacao() != null ? event.dataConfirmacao() : LocalDateTime.now();
        return pool.preparedQuery(SQL_BAIXAR_PARCELA)
                .execute(Tuple.of(event.idParcela(), dataPagamento, event.valor(), forma, idCartao, idPix))
                .invoke(() -> LOG.infof("PagamentoConfirmado - baixa aplicada na parcela %d (forma %s, valor %s, gateway %s)",
                        event.idParcela(), forma, event.valor(), event.idGateway()))
                .replaceWithVoid()
                .onFailure().recoverWithItem(e -> {
                    LOG.errorf(e, "PagamentoConfirmado - falha ao dar baixa na parcela %d", event.idParcela());
                    return null;
                });
    }

    private Uni<Void> estornarParcela(PagamentoConfirmadoEvent event) {
        return pool.preparedQuery(SQL_BUSCAR_PARCELA).execute(Tuple.of(event.idParcela()))
                .chain(rows -> {
                    if (!rows.iterator().hasNext()) {
                        LOG.warnf("PagamentoConfirmado - parcela %d nao encontrada para estorno", event.idParcela());
                        return Uni.createFrom().voidItem();
                    }
                    return pool.preparedQuery(SQL_ESTORNAR_PARCELA).execute(Tuple.of(event.idParcela()))
                            .invoke(() -> LOG.infof("PagamentoConfirmado - estorno aplicado na parcela %d (status %s)",
                                    event.idParcela(), event.status()))
                            .replaceWithVoid();
                })
                .onFailure().recoverWithItem(e -> {
                    LOG.errorf(e, "PagamentoConfirmado - falha ao estornar parcela %d", event.idParcela());
                    return null;
                });
    }

    private Uni<Boolean> jaProcessado(String idGateway, String status) {
        if (idGateway == null || idGateway.isBlank()) {
            return Uni.createFrom().item(false);
        }
        return pool.preparedQuery(SQL_JA_PROCESSADO).execute(Tuple.of(idGateway, status))
                .map(rows -> rows.iterator().hasNext())
                .onFailure().recoverWithItem(e -> {
                    LOG.warnf("PagamentoConfirmado - falha ao checar idempotencia (segue processamento): %s", e.getMessage());
                    return false;
                });
    }

    private Uni<Void> registrarLog(PagamentoConfirmadoEvent event, String resultado) {
        BigDecimal valor = event.valor();
        return pool.preparedQuery(SQL_INSERIR_LOG)
                .execute(Tuple.tuple(java.util.Arrays.asList(event.idParcela(), event.idTransacao(), event.idPessoa(),
                        event.formaPagamento(), event.status(), valor, event.idGateway(),
                        event.dataConfirmacao(), resultado)))
                .replaceWithVoid()
                .onFailure().recoverWithItem(e -> {
                    LOG.warnf("PagamentoConfirmado - falha ao registrar log (parcela %d): %s",
                            event.idParcela(), e.getMessage());
                    return null;
                });
    }
}
