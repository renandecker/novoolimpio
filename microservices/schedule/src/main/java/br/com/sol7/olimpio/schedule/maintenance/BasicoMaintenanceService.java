package br.com.sol7.olimpio.schedule.maintenance;

import io.smallrye.mutiny.Uni;
import io.vertx.mutiny.sqlclient.Pool;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

/**
 * Rotinas do dominio "basico" migradas de SchedulingService.tudo() e dos services chamados por
 * ele (ContaService, ConfiguracaoEmailService, LogradouroService). Usa diretamente o pool
 * padrão do banco compartilhado, sem conexões específicas por microsserviço.
 */
@ApplicationScoped
public class BasicoMaintenanceService {

    @Inject
    Pool pool;

    // Migrado de SchedulingService.tudo() - atualiza a situacao (inadimplente) das contas
    private static final String SQL_ATUALIZAR_SITUACAO_CONTA =
            "UPDATE bas_conta con SET fl_situacao = case when " +
                    "exists(select * from bas_conta_controle_pagamento pag where pag.id_conta = con.id and data_vencimento < current_date " +
                    "and data_aplicada is null) then true else false end";

    public Uni<Void> atualizarSituacaoConta() {
        return pool.query(SQL_ATUALIZAR_SITUACAO_CONTA).execute().replaceWithVoid();
    }

    // Migrado de SchedulingService.tudo() - inativa usuarios sem acesso ha X dias (bas_config)
    private static final String SQL_INATIVAR_USUARIOS_SEM_ACESSO =
            "update bas_usuario usu set fl_ativo = false where fl_ativo = true and " +
                    "not exists(select ace.id from bas_acesso ace where cast(ace.data as date) > " +
                    "(current_date-(select cast(con.valor as integer) from bas_config con where con.chave = 'INATIVAR_USUARIO_SEM_ACESSAR')) " +
                    "and ace.id_usuario = usu.id order by ace.id desc limit 1) and usu.hierarquia <> 'ADMIN' and " +
                    "exists(select ace.id from bas_acesso ace where ace.id_usuario = usu.id limit 1)";

    public Uni<Void> inativarUsuariosSemAcesso() {
        return pool.query(SQL_INATIVAR_USUARIOS_SEM_ACESSO).execute().replaceWithVoid();
    }

    // Migrado de ContaService.verificaConta()
    private static final String SQL_VERIFICAR_CONTA =
            "UPDATE bas_conta ccc SET fl_situacao = true where " +
                    "exists(select pp.id from bas_conta_controle_pagamento pp where ccc.id = pp.id_conta and " +
                    "pp.data_vencimento < current_date and pp.data_aplicada is null)";

    public Uni<Void> verificarConta() {
        return pool.query(SQL_VERIFICAR_CONTA).execute().replaceWithVoid();
    }

    // Migrado de ConfiguracaoEmailService.verificarCotaAuto() + SchedulingService.verificarCotaEmailAutomatico()
    private static final String SQL_VERIFICAR_COTA_EMAIL_DIARIO =
            "UPDATE bas_email taxa SET data_atualizacao = now(), usado = cota " +
                    "where taxa.fl_api_email = true and periodicidade = 'DIARIO' and taxa.data_atualizacao != current_date";
    private static final String SQL_VERIFICAR_COTA_EMAIL_SEMANAL =
            "UPDATE bas_email taxa SET data_atualizacao = now(), usado = cota " +
                    "where taxa.fl_api_email = true and periodicidade = 'SEMANAL' " +
                    "and (date_trunc('week', current_date) != date_trunc('week', taxa.data_atualizacao))";
    private static final String SQL_VERIFICAR_COTA_EMAIL_MENSAL =
            "UPDATE bas_email taxa SET data_atualizacao = now(), usado = cota " +
                    "where taxa.fl_api_email = true and periodicidade = 'MENSAL' and " +
                    "Extract('Month' From taxa.data_atualizacao) != Extract('Month' From current_date)";
    private static final String SQL_BUSCAR_API_EMAIL_HABILITADA =
            "SELECT fl_api_email FROM bas_email LIMIT 1";

    public Uni<Void> verificarCotaEmailAutomatico() {
        return pool.query(SQL_BUSCAR_API_EMAIL_HABILITADA).execute()
                .map(rows -> rows.iterator().hasNext() && rows.iterator().next().getBoolean("fl_api_email"))
                .chain(habilitarApi -> {
                    if (habilitarApi) {
                        return pool.query(SQL_VERIFICAR_COTA_EMAIL_DIARIO).execute()
                                .chain(r -> pool.query(SQL_VERIFICAR_COTA_EMAIL_SEMANAL).execute())
                                .chain(r -> pool.query(SQL_VERIFICAR_COTA_EMAIL_MENSAL).execute())
                                .replaceWithVoid();
                    }
                    return Uni.createFrom().voidItem();
                });
    }

    // Migrado de SchedulingService.atualizarCompromissosAutomaticos() - traduzido para um unico
    // UPDATE (mesmo efeito final: troca o status do compromisso para o "status de troca
    // automatica" configurado). NAO cria o registro de auditoria CompromissoPessoaStatus -
    // essa feature nao existe em nenhum microsservico ainda, ver RELATORIO_SCHEDULE.md.
    private static final String SQL_ATUALIZAR_COMPROMISSOS_AUTOMATICOS =
            "UPDATE bas_compromisso a SET id_status_compromisso = sss.id_status_troca_auto, data_alteracao = now() " +
                    "FROM bas_status_compromisso sss " +
                    "WHERE sss.id = a.id_status_compromisso " +
                    "AND (a.data - cast((cast(sss.dias as text)||' day') as interval)) < current_date " +
                    "AND sss.dias <> 0 AND sss.trocaautomatomatica = true AND sss.id <> sss.id_status_troca_auto " +
                    "AND a.data::date <> current_date";

    public Uni<Void> atualizarCompromissosAutomaticos() {
        return pool.query(SQL_ATUALIZAR_COMPROMISSOS_AUTOMATICOS).execute().replaceWithVoid();
    }

    // Migrado de LogradouroService.atualizar() - so a limpeza (2 deletes); a parte que consulta
    // o webservice dos Correios (CorreioQualCep) nao foi portada (integracao externa).
    private static final String SQL_LIMPAR_LOGRADOUROS_ORFAOS =
            "DELETE FROM bas_logradouro log WHERE " +
                    "not exists(select pes.id FROM bas_pessoa pes WHERE log.id = pes.id_logradouro) " +
                    "and not exists(select pes.id FROM bas_unidade pes WHERE log.id = pes.id_logradouro)";
    private static final String SQL_LIMPAR_BAIRROS_ORFAOS =
            "DELETE FROM bas_bairro log WHERE not exists(select pes.id FROM bas_logradouro pes WHERE log.id = pes.id_bairro)";

    public Uni<Void> atualizarLogradouros() {
        return pool.query(SQL_LIMPAR_LOGRADOUROS_ORFAOS).execute()
                .chain(r -> pool.query(SQL_LIMPAR_BAIRROS_ORFAOS).execute())
                .replaceWithVoid();
    }
}
