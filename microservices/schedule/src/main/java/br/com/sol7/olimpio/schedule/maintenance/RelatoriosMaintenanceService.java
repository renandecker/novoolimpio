package br.com.sol7.olimpio.schedule.maintenance;

import io.quarkus.reactive.datasource.ReactiveDataSource;
import io.smallrye.mutiny.Uni;
import io.vertx.mutiny.sqlclient.Pool;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

/**
 * Rotina do dominio "relatorios" migrada de ExtratorService.remove() (chamado por
 * SchedulingService.tudo()). Acessa "olimpio_relatorios" diretamente pelo datasource reativo
 * "relatorios-db".
 */
@ApplicationScoped
public class RelatoriosMaintenanceService {

    @Inject
    @ReactiveDataSource("relatorios-db")
    Pool pool;

    // Migrado de ExtratorService.remove() - so a parte de banco (2 updates); a limpeza de
    // arquivos temporarios em disco nao faz sentido num microsservico stateless.
    private static final String SQL_MARCAR_REMOVIDOS_ANTIGOS =
            "UPDATE rel_extrator SET situacao = 'Removido' where cast(data_fim as date) <= current_date-1 and data_fim is not null";
    private static final String SQL_MARCAR_REMOVIDOS_SEM_FIM =
            "UPDATE rel_extrator SET situacao = 'Removido', data_fim = data_inicio where cast(data_inicio as date) <= current_date-1 and data_fim is null";

    public Uni<Void> removerExtratoresAntigos() {
        return pool.query(SQL_MARCAR_REMOVIDOS_ANTIGOS).execute()
                .chain(r -> pool.query(SQL_MARCAR_REMOVIDOS_SEM_FIM).execute())
                .replaceWithVoid();
    }
}
