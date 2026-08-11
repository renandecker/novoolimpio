package br.com.sol7.olimpio.schedule.maintenance;

import io.quarkus.reactive.datasource.ReactiveDataSource;
import io.smallrye.mutiny.Uni;
import io.vertx.mutiny.sqlclient.Pool;
import io.vertx.mutiny.sqlclient.Row;
import io.vertx.mutiny.sqlclient.Tuple;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

import java.util.List;

/**
 * Rotina do dominio "central" migrada de SchedulingService.verificarOperacionalVencidos().
 * Acessa "olimpio_central" pelo datasource reativo "central-db" e "olimpio_comercial" (dono de
 * com_pacote/com_acao_de_campanha) por um pool separado - sao bancos diferentes, entao a
 * verificacao de "pacote vencido" precisa ser feita em duas etapas (nao da pra fazer um JOIN
 * direto entre bancos diferentes). Nenhuma chamada REST envolvida, so acesso direto aos bancos.
 */
@ApplicationScoped
public class CentralMaintenanceService {

    @Inject
    @ReactiveDataSource("central-db")
    Pool centralPool;

    @Inject
    @ReactiveDataSource("comercial-db")
    Pool comercialPool;

    // Etapa 1 (banco comercial): ids de pacote cuja campanha ja venceu.
    private static final String SQL_PACOTES_COM_CAMPANHA_VENCIDA =
            "SELECT p.id FROM com_pacote p " +
                    "JOIN com_acao_de_campanha c ON c.id = p.id_acao_de_campanha " +
                    "WHERE c.data_final < current_date";

    // Etapa 2 (banco central): expira operacionais ainda nao concluidos/expirados desses pacotes.
    private static final String SQL_ATUALIZAR_STATUS_EXPIRADO =
            "UPDATE cen_operacional SET status = 'EXPIRADO' " +
                    "WHERE status <> 'CONCLUIDO' AND status <> 'EXPIRADO' AND id_pacote = $1";

    public Uni<Void> verificarOperacionalVencidos() {
        return comercialPool.query(SQL_PACOTES_COM_CAMPANHA_VENCIDA).execute()
                .map(rows -> {
                    List<Long> ids = new java.util.ArrayList<>();
                    for (Row row : rows) {
                        ids.add(row.getLong(0));
                    }
                    return ids;
                })
                .chain(pacoteIds -> {
                    if (pacoteIds.isEmpty()) {
                        return Uni.createFrom().voidItem();
                    }
                    Uni<Void> chain = Uni.createFrom().voidItem();
                    for (Long pacoteId : pacoteIds) {
                        chain = chain.chain(() -> centralPool.preparedQuery(SQL_ATUALIZAR_STATUS_EXPIRADO)
                                .execute(Tuple.of(pacoteId)).replaceWithVoid());
                    }
                    return chain;
                });
    }
}
