package br.com.sol7.olimpio.financeiro.lote.service;

import br.com.sol7.olimpio.financeiro.lote.dto.LoteCobrancaEmailRequest;
import br.com.sol7.olimpio.financeiro.lote.dto.LoteCobrancaLigacaoRequest;
import br.com.sol7.olimpio.financeiro.lote.dto.LoteCobrancaResponse;
import br.com.sol7.olimpio.financeiro.lote.dto.LoteCobrancaResponse.Aluno;
import br.com.sol7.olimpio.financeiro.lote.dto.LoteCobrancaResponse.ModeloEmail;
import br.com.sol7.olimpio.financeiro.lote.dto.LoteCobrancaResponse.Resumo;
import br.com.sol7.olimpio.financeiro.lote.dto.LoteCobrancaResponse.ResultadoLigacao;
import br.com.sol7.olimpio.financeiro.lote.kafka.NotificacaoEventProducer;
import br.com.sol7.olimpio.financeiro.lote.kafka.NotificacaoMessage;
import io.smallrye.mutiny.Uni;
import io.vertx.mutiny.sqlclient.Pool;
import io.vertx.mutiny.sqlclient.Row;
import io.vertx.mutiny.sqlclient.Tuple;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.BadRequestException;
import jakarta.ws.rs.NotFoundException;
import org.jboss.logging.Logger;

import java.util.ArrayList;
import java.util.List;

/**
 * Fluxo de lote da Cobranca (portado das acoes legadas preparaEnvioEmailLote e
 * iniciaLigacaoLoteContinua do CobrancaController). Executa SQL nativo contra o banco
 * olimpio, seguindo o mesmo FROM/joins/caseCor usado em rotinaEmailCobranca().
 */
@ApplicationScoped
public class LoteCobrancaService {

    private static final Logger LOG = Logger.getLogger(LoteCobrancaService.class);

    @Inject
    Pool pool;

    @Inject
    NotificacaoEventProducer notificacaoProducer;

    private static final String SQL_MODELOS_EMAIL =
            "select m.id, m.descricao, m.assunto, m.mensagem from bas_mensagem m " +
                    "where m.fl_email = true and m.tipo = 'COBRANCA' order by m.descricao";

    private static final String SQL_MODELO_POR_ID =
            "select m.assunto, m.mensagem from bas_mensagem m where m.id = $1";

    private static final String SQL_ETAPA =
            "select et.fl_customizado, et.campo_customizado from fin_etapas_cobranca et where et.id = $1";

    private static final String SQL_EMAIL_CONTRATO =
            "select COALESCE(responsavel.email, pessoa.email) as email, " +
                    "(select l.username from bas_login l " +
                    "  join bas_usuario u on (u.id = l.id_usuario) " +
                    "  where u.id_pessoa = COALESCE(contrato.id_responsavel, contrato.id_pessoa) limit 1) as username " +
                    "from edc_contrato contrato " +
                    "left join bas_pessoa responsavel on (responsavel.id = contrato.id_responsavel) " +
                    "left join bas_pessoa pessoa on (pessoa.id = contrato.id_pessoa) " +
                    "where contrato.id = $1";

    private static final String SQL_INCREMENTAR_EMAIL =
            "update fin_cobranca set qtde_email = COALESCE(qtde_email, 0) + 1 where id_contrato = $1";

    private static final String SQL_INCREMENTAR_LIGACAO =
            "update fin_cobranca set id_ligacao_cobranca = $1, qtde_ligacao = COALESCE(qtde_ligacao, 0) + 1 " +
                    "where id_contrato = $2";

    private static final String SQL_INSERIR_EMAIL =
            "insert into fin_cobranca_email (data, id_contrato, email, assunto, mensagem, id_mensagem, id_cobranca_etapas) " +
                    "values (now(), $1, $2, $3, $4, $5, $6)";

    private static final String SQL_INSERIR_LIGACAO =
            "insert into fin_cobranca_ligacao (id_contrato, id_cobranca_etapa, data_inicial, ativo) " +
                    "values ($1, $2, now(), true) returning id";

    // FROM identico ao legado (CobrancaEmailService.rotinaEmailCobranca()).
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

    private static final String INNER_BASE =
            " left join fin_cobranca cobranca on (contrato.id = cobranca.id_contrato) " +
                    " left join fin_etapas_cobranca etapa on (cobranca.id_cobranca_etapas = etapa.id) " +
                    " left join fin_cobranca_ligacao ligacaocobranca on (cobranca.id_ligacao_cobranca = ligacaocobranca.id) " +
                    " left join bas_compromisso compromisso on (ligacaocobranca.id_compromisso = compromisso.id) " +
                    " left join bas_horario horario on (horario.id = compromisso.id_horario) " +
                    " left join fin_cobranca_resultado resultadocobranca on (resultadocobranca.id = ligacaocobranca.id_cobranca_resultado) " +
                    " left join fin_cobranca_prioritaria prioritario on (prioritario.id_cobranca_ligacao = ligacaocobranca.id)";

    private static final String SELECT_ALUNOS =
            "select distinct contrato.id as id, " +
                    " COALESCE(responsavelpj.nome_fantasia, responsavelpf.nome, pessoapf.nome) as contratante, " +
                    " pessoapf.nome as aluno, " +
                    " COALESCE(responsavel.email, pessoa.email) as email";

    public Uni<List<ModeloEmail>> modelosEmail() {
        return pool.query(SQL_MODELOS_EMAIL).execute()
                .map(rows -> {
                    List<ModeloEmail> modelos = new ArrayList<>();
                    for (Row row : rows) {
                        modelos.add(new ModeloEmail(row.getLong("id"), row.getString("descricao"),
                                row.getString("assunto"), row.getString("mensagem")));
                    }
                    return modelos;
                });
    }

    public Uni<LoteCobrancaResponse.ResumoAlunos> alunos(Long etapasCobrancaId, String situacao, Integer tipo, String q) {
        if (etapasCobrancaId == null) {
            return Uni.createFrom().failure(new BadRequestException("etapasCobrancaId é obrigatório"));
        }
        String s = (situacao == null || situacao.isBlank()) ? "NUNCA_CONTATADO" : situacao;
        int t = (tipo == null) ? 0 : tipo;
        String botao = botaoPorTipo(t);
        return pool.preparedQuery(SQL_ETAPA).execute(Tuple.of(etapasCobrancaId))
                .onItem().transformToUni(rows -> {
                    boolean customizado = false;
                    String campo = null;
                    for (Row row : rows) {
                        customizado = Boolean.TRUE.equals(row.getBoolean("fl_customizado"));
                        campo = row.getString("campo_customizado");
                    }
                    String where;
                    if (customizado && campo != null && !campo.isBlank()) {
                        where = " " + campo;
                    } else {
                        where = " where 1=1 and (etapa.id = " + etapasCobrancaId + ")";
                    }
                    StringBuilder sql = new StringBuilder(SELECT_ALUNOS).append(FROM)
                            .append(INNER_BASE).append(where)
                            .append(caseCor(botao, s));
                    if (q != null && !q.isBlank()) {
                        String lq = q.replace("'", "''");
                        sql.append(" and (pessoapf.nome ilike '%").append(lq)
                                .append("%' or responsavelpf.nome ilike '%").append(lq).append("%')");
                    }
                    sql.append(" order by aluno limit 300");
                    return pool.query(sql.toString()).execute()
                            .map(rowsAlunos -> {
                                List<Aluno> alunos = new ArrayList<>();
                                for (Row row : rowsAlunos) {
                                    alunos.add(new Aluno(row.getLong("id"), row.getString("aluno"),
                                            row.getString("contratante"), row.getString("email")));
                                }
                                return new LoteCobrancaResponse.ResumoAlunos(alunos, alunos.size());
                            });
                });
    }

    public Uni<Resumo> enviarEmail(LoteCobrancaEmailRequest req) {
        if (req.etapasCobrancaId() == null || req.mensagemId() == null) {
            return Uni.createFrom().failure(new BadRequestException("etapasCobrancaId e mensagemId são obrigatórios"));
        }
        List<Long> ids = req.contratoIds() == null ? List.of() : req.contratoIds();
        boolean canalEmail = req.canalEmail() == null || req.canalEmail();
        boolean canalMobile = Boolean.TRUE.equals(req.canalMobile());
        boolean canalSistema = Boolean.TRUE.equals(req.canalSistema());
        return pool.preparedQuery(SQL_MODELO_POR_ID).execute(Tuple.of(req.mensagemId()))
                .onItem().transformToUni(rows -> {
                    if (rows.size() == 0) {
                        return Uni.createFrom().failure(new NotFoundException("Modelo de email não encontrado"));
                    }
                    Row row = rows.iterator().next();
                    String assunto = row.getString("assunto");
                    String mensagem = row.getString("mensagem");
                    return processarEmails(req.etapasCobrancaId(), req.mensagemId(), assunto, mensagem, ids, 0,
                            new Resumo(0, 0, 0, assunto), canalEmail, canalMobile, canalSistema);
                });
    }

    private record Destinatario(String email, String username) {
    }

    private Uni<Resumo> processarEmails(Long etapaId, Long mensagemId, String assunto, String mensagem,
                                        List<Long> ids, int index, Resumo acc,
                                        boolean canalEmail, boolean canalMobile, boolean canalSistema) {
        if (index >= ids.size()) {
            return Uni.createFrom().item(acc);
        }
        Long contratoId = ids.get(index);
        return resolverDestinatario(contratoId).chain(dest -> {
            if (dest.email() == null || dest.email().isBlank()) {
                LOG.infof("Cobranca lote - contrato %d sem e-mail cadastrado", contratoId);
                return processarEmails(etapaId, mensagemId, assunto, mensagem, ids, index + 1,
                        new Resumo(acc.processados(), acc.semEmail() + 1, acc.notificacoes(), assunto),
                        canalEmail, canalMobile, canalSistema);
            }
            return pool.preparedQuery(SQL_INCREMENTAR_EMAIL).execute(Tuple.of(contratoId))
                    .chain(v -> pool.preparedQuery(SQL_INSERIR_EMAIL).execute(Tuple.of(contratoId, dest.email(), assunto, mensagem, mensagemId, etapaId)))
                    .chain(v -> publicarNotificacao(contratoId, dest, assunto, mensagem, canalEmail, canalMobile, canalSistema))
                    .chain(publicado -> processarEmails(etapaId, mensagemId, assunto, mensagem, ids, index + 1,
                            new Resumo(acc.processados() + 1, acc.semEmail(), acc.notificacoes() + publicado,
                                    assunto),
                            canalEmail, canalMobile, canalSistema));
        });
    }

    /**
     * Publica a cobrança do contrato nos tópicos do notificacoes-service, nos canais
     * solicitados (e-mail no endereço do contrato; push mobile/web no username quando
     * houver login). Retorna 1 quando ao menos um canal foi publicado, 0 caso contrário.
     */
    private Uni<Integer> publicarNotificacao(Long contratoId, Destinatario dest, String assunto, String mensagem,
                                             boolean canalEmail, boolean canalMobile, boolean canalSistema) {
        if (!canalEmail && !canalMobile && !canalSistema) {
            return Uni.createFrom().item(0);
        }
        boolean push = (canalMobile || canalSistema) && dest.username() != null && !dest.username().isBlank();
        boolean email = canalEmail && dest.email() != null && !dest.email().isBlank();
        if (!push && !email) {
            return Uni.createFrom().item(0);
        }
        NotificacaoMessage msg = new NotificacaoMessage(null, dest.username(), assunto, mensagem,
                "COBRANCA", null, canalSistema && push, canalMobile && push, email, dest.email());
        return notificacaoProducer.publicar(msg)
                .map(v -> 1)
                .onFailure().recoverWithItem(e -> {
                    LOG.warnf("Cobranca lote - contrato %d: falha ao publicar no notificacoes: %s",
                            contratoId, e.getMessage());
                    return 0;
                });
    }

    public Uni<ResultadoLigacao> iniciarLigacao(LoteCobrancaLigacaoRequest req) {
        if (req.etapasCobrancaId() == null) {
            return Uni.createFrom().failure(new BadRequestException("etapasCobrancaId é obrigatório"));
        }
        List<Long> ids = req.contratoIds() == null ? List.of() : req.contratoIds();
        return processarLigacoes(req.etapasCobrancaId(), ids, 0, 0);
    }

    private Uni<ResultadoLigacao> processarLigacoes(Long etapaId, List<Long> ids, int index, int acc) {
        if (index >= ids.size()) {
            return Uni.createFrom().item(new ResultadoLigacao(acc));
        }
        Long contratoId = ids.get(index);
        return pool.preparedQuery(SQL_INSERIR_LIGACAO).execute(Tuple.of(contratoId, etapaId))
                .map(lig -> lig.iterator().next().getLong("id"))
                .chain(ligacaoId -> pool.preparedQuery(SQL_INCREMENTAR_LIGACAO).execute(Tuple.of(ligacaoId, contratoId)))
                .replaceWith(acc + 1)
                .onItem().transformToUni(total -> processarLigacoes(etapaId, ids, index + 1, total));
    }

    private Uni<Destinatario> resolverDestinatario(Long contratoId) {
        return pool.preparedQuery(SQL_EMAIL_CONTRATO).execute(Tuple.of(contratoId))
                .map(rows -> {
                    if (rows.size() == 0) {
                        return new Destinatario(null, null);
                    }
                    Row row = rows.iterator().next();
                    return new Destinatario(row.getString("email"), row.getString("username"));
                });
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
