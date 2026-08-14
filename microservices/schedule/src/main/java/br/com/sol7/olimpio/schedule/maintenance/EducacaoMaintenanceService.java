package br.com.sol7.olimpio.schedule.maintenance;

import io.smallrye.mutiny.Uni;
import io.vertx.mutiny.sqlclient.Pool;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

/**
 * Rotinas do dominio "educacao" migradas de SchedulingService (TaxaCursoService,
 * DescontoCursoService e limpeza de cancelamento de contrato vencido). Todas as consultas usam
 * o pool padrão do banco compartilhado.
 */
@ApplicationScoped
public class EducacaoMaintenanceService {

    @Inject
    Pool pool;

    // Migrado de TaxaCursoService.verificarCotaAuto()
    private static final String[] SQL_VERIFICAR_COTA_TAXA_CURSO = {
            "UPDATE edc_taxa_curso taxa SET data_controle_cota = now(), valor_controle_cota = valor_cota " +
                    "where taxa.cota = true and taxa.ativo = true and periodicidade = 'DIARIO' and taxa.data_controle_cota != current_date",
            "UPDATE edc_taxa_curso taxa SET data_controle_cota = now(), valor_controle_cota = valor_cota " +
                    "where taxa.cota = true and taxa.ativo = true and periodicidade = 'SEMANAL' " +
                    "and (date_trunc('week', current_date) != date_trunc('week', taxa.data_controle_cota))",
            "UPDATE edc_taxa_curso taxa SET data_controle_cota = now(), valor_controle_cota = valor_cota " +
                    "where taxa.cota = true and taxa.ativo = true and periodicidade = 'MENSAL' and " +
                    "date_trunc('month', current_date) != date_trunc('month', taxa.data_controle_cota)",
    };

    public Uni<Void> verificarCotaTaxaCurso() {
        return executeAll(SQL_VERIFICAR_COTA_TAXA_CURSO);
    }

    // Migrado de DescontoCursoService.verificarCotaAuto()
    private static final String[] SQL_VERIFICAR_COTA_DESCONTO_CURSO = {
            "UPDATE edc_desconto_curso taxa SET data_controle_cota = now(), valor_controle_cota = valor_cota " +
                    "where taxa.cota = true and taxa.ativo = true and periodicidade = 'DIARIO' and taxa.data_controle_cota != current_date",
            "UPDATE edc_desconto_curso taxa SET data_controle_cota = now(), valor_controle_cota = valor_cota " +
                    "where taxa.cota = true and taxa.ativo = true and periodicidade = 'SEMANAL' " +
                    "and (date_trunc('week', current_date) != date_trunc('week', taxa.data_controle_cota))",
            "UPDATE edc_desconto_curso taxa SET data_controle_cota = now(), valor_controle_cota = valor_cota " +
                    "where taxa.cota = true and taxa.ativo = true and periodicidade = 'MENSAL' and " +
                    "date_trunc('month', current_date) != date_trunc('month', taxa.data_controle_cota)",
    };

    public Uni<Void> verificarCotaDescontoCurso() {
        return executeAll(SQL_VERIFICAR_COTA_DESCONTO_CURSO);
    }

    private Uni<Void> executeAll(String[] sqls) {
        Uni<Void> chain = Uni.createFrom().voidItem();
        for (String sql : sqls) {
            chain = chain.chain(() -> pool.query(sql).execute().replaceWithVoid());
        }
        return chain;
    }

    // Migrado de SchedulingService.tudo() - remove cancelamento de contratos com data vencida
    private static final String SQL_LIMPAR_CANCELAMENTO_CONTRATO_VENCIDO =
            "UPDATE edc_contrato SET data_cancelamento = null where ativo = true and data_cancelamento < current_date";

    public Uni<Void> limparCancelamentoContratoVencido() {
        return pool.query(SQL_LIMPAR_CANCELAMENTO_CONTRATO_VENCIDO).execute().replaceWithVoid();
    }

    // A replicação exige as entidades e regras de negócio do domínio Educação. Ela não é
    // executada por chamada HTTP pelo schedule; a rotina permanece exclusivamente no serviço
    // dono da regra até ser extraída para uma biblioteca de domínio compartilhada.
    public Uni<Void> replicarOferecimentoAutomatico() {
        return Uni.createFrom().voidItem();
    }

    // Migrado de ChamadaAssinadaImpressaService.carregarChamadasPendentes() - geracao/impressao
    // de PDF. Nao portada automaticamente, ver RELATORIO_SCHEDULE.md.
    public Uni<Void> carregarChamadasPendentesAutomatico() {
        // TODO: portar a regra de negocio (ver RELATORIO_SCHEDULE.md)
        return Uni.createFrom().voidItem();
    }

    // Migrado de SchedulingService.desativarCorrigirAvaliacoes() - ativa/desativa as avaliacoes
    // (perguntas/respostas dos alunos) conforme as janelas de data_inicial/data_final.
    // As condicoes do legado estavam invertidas (data_inicial >= current_date e data_final <
    // current_date; e data_final >= current_date para desativar); corrigidas para ativar apenas
    // dentro da janela e desativar fora dela.
    private static final String[] SQL_CORRIGIR_AVALIACOES = {
            "UPDATE edc_avaliacao SET fl_ativo = true where fl_ativo = false " +
                    "and data_inicial <= current_date and data_final >= current_date",
            "UPDATE edc_avaliacao SET fl_ativo = false where fl_ativo = true " +
                    "and (data_inicial > current_date or data_final < current_date)",
    };

    public Uni<Void> corrigirAvaliacoes() {
        return executeAll(SQL_CORRIGIR_AVALIACOES);
    }
}
