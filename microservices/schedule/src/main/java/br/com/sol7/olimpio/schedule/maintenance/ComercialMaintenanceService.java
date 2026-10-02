package br.com.sol7.olimpio.schedule.maintenance;

import java.util.Date;

import io.smallrye.mutiny.Uni;
import io.vertx.mutiny.sqlclient.Pool;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

/**
 * Rotina do dominio "comercial" migrada de SchedulingService.atualizarIdadeProspectos().
 * Acessa "olimpio_comercial" diretamente (so SQL nativo puro - nao precisa de persistence unit
 * porque a query nao devolve entidades, so faz um UPDATE).
 */
@ApplicationScoped
public class ComercialMaintenanceService {

    @Inject
    Pool comercialPool;

    // OBS: depende da funcao PostgreSQL customizada is_date(...), que existia no banco legado
    // mas nao foi encontrada em nenhuma migration do Flyway - precisa existir no banco
    // "olimpio_comercial" para esta query funcionar. Ver RELATORIO_SCHEDULE.md.
    private static final String SQL_ATUALIZAR_IDADE_PROSPECTOS =
            "UPDATE com_prospecto_campo concampo2 " +
                    "SET valor = extract(year from age(CURRENT_DATE, cast(concampo.valor as date))) " +
                    "from com_campo cam2, com_prospecto con " +
                    "inner join com_prospecto_campo concampo on (concampo.id_prospecto = con.id) " +
                    "inner join com_campo cam on (concampo.id_campo = cam.id) " +
                    "where cam.flag_data_nascimento = true and concampo2.id_prospecto = con.id and " +
                    "cam2.flag_idade = true and concampo2.id_campo = cam2.id and is_date(concampo.valor) = true";

    public Uni<Void> atualizarIdadeProspectos() {
        return comercialPool.query(SQL_ATUALIZAR_IDADE_PROSPECTOS).execute().replaceWithVoid();
    }
}
