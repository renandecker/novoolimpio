package br.com.sol7.olimpio.schedule.maintenance;

import br.com.sol7.olimpio.schedule.financeiro.FechamentoCaixaEmailEvent;
import br.com.sol7.olimpio.schedule.financeiro.FechamentoEmailProducer;
import io.smallrye.mutiny.Uni;
import io.vertx.mutiny.sqlclient.Pool;
import io.vertx.mutiny.sqlclient.Row;
import io.vertx.mutiny.sqlclient.Tuple;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.jboss.logging.Logger;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.ArrayList;

/**
 * Rotinas do dominio "financeiro" migradas de SchedulingService (FormaPagamentoService,
 * fechamentoCaixaAbertos, custoServico). Acessa "olimpio_financeiro" diretamente pelo datasource reativo
 * "financeiro-db" - sem chamada REST para o microsservico financeiro.
 */
@ApplicationScoped
public class FinanceiroMaintenanceService {

    private static final Logger LOG = Logger.getLogger(FinanceiroMaintenanceService.class);

    @Inject
    Pool pool;

    @Inject
    FechamentoEmailProducer fechamentoEmailProducer;

    private static final String SQL_VERIFICAR_COTA_DIARIO =
            "UPDATE fin_forma_pagamento taxa SET data_controle_cota = now(), valor_controle_cota = valor_cota " +
                    "where taxa.cota = true and taxa.ativo = true and periodicidade = 'DIARIO' and taxa.data_controle_cota != current_date";
    private static final String SQL_VERIFICAR_COTA_SEMANAL =
            "UPDATE fin_forma_pagamento taxa SET data_controle_cota = now(), valor_controle_cota = valor_cota " +
                    "where taxa.cota = true and taxa.ativo = true and periodicidade = 'SEMANAL' " +
                    "and (date_trunc('week', current_date) != date_trunc('week', taxa.data_controle_cota))";
    private static final String SQL_VERIFICAR_COTA_MENSAL =
            "UPDATE fin_forma_pagamento taxa SET data_controle_cota = now(), valor_controle_cota = valor_cota " +
                    "where taxa.cota = true and taxa.ativo = true and periodicidade = 'MENSAL' " +
                    "and date_trunc('month', current_date) != date_trunc('month', taxa.data_controle_cota)";

    public Uni<Void> verificarCotaFormaPagamento() {
        return pool.query(SQL_VERIFICAR_COTA_DIARIO).execute()
                .chain(r -> pool.query(SQL_VERIFICAR_COTA_SEMANAL).execute())
                .chain(r -> pool.query(SQL_VERIFICAR_COTA_MENSAL).execute())
                .replaceWithVoid();
    }

    // Acumula o valor ao mês para cada uso (ligação na central de cobrança ou nap, e-mail, sms)
    // e cria uma parcela no primeiro dia do mês a partir e somente do mês anterior,
    // vinculada ao contrato ligado da central.
    public Uni<Void> processarCustosServicoMensal() {
        LOG.info("Processando custos de serviço e gerando parcelas mensais vinculadas ao contrato...");
        
        // 1. Identificar registros do mês anterior de uso (ligação central / NAP / email / sms)
        // 2. Acumular por aluno/contrato e unidade
        // 3. Inserir parcela (fin_parcela ou fin_cobranca / fin_titulo) no primeiro dia do mês
        // Referência à regra solicitada: criar parcela no primeiro dia do mes a partir e somente do mes anterior, vinculada ao contrato ligado da central.
        
        String sqlGerarParcelasServico = 
            "INSERT INTO fin_parcela (id_contrato, valor, data_vencimento, data_cadastro, status) " +
            "SELECT c.id_contrato, " +
            "       COALESCE(SUM(us.valor), 0) AS total_mes, " +
            "       date_trunc('month', current_date - interval '1 month') + interval '0 day' as vencimento, " +
            "       now(), 'ABERTO' " +
            "FROM fin_uso_servico us " +
            "JOIN fin_contrato c ON c.id = us.id_contrato " +
            "WHERE us.processado = false " +
            "  AND us.data_uso >= date_trunc('month', current_date - interval '1 month') " +
            "  AND us.data_uso < date_trunc('month', current_date) " +
            "GROUP BY c.id_contrato";

        String sqlMarcarProcessado = 
            "UPDATE fin_uso_servico SET processado = true " +
            "WHERE processado = false " +
            "  AND data_uso >= date_trunc('month', current_date - interval '1 month') " +
            "  AND data_uso < date_trunc('month', current_date)";

        return pool.query("CREATE TABLE IF NOT EXISTS fin_uso_servico (" +
                "id BIGSERIAL PRIMARY KEY, " +
                "id_contrato BIGINT, " +
                "tipo_servico VARCHAR(50), " +
                "valor NUMERIC(10,2), " +
                "data_uso TIMESTAMP, " +
                "processado BOOLEAN DEFAULT false)").execute()
            .chain(r -> pool.query(sqlGerarParcelasServico).execute())
            .chain(r -> pool.query(sqlMarcarProcessado).execute())
            .replaceWithVoid()
            .onFailure().invoke(e -> LOG.error("Erro ao processar custos de serviço e parcelas mensais: " + e.getMessage()));
    }

    private static final String SQL_BUSCAR_CAIXAS_ABERTOS =
            "SELECT c.id, c.id_unidade, c.id_usuario, c.id_caixa_unidade " +
                    "FROM fin_caixa c WHERE c.data_fechamento IS NULL";
    private static final String SQL_SOMAR_ENTRADAS =
            "SELECT COALESCE(SUM(m.valor), 0) AS total FROM fin_movimentacao m " +
                    "JOIN fin_movimento mv ON mv.id = m.id_movimento " +
                    "JOIN fin_tipo_movimento tm ON tm.id = mv.id_tipo_movimento " +
                    "WHERE m.id_caixa = $1 AND tm.id = 1";
    private static final String SQL_SOMAR_SAIDAS =
            "SELECT COALESCE(SUM(m.valor), 0) AS total FROM fin_movimentacao m " +
                    "JOIN fin_movimento mv ON mv.id = m.id_movimento " +
                    "JOIN fin_tipo_movimento tm ON tm.id = mv.id_tipo_movimento " +
                    "WHERE m.id_caixa = $1 AND tm.id = 2";
    private static final String SQL_SOMAR_SANGRIA =
            "SELECT COALESCE(SUM(valor), 0) AS total FROM fin_sangria WHERE id_caixa = $1";
    private static final String SQL_FECHAR_CAIXA =
            "UPDATE fin_caixa SET data_fechamento = now() WHERE id = $1";

    // Busca ConfiguracaoCaixa do responsavel (usuario + unidade) - email, etc.
    private static final String SQL_BUSCAR_CONFIG_CAIXA =
            "SELECT id, email FROM fin_configuracao_caixa WHERE id_usuario = $1 AND id_unidade = $2 ORDER BY id DESC LIMIT 1";

    // Busca Layout da unidade (via id_tema) para tema_email e imagem_email
    private static final String SQL_BUSCAR_LAYOUT_UNIDADE =
            "SELECT l.tema_email, l.imagem_email, l.url " +
                    "FROM bas_unidade u JOIN bas_layout l ON l.id = u.id_tema WHERE u.id = $1";

    public record FechamentoCaixaResumo(Long caixaId, Long unidadeId, BigDecimal entradas,
                                        BigDecimal saidas, BigDecimal sangria) {
    }

    private record CaixaAberto(Long id, Long unidadeId, Long usuarioId, Integer caixaUnidade) {
    }

    private record ConfigCaixaEmail(String email) {
    }

    private record LayoutInfo(String temaEmail, String imagemEmail, String url) {
    }

    public Uni<List<FechamentoCaixaResumo>> fechamentoCaixaAbertos() {
        return pool.query(SQL_BUSCAR_CAIXAS_ABERTOS).execute()
                .map(rows -> {
                    List<CaixaAberto> caixas = new ArrayList<>();
                    for (Row row : rows) {
                        caixas.add(new CaixaAberto(
                                row.getLong("id"),
                                row.getLong("id_unidade"),
                                row.getLong("id_usuario"),
                                row.getInteger("id_caixa_unidade")
                        ));
                    }
                    return caixas;
                })
                .chain(caixas -> {
                    List<Uni<FechamentoCaixaResumo>> unis = caixas.stream().map(this::fecharUmCaixa).toList();
                    return Uni.join().all(unis).andFailFast();
                });
    }

    private Uni<FechamentoCaixaResumo> fecharUmCaixa(CaixaAberto caixa) {
        Uni<BigDecimal> entradas = pool.preparedQuery(SQL_SOMAR_ENTRADAS).execute(Tuple.of(caixa.id()))
                .map(rows -> rows.iterator().next().getBigDecimal("total"));
        Uni<BigDecimal> saidas = pool.preparedQuery(SQL_SOMAR_SAIDAS).execute(Tuple.of(caixa.id()))
                .map(rows -> rows.iterator().next().getBigDecimal("total"));
        Uni<BigDecimal> sangria = pool.preparedQuery(SQL_SOMAR_SANGRIA).execute(Tuple.of(caixa.id()))
                .map(rows -> rows.iterator().next().getBigDecimal("total"));

        return Uni.combine().all().unis(entradas, saidas, sangria).asTuple()
                .chain(t -> {
                    BigDecimal e = t.getItem1();
                    BigDecimal s = t.getItem2();
                    BigDecimal sg = t.getItem3();
                    return pool.preparedQuery(SQL_FECHAR_CAIXA).execute(Tuple.of(caixa.id()))
                            .chain(v -> buscarConfigECaixaEmail(caixa)
                                    .chain(configEmail -> buscarLayoutUnidade(caixa.unidadeId())
                                            .chain(layout -> enviarEmailFechamento(caixa, e, s, sg, configEmail, layout))
                                            .replaceWith(new FechamentoCaixaResumo(caixa.id(), caixa.unidadeId(), e, s, sg))));
                });
    }

    private Uni<ConfigCaixaEmail> buscarConfigECaixaEmail(CaixaAberto caixa) {
        return pool.preparedQuery(SQL_BUSCAR_CONFIG_CAIXA).execute(Tuple.of(caixa.usuarioId(), caixa.unidadeId()))
                .map(rows -> {
                    if (rows.iterator().hasNext()) {
                        Row row = rows.iterator().next();
                        String email = row.getString("email");
                        return new ConfigCaixaEmail(email);
                    }
                    return new ConfigCaixaEmail(null);
                });
    }

    private Uni<LayoutInfo> buscarLayoutUnidade(Long unidadeId) {
        return pool.preparedQuery(SQL_BUSCAR_LAYOUT_UNIDADE).execute(Tuple.of(unidadeId))
                .map(rows -> {
                    if (rows.iterator().hasNext()) {
                        Row row = rows.iterator().next();
                        return new LayoutInfo(
                                row.getString("tema_email"),
                                row.getString("imagem_email"),
                                row.getString("url")
                        );
                    }
                    return new LayoutInfo(null, null, null);
                });
    }

    private Uni<Void> enviarEmailFechamento(CaixaAberto caixa, BigDecimal entradas, BigDecimal saidas, BigDecimal sangria,
                                            ConfigCaixaEmail configCaixa, LayoutInfo layout) {
        // Buscar e-mail da unidade, sucinto e nome do usuario
        String sqlUnidadeUsuario = "SELECT u.email, u.sucinto, us.login, pf.nome " +
                "FROM bas_unidade u " +
                "LEFT JOIN bas_usuario us ON us.id = $2 " +
                "LEFT JOIN bas_pessoa p ON p.id = us.id_pessoa " +
                "LEFT JOIN bas_pessoa_fisica pf ON pf.id_pessoa = p.id " +
                "WHERE u.id = $1";
        return pool.preparedQuery(sqlUnidadeUsuario).execute(Tuple.of(caixa.unidadeId(), caixa.usuarioId()))
                .map(rows -> {
                    String emailUnidade = null;
                    String sucinto = null;
                    String login = null;
                    String nomePessoa = null;
                    if (rows.iterator().hasNext()) {
                        Row row = rows.iterator().next();
                        emailUnidade = row.getString("email");
                        sucinto = row.getString("sucinto");
                        login = row.getString("login");
                        nomePessoa = row.getString("nome");
                    }
                    // Define destinatario: configuracaoCaixa.email > unidade.email
                    String destinatario = (configCaixa.email() != null && !configCaixa.email().isBlank())
                            ? configCaixa.email() : emailUnidade;

                    // Nome do funcionario: pessoa fisica nome > login
                    String nomeFuncionario = (nomePessoa != null && !nomePessoa.isBlank()) ? nomePessoa : login;
                    if (nomeFuncionario == null) {
                        nomeFuncionario = "Usuario " + caixa.usuarioId();
                    }

                    String assunto = "Fechamento de Caixa Automático (" + (sucinto != null && !sucinto.isBlank() ? sucinto : "Unidade " + caixa.unidadeId()) + ")";
                    String corpoHtml = montarHtmlEmailFechamento(caixa.caixaUnidade(), nomeFuncionario,
                            entradas, saidas, sangria, layout, sucinto);

                    return new EmailSendData(destinatario, assunto, corpoHtml);
                })
                .chain(data -> {
                    if (data.destinatario() == null || data.destinatario().isBlank()) {
                        LOG.warnf("Caixa %d (unidade %d): nenhum e-mail de destino encontrado (configCaixa nem unidade) - e-mail nao publicado",
                                caixa.id(), caixa.unidadeId());
                        return Uni.createFrom().voidItem();
                    }
                    // Regra do legado: um e-mail por caixa fechado. A entrega e feita pelo
                    // notificacoes-service via topico olimpio.financeiro.email-manual.
                    return fechamentoEmailProducer.publicar(new FechamentoCaixaEmailEvent(
                            FechamentoCaixaEmailEvent.TIPO_FECHAMENTO_CAIXA,
                            caixa.id(), caixa.unidadeId(),
                            data.destinatario(), data.assunto(), data.corpoHtml(),
                            entradas, saidas, sangria));
                });
    }

    private String montarHtmlEmailFechamento(Integer caixaUnidade, String nomeFuncionario,
                                             BigDecimal entradas, BigDecimal saidas, BigDecimal sangria,
                                             LayoutInfo layout, String unidadeSucinto) {
        // This method builds the HTML using the same structure as legacy CaixaService.textoEmailCaixa()
        String temaEmail = (layout.temaEmail() != null && !layout.temaEmail().isBlank()) ? layout.temaEmail() : "007bff";
        String imagemEmail = (layout.imagemEmail() != null && !layout.imagemEmail().isBlank())
                ? "<img width=\"30\" src=\"" + layout.imagemEmail() + "\" alt=\"\">" : "";
        String url = (layout.url() != null && !layout.url().isBlank()) ? layout.url() : "#";

        String unidadeNome = (unidadeSucinto != null && !unidadeSucinto.isBlank()) ? unidadeSucinto : "Unidade " + caixaUnidade;

        String fmtEntradas = entradas.setScale(2, RoundingMode.HALF_DOWN).toString().replace(".", ",");
        String fmtSaidas = saidas.setScale(2, RoundingMode.HALF_DOWN).toString().replace(".", ",");
        String fmtSangria = sangria.setScale(2, RoundingMode.HALF_DOWN).toString().replace(".", ",");

        String mensagem = "Este caixa foi fechado automaticamente, pois o usuario " + nomeFuncionario + " não fechou.";

        return "<table width=\"500\" border=\"1\" cellpadding=\"1\" cellspacing=\"1\" align=\"center\" style=\"background-color: #F0F0F0; border-collapse: collapse; border-color: #F0F0F0;\">" +
                "<tbody><tr style=\"background-color: #" + temaEmail + ";\"><td><p style=\"text-align: center; margin: 0;\"><span style=\"font-size: larger;\">" +
                " " + imagemEmail + "</span></p></td></tr><tr><td><p>&nbsp;</p>" +
                "<p style=\"margin: 5px;\">" + mensagem +
                "</td></tr>" +
                "<br/>" +
                "<tr>" +
                "<td style = \" padding-left: 8px;\">" +
                "Nome Funcionario: " + nomeFuncionario +
                "</td>" +
                "</tr>" +
                "<tr>" +
                "<td style = \" padding-left: 8px;\">" +
                "Nome Unidade: " + unidadeNome +
                "</td>" +
                "</tr>" +
                "<tr>" +
                "<td style = \" padding-left: 8px;\">" +
                "Total Entradas: R$ " + fmtEntradas +
                "</td>" +
                "</tr>" +
                "<tr>" +
                "<td style = \" padding-left: 8px;\">" +
                "Total Saidas: R$ " + fmtSaidas +
                "</td>" +
                "</tr>" +
                "<tr>" +
                "<td style = \" padding-left: 8px;\">" +
                "Total Sangria: R$ " + fmtSangria +
                "</td>" +
                "</tr>" +
                "<br/>" +
                "<br/>" +
                "<tr>" +
                "<td style = \" padding-left: 8px; font-size: 15px; font-weight: bold;\">" +
                "Numero caixa: " + caixaUnidade +
                "</td><tr><td style = \"text-align: center;\" >" +
                "<a href=\"" + url + "\">Acesse a plataforma clicando aqui.</a></p><p>&nbsp;</p></td></tr></tbody></table>";
    }

    private record EmailSendData(String destinatario, String assunto, String corpoHtml) {
    }

    public Uni<Void> atualizarCobrancasAutomatico() {
        return processarCustosServicoMensal();
    }
}
