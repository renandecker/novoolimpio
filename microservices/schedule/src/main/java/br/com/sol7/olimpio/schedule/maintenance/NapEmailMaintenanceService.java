package br.com.sol7.olimpio.schedule.maintenance;

import io.smallrye.mutiny.Uni;
import io.vertx.mutiny.sqlclient.Pool;
import io.vertx.mutiny.sqlclient.Row;
import io.vertx.mutiny.sqlclient.Tuple;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.jboss.logging.Logger;

import java.util.ArrayList;
import java.util.List;

/**
 * Portado de NAPEmailService.rotinaEmailNap() do legado
 * (br.com.sol7.olimpio.service.services.educacao.NAPEmailService).
 * <p>
 * Para cada configuracao ativa em edc_nap_email_envio monta o SQL da NAP (from + joins +
 * caseCor da situacao) e registra um registro em edc_nap_email para cada contrato que atende
 * as regras. Nao foi portado o envio efetivo: aqui fica registrado o envio pendente + log.
 * <p>
 * O trigger manual via Kafka (topico olimpio.educacao.email-manual) e consumido pelo
 * notificacoes-service, que possui copia desta rotina; aqui a rotina roda apenas no
 * agendamento automatico (SchedulingJobs.rotinaEmails via MaintenanceConsumer.processarEmails).
 * <p>
 * Acessa o banco pelo datasource reativo "educacao-db" (SQL nativo, sem REST).
 */
@ApplicationScoped
public class NapEmailMaintenanceService {

    private static final Logger LOG = Logger.getLogger(NapEmailMaintenanceService.class);

    @Inject
    Pool pool;

    private static final String SQL_LISTAR_CONFIGS =
            "select e.id, e.tipo, e.situacao, e.id_nap_etapas, et.fl_customizado, et.campo_customizado " +
                    "from edc_nap_email_envio e " +
                    "left join edc_nap_etapas et on (et.id = e.id_nap_etapas) " +
                    "where e.fl_ativo = true";

    private static final String SQL_INSERIR_EMAIL =
            "insert into edc_nap_email (data, id_contrato, email, assunto, mensagem) " +
                    "values (now(), $1, $2, $3, $4)";

    private static final String FROM =
            " from edc_contrato contrato " +
                    " inner join bas_pessoa pessoa on (pessoa.id = contrato.id_pessoa) " +
                    " inner join bas_pessoa_fisica pessoapf on (pessoapf.id_pessoa = pessoa.id) " +
                    " inner join bas_unidade unidaderesponsavel on (contrato.id_unidade_resposavel = unidaderesponsavel.id) " +
                    " inner join bas_unidade unidade on (contrato.id_unidade = unidade.id) " +
                    " inner join edc_curriculo curriculo on (contrato.id_curso = curriculo.id) " +
                    " inner join edc_curso curso on (curriculo.id_curso = curso.id) " +
                    " left join edc_oferecimento_componente_curricular offinicio on (offinicio.id = contrato.id_oferecimento_inicio) " +
                    " left join edc_oferecimento_componente_curricular offfim on (offfim.id = contrato.id_oferecimento_fim) " +
                    " left join bas_pessoa responsavel on (responsavel.id = contrato.id_responsavel) " +
                    " left join bas_pessoa_fisica responsavelpf on (responsavelpf.id_pessoa = responsavel.id) " +
                    " left join bas_pessoa_juridica responsavelpj on (responsavelpj.id_pessoa = responsavel.id) ";

    // que so entram quando a etapa e customizada, igual ao legado).
    private static final String INNER_BASE =
            " left join edc_nap nap on (contrato.id = nap.id_contrato) " +
                    " left join edc_nap_etapas etapa on (nap.id_nap_etapas = etapa.id) " +
                    " left join edc_nap_ligacao ligacaonap on (nap.id_nap_ligacao = ligacaonap.id) " +
                    " left join edc_nap_resultado resultadonap on (ligacaonap.id_nap_resultado = resultadonap.id) " +
                    " left join bas_compromisso compromisso on (ligacaonap.id_compromisso = compromisso.id) " +
                    " left join edc_nap_prioritaria prioritario on (prioritario.id_nap_ligacao = ligacaonap.id)";

    private static final String INNER_EXTRA =
            " left join bas_horario horario on (horario.id = compromisso.id_horario) " +
                    " left join edc_caderno_componente_curricular caderno on (caderno.id = ligacaonap.id_caderno_retorno) " +
                    " left join edc_ocorrencia_componente_curricular ocorrencia on (caderno.id_ocorrencia_componente_curricular = ocorrencia.id) ";

    public record NapEmailConfig(Long id, Integer tipo, String situacao, Long idEtapa,
                                 boolean customizado, String campoCustomizado) {
    }

    public record RotinaEmailNapResumo(int configuracoes, int destinatarios) {
    }

    public Uni<RotinaEmailNapResumo> rotinaEmailNap() {
        return pool.query(SQL_LISTAR_CONFIGS).execute()
                .chain(rows -> {
                    List<NapEmailConfig> configs = new ArrayList<>();
                    for (Row row : rows) {
                        Long idEtapa = row.getLong("id_nap_etapas");
                        boolean customizado = Boolean.TRUE.equals(row.getBoolean("fl_customizado"));
                        configs.add(new NapEmailConfig(row.getLong("id"), row.getInteger("tipo"),
                                row.getString("situacao"), idEtapa, customizado,
                                row.getString("campo_customizado")));
                    }
                    LOG.infof("NapEmail - %d configuracao(es) ativa(s) encontrada(s)", configs.size());
                    return processarConfigs(configs, 0, new RotinaEmailNapResumo(0, 0));
                });
    }

    private Uni<RotinaEmailNapResumo> processarConfigs(List<NapEmailConfig> configs, int index, RotinaEmailNapResumo resumo) {
        if (index >= configs.size()) {
            return Uni.createFrom().item(resumo);
        }
        NapEmailConfig cfg = configs.get(index);
        return processarConfig(cfg).chain(processados -> {
            RotinaEmailNapResumo novo = new RotinaEmailNapResumo(resumo.configuracoes() + 1,
                    resumo.destinatarios() + processados);
            return processarConfigs(configs, index + 1, novo);
        });
    }

    private Uni<Integer> processarConfig(NapEmailConfig cfg) {
        String sql;
        try {
            sql = montarSql(cfg);
        } catch (Exception e) {
            LOG.errorf(e, "NapEmail - config %d: erro ao montar SQL", cfg.id());
            return Uni.createFrom().item(0);
        }
        return pool.query(sql).execute()
                .chain(rows -> {
                    List<Uni<Integer>> envios = new ArrayList<>();
                    for (Row row : rows) {
                        Long contratoId = row.getLong("id");
                        String email = row.getString("email");
                        envios.add(inserirEmail(contratoId, email));
                    }
                    return Uni.join().all(envios).andCollectFailures()
                            .map(lista -> lista.stream().reduce(0, Integer::sum));
                })
                .onFailure().recoverWithItem(e -> {
                    LOG.errorf(e, "NapEmail - config %d: falha ao processar", cfg.id());
                    return 0;
                });
    }

    private Uni<Integer> inserirEmail(Long contratoId, String email) {
        if (contratoId == null) {
            return Uni.createFrom().item(0);
        }
        if (email == null || email.isBlank()) {
            LOG.infof("NapEmail - contrato %d sem e-mail cadastrado (responsavel/pessoa)", contratoId);
        }
        return pool.preparedQuery(SQL_INSERIR_EMAIL)
                .execute(Tuple.of(contratoId, email == null ? "" : email, "", ""))
                .replaceWith(1);
    }

    private String montarSql(NapEmailConfig cfg) {
        if (cfg.idEtapa() == null) {
            throw new IllegalArgumentException("config sem id_nap_etapas");
        }
        String botao = botaoPorTipo(cfg.tipo());
        String inner;
        if (cfg.customizado()) {
            String custom = cfg.campoCustomizado() == null ? "" : cfg.campoCustomizado().trim();
            inner = INNER_BASE + INNER_EXTRA;
            if (custom.isEmpty()) {
                // guarda: etapa customizada sem campo - cai no comportamento padrao
                inner = inner + " where 1=1 and (compromisso.id is null or (compromisso.id is not null and compromisso.ativo = true))" +
                        " and (etapa.id = " + cfg.idEtapa() + ")";
            } else {
                // convencao do legado: campo_customizado comeca com "where"
                inner = inner + " " + custom +
                        " and (compromisso.id is null or (compromisso.id is not null and compromisso.ativo = true))" +
                        " and (etapa.id = " + cfg.idEtapa() + ")";
            }
        } else {
            inner = INNER_BASE + INNER_EXTRA +
                    " where (compromisso.id is null or (compromisso.id is not null and compromisso.ativo = true))" +
                    " and (etapa.id = " + cfg.idEtapa() + ")";
        }
        return "select contrato.id as id, COALESCE(responsavel.email, pessoa.email) as email "
                + FROM + inner + caseCor(botao, cfg.situacao());
    }

    private static String botaoPorTipo(Integer tipo) {
        if (tipo != null && tipo == 1) {
            return "nap.qtde_ligacao";
        }
        if (tipo != null && tipo == 2) {
            return "nap.qtde_carta";
        }
        return "nap.qtde_email";
    }

    // Ajustes de portabilidade (corrigindo SQL invalido do legado):
    //  - DISPONIVEL: "COALESCE(expr booleana, 0)" nao compila no Postgres -> vira "not (expr)".
    //  - SEM_RETORNO: envolto em COALESCE para nao quebrar quando botao for null.
    static String caseCor(String botao, String situacao) {
        if ("AGENDADO".equals(situacao)) {
            return " and compromisso.id is not null and prioritario.id is null and compromisso.data_chegada is null and " +
                    " compromisso.data < (current_date + COALESCE(resultadonap.dias_retorno,0)) " +
                    " and cast(compromisso.data || ' ' || horario.hora as timestamp) < current_date and COALESCE(" + botao + ", 0 ) > 0";
        }
        if ("AGENDADO_SEM_RETORNO".equals(situacao)) {
            return " and compromisso.id is not null and prioritario.id is null and compromisso.data_chegada is null and " +
                    " compromisso.data < (current_date + COALESCE(resultadonap.dias_retorno,0)) and " +
                    " cast(compromisso.data || ' ' || horario.hora as timestamp) >= current_date and COALESCE(" + botao + ", 0 ) > 0";
        }
        if ("COMUNICADO".equals(situacao)) {
            return " and nap.id is not null and prioritario.id is null and " +
                    " caderno.id is null and compromisso.id is null and COALESCE(" + botao + ", 0 ) > 0 ";
        }
        if ("CONTRATO_RECORENTE".equals(situacao)) {
            return " and nap.id is not null and COALESCE(" + botao + ", 0 ) > 0 and " +
                    " compromisso.id is not null and compromisso.data_chegada is not null ";
        }
        if ("DISPONIVEL".equals(situacao)) {
            return " and not (nap.id is not null and prioritario.id is null and " +
                    " caderno.id is null and compromisso.id is null and COALESCE(" + botao + ", 0 ) > 0)";
        }
        if ("PRIORITARIO".equals(situacao)) {
            return " and nap.id is not null and COALESCE(" + botao + ", 0 ) > 0 and prioritario.id is not null " +
                    " and compromisso.id is null and prioritario.data > now() ";
        }
        if ("PRIORITARIO_ATRASADO".equals(situacao)) {
            return " and nap.id is not null and COALESCE(" + botao + ", 0 ) > 0 and " +
                    " prioritario.id is not null and compromisso.id is null and prioritario.data <= now() ";
        }
        if ("RETORNO".equals(situacao)) {
            return " and caderno.id is not null and prioritario.id is null and compromisso.id is null and " +
                    " ocorrencia.data >= current_date and COALESCE(" + botao + ", 0 ) > 0 ";
        }
        if ("SEM_RETORNO".equals(situacao)) {
            return " and caderno.id is not null and prioritario.id is null and compromisso.id is null " +
                    " and ocorrencia.data < current_date and COALESCE(" + botao + ", 0 ) > 0 ";
        }
        return "";
    }
}
