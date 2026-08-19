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
 * Portado de CobrancaEmailService.rotinaEmailCobranca() do legado
 * (br.com.sol7.olimpio.service.services.financeiro.CobrancaEmailService).
 *
 * Para cada configuracao ativa em fin_cobranca_email_envio monta o SQL da cobranca (from +
 * joins + caseCor da situacao) e registra um registro em fin_cobranca_email para cada contrato
 * que atende as regras. Nao foi portado o envio efetivo: aqui fica registrado o envio pendente + log.
 *
 * Acessa o banco pelo datasource reativo "financeiro-db" (SQL nativo, sem REST).
 */
@ApplicationScoped
public class CobrancaEmailMaintenanceService {

    private static final Logger LOG = Logger.getLogger(CobrancaEmailMaintenanceService.class);

    @Inject
    Pool pool;

    private static final String SQL_LISTAR_CONFIGS =
            "select e.id, e.tipo, e.situacao, e.id_cobranca_etapas, et.fl_customizado, et.campo_customizado " +
                    "from fin_cobranca_email_envio e " +
                    "left join fin_etapas_cobranca et on (et.id = e.id_cobranca_etapas) " +
                    "where e.fl_ativo = true";

    private static final String SQL_INSERIR_EMAIL =
            "insert into fin_cobranca_email (data, id_contrato, email, assunto, mensagem) " +
                    "values (now(), $1, $2, $3, $4)";

    // Portado de CobrancaEmailService.rotinaEmailCobranca() - FROM identico ao legado.
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

    // Portado de CobrancaEmailService.rotinaEmailCobranca() - joins do legado.
    private static final String INNER_BASE =
                    " left join fin_cobranca cobranca on (contrato.id = cobranca.id_contrato) " +
                    " left join fin_etapas_cobranca etapa on (cobranca.id_cobranca_etapas = etapa.id) " +
                    " left join fin_cobranca_ligacao ligacaocobranca on (cobranca.id_cobranca_ligacao = ligacaocobranca.id) " +
                    " left join bas_compromisso compromisso on (ligacaocobranca.id_compromisso = compromisso.id) " +
                    " left join bas_horario horario on (horario.id = compromisso.id_horario) " +
                    " left join fin_cobranca_resultado resultadocobranca on (resultadocobranca.id = ligacaocobranca.id_cobranca_resultado) " +
                    " left join fin_cobranca_prioritaria prioritario on (prioritario.id_cobranca_ligacao = ligacaocobranca.id)";

    public record CobrancaEmailConfig(Long id, Integer tipo, String situacao, Long idEtapa,
                                      boolean customizado, String campoCustomizado) {}

    public record RotinaEmailCobrancaResumo(int configuracoes, int destinatarios) {}

    public Uni<RotinaEmailCobrancaResumo> rotinaEmailCobranca() {
        return pool.query(SQL_LISTAR_CONFIGS).execute()
                .chain(rows -> {
                    List<CobrancaEmailConfig> configs = new ArrayList<>();
                    for (Row row : rows) {
                        Long idEtapa = row.getLong("id_cobranca_etapas");
                        boolean customizado = Boolean.TRUE.equals(row.getBoolean("fl_customizado"));
                        configs.add(new CobrancaEmailConfig(row.getLong("id"), row.getInteger("tipo"),
                                row.getString("situacao"), idEtapa, customizado,
                                row.getString("campo_customizado")));
                    }
                    LOG.infof("CobrancaEmail - %d configuracao(es) ativa(s) encontrada(s)", configs.size());
                    return processarConfigs(configs, 0, new RotinaEmailCobrancaResumo(0, 0));
                });
    }

    private Uni<RotinaEmailCobrancaResumo> processarConfigs(List<CobrancaEmailConfig> configs, int index,
                                                            RotinaEmailCobrancaResumo resumo) {
        if (index >= configs.size()) {
            return Uni.createFrom().item(resumo);
        }
        CobrancaEmailConfig cfg = configs.get(index);
        return processarConfig(cfg).chain(processados -> {
            RotinaEmailCobrancaResumo novo = new RotinaEmailCobrancaResumo(resumo.configuracoes() + 1,
                    resumo.destinatarios() + processados);
            return processarConfigs(configs, index + 1, novo);
        });
    }

    private Uni<Integer> processarConfig(CobrancaEmailConfig cfg) {
        String sql;
        try {
            sql = montarSql(cfg);
        } catch (Exception e) {
            LOG.errorf(e, "CobrancaEmail - config %d: erro ao montar SQL", cfg.id());
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
                    LOG.errorf(e, "CobrancaEmail - config %d: falha ao processar", cfg.id());
                    return 0;
                });
    }

    private Uni<Integer> inserirEmail(Long contratoId, String email) {
        if (contratoId == null) {
            return Uni.createFrom().item(0);
        }
        if (email == null || email.isBlank()) {
            LOG.infof("CobrancaEmail - contrato %d sem e-mail cadastrado (responsavel/pessoa)", contratoId);
        }
        return pool.preparedQuery(SQL_INSERIR_EMAIL)
                .execute(Tuple.of(contratoId, email == null ? "" : email, "", ""))
                .replaceWith(1);
    }

    private String montarSql(CobrancaEmailConfig cfg) {
        if (cfg.idEtapa() == null) {
            throw new IllegalArgumentException("config sem id_cobranca_etapas");
        }
        String botao = botaoPorTipo(cfg.tipo());
        String inner;
        if (cfg.customizado()) {
            String custom = cfg.campoCustomizado() == null ? "" : cfg.campoCustomizado().trim();
            if (custom.isEmpty()) {
                // guarda: etapa customizada sem campo - cai no comportamento padrao
                inner = INNER_BASE + " where 1=1";
            } else {
                // convencao do legado: campo_customizado comeca com "where"
                inner = INNER_BASE + " " + custom;
            }
        } else {
            // legado produzia "where and ..." (SQL invalido) - corrigido para "where 1=1"
            inner = INNER_BASE + " where 1=1";
        }
        return "select contrato.id as id, COALESCE(responsavel.email, pessoa.email) as email "
                + FROM + inner + caseCor(botao, cfg.situacao());
    }

    private static String botaoPorTipo(Integer tipo) {
        if (tipo != null && tipo == 1) {
            return "cobranca.qtde_ligacao";
        }
        if (tipo != null && tipo == 2) {
            return "cobranca.qtde_carta";
        }
        return "cobranca.qtde_email";
    }

    // Portado de CobrancaEmailService.caseCor(String botao, SituacaoCobranca situacaoCobranca).
    static String caseCor(String botao, String situacao) {
        if ("AGENDADO".equals(situacao)) {
            return " and cobranca.id is not null and COALESCE(" + botao + ", 0 ) > 0 and prioritario.id is null and " +
                    " compromisso.id is not null and compromisso.data_chegada is null and " +
                    " compromisso.data < (current_date + (COALESCE(resultadocobranca.dias_retorno,0))) and " +
                    " cast(compromisso.data || ' ' || horario.hora as timestamp) > current_date";
        }
        if ("AGENDADO_ATRASADO".equals(situacao)) {
            return " and cobranca.id is not null and COALESCE(" + botao + ", 0 ) > 0 and prioritario.id is null " +
                    " and compromisso.id is not null and compromisso.data_chegada is null and " +
                    " compromisso.data < (current_date + (COALESCE(resultadocobranca.dias_retorno,0))) and " +
                    " cast(compromisso.data || ' ' || horario.hora as timestamp) <= current_date";
        }
        if ("CONTATADO_HOJE".equals(situacao)) {
            return " and cobranca.id is not null and COALESCE(" + botao + ", 0 ) > 0 and prioritario.id is null " +
                    " and compromisso.id is null and cast(ligacaocobranca.data_inicial as date) = current_date";
        }
        if ("CONTATO_PENDENTE".equals(situacao)) {
            return " and cobranca.id is not null and COALESCE(" + botao + ", 0 ) > 0 and prioritario.id is null " +
                    " and compromisso.id is null and cast(ligacaocobranca.data_inicial as date) <> current_date";
        }
        if ("CONTATO_RECORRENTE".equals(situacao)) {
            return " and cobranca.id is not null and COALESCE(" + botao + ", 0 ) > 0 and " +
                    " compromisso.id is not null and compromisso.data_chegada is not null";
        }
        if ("NUNCA_CONTATADO".equals(situacao)) {
            return " and COALESCE(" + botao + ", 0 ) = 0";
        }
        if ("PRIORITARIO".equals(situacao)) {
            return " and cobranca.id is not null and COALESCE(" + botao + ", 0 ) > 0 and " +
                    " prioritario.id is not null and compromisso.id is null and prioritario.data > now() ";
        }
        if ("PRIORITARIO_ATRASADO".equals(situacao)) {
            return " and cobranca.id is not null and COALESCE(" + botao + ", 0 ) > 0 and " +
                    " prioritario.id is not null and compromisso.id is null and prioritario.data <= now()";
        }
        return "";
    }
}
