package br.com.sol7.olimpio.educacao.lote.service;

import br.com.sol7.olimpio.educacao.lote.dto.LoteNapEmailRequest;
import br.com.sol7.olimpio.educacao.lote.dto.LoteNapLigacaoRequest;
import br.com.sol7.olimpio.educacao.lote.dto.LoteNapResponse;
import br.com.sol7.olimpio.educacao.lote.dto.LoteNapResponse.Aluno;
import br.com.sol7.olimpio.educacao.lote.dto.LoteNapResponse.ModeloEmail;
import br.com.sol7.olimpio.educacao.lote.dto.LoteNapResponse.Resumo;
import br.com.sol7.olimpio.educacao.lote.dto.LoteNapResponse.ResultadoLigacao;
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
 * Fluxo de lote da NAP (portado das acoes legadas preparaEnvioEmailLote e
 * iniciaLigacaoLoteContinua do NAPController). Executa SQL nativo contra o banco
 * olimpio, seguindo o mesmo FROM/joins/caseCor usado em rotinaEmailNap().
 */
@ApplicationScoped
public class LoteNapService {

    private static final Logger LOG = Logger.getLogger(LoteNapService.class);

    @Inject
    Pool pool;

    private static final String SQL_MODELOS_EMAIL =
            "select m.id, m.descricao, m.assunto, m.mensagem from bas_mensagem m " +
                    "where m.fl_email = true and m.tipo = 'NAP' order by m.descricao";

    private static final String SQL_MODELO_POR_ID =
            "select m.assunto, m.mensagem from bas_mensagem m where m.id = $1";

    private static final String SQL_ETAPA =
            "select et.fl_customizado, et.campo_customizado from edc_nap_etapas et where et.id = $1";

    private static final String SQL_EMAIL_CONTRATO =
            "select COALESCE(responsavel.email, pessoa.email) as email " +
                    "from edc_contrato contrato " +
                    "left join bas_pessoa responsavel on (responsavel.id = contrato.id_responsavel) " +
                    "left join bas_pessoa pessoa on (pessoa.id = contrato.id_pessoa) " +
                    "where contrato.id = $1";

    private static final String SQL_BUSCAR_NAP =
            "select nap.id from edc_nap nap where nap.id_contrato = $1 and nap.id_nap_etapas = $2 limit 1";

    private static final String SQL_CRIAR_NAP =
            "insert into edc_nap (id_contrato, id_nap_etapas, qtde_ligacao, qtde_email, qtde_carta, qtde_sms) " +
                    "values ($1, $2, 0, 0, 0, 0) returning id";

    private static final String SQL_INCREMENTAR_EMAIL =
            "update edc_nap set qtde_email = COALESCE(qtde_email, 0) + 1 where id = $1";

    private static final String SQL_INCREMENTAR_LIGACAO =
            "update edc_nap set id_nap_ligacao = $1, qtde_ligacao = COALESCE(qtde_ligacao, 0) + 1 where id = $2";

    private static final String SQL_INSERIR_EMAIL =
            "insert into edc_nap_email (data, id_contrato, email, assunto, mensagem, id_mensagem, id_nap_etapa) " +
                    "values (now(), $1, $2, $3, $4, $5, $6)";

    private static final String SQL_INSERIR_LIGACAO =
            "insert into edc_nap_ligacao (id_contrato, id_nap_etapas, data_inicial, ativo) " +
                    "values ($1, $2, now(), true) returning id";

    // FROM identico ao legado (NAPEmailService.rotinaEmailNap).
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

    public Uni<LoteNapResponse.ResumoAlunos> alunos(Long etapasNapId, String situacao, Integer tipo, String q) {
        if (etapasNapId == null) {
            return Uni.createFrom().failure(new BadRequestException("etapasNapId é obrigatório"));
        }
        String s = (situacao == null || situacao.isBlank()) ? "DISPONIVEL" : situacao;
        int t = (tipo == null) ? 0 : tipo;
        String botao = botaoPorTipo(t);
        return pool.preparedQuery(SQL_ETAPA).execute(Tuple.of(etapasNapId))
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
                        where = " where (compromisso.id is null or (compromisso.id is not null and compromisso.ativo = true))" +
                                " and (etapa.id = " + etapasNapId + ")";
                    }
                    StringBuilder sql = new StringBuilder(SELECT_ALUNOS).append(FROM)
                            .append(INNER_BASE).append(INNER_EXTRA).append(where)
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
                                return new LoteNapResponse.ResumoAlunos(alunos, alunos.size());
                            });
                });
    }

    public Uni<Resumo> enviarEmail(LoteNapEmailRequest req) {
        if (req.etapasNapId() == null || req.mensagemId() == null) {
            return Uni.createFrom().failure(new BadRequestException("etapasNapId e mensagemId são obrigatórios"));
        }
        List<Long> ids = req.contratoIds() == null ? List.of() : req.contratoIds();
        return pool.preparedQuery(SQL_MODELO_POR_ID).execute(Tuple.of(req.mensagemId()))
                .onItem().transformToUni(rows -> {
                    if (rows.size() == 0) {
                        return Uni.createFrom().failure(new NotFoundException("Modelo de email não encontrado"));
                    }
                    Row row = rows.iterator().next();
                    String assunto = row.getString("assunto");
                    String mensagem = row.getString("mensagem");
                    return processarEmails(req.etapasNapId(), req.mensagemId(), assunto, mensagem, ids, 0,
                            new Resumo(0, 0, assunto));
                });
    }

    private Uni<Resumo> processarEmails(Long etapaId, Long mensagemId, String assunto, String mensagem,
                                        List<Long> ids, int index, Resumo acc) {
        if (index >= ids.size()) {
            return Uni.createFrom().item(acc);
        }
        Long contratoId = ids.get(index);
        return resolverEmail(contratoId).chain(email -> {
            if (email == null || email.isBlank()) {
                LOG.infof("NAP lote - contrato %d sem e-mail cadastrado", contratoId);
                return processarEmails(etapaId, mensagemId, assunto, mensagem, ids, index + 1,
                        new Resumo(acc.processados(), acc.semEmail() + 1, assunto));
            }
            return buscarOuCriarNap(contratoId, etapaId)
                    .chain(napId -> pool.preparedQuery(SQL_INCREMENTAR_EMAIL).execute(Tuple.of(napId)))
                    .chain(v -> pool.preparedQuery(SQL_INSERIR_EMAIL).execute(Tuple.of(contratoId, email, assunto, mensagem, mensagemId, etapaId)))
                    .chain(v -> processarEmails(etapaId, mensagemId, assunto, mensagem, ids, index + 1,
                            new Resumo(acc.processados() + 1, acc.semEmail(), assunto)));
        });
    }

    public Uni<ResultadoLigacao> iniciarLigacao(LoteNapLigacaoRequest req) {
        if (req.etapasNapId() == null) {
            return Uni.createFrom().failure(new BadRequestException("etapasNapId é obrigatório"));
        }
        List<Long> ids = req.contratoIds() == null ? List.of() : req.contratoIds();
        return processarLigacoes(req.etapasNapId(), ids, 0, 0);
    }

    private Uni<ResultadoLigacao> processarLigacoes(Long etapaId, List<Long> ids, int index, int acc) {
        if (index >= ids.size()) {
            return Uni.createFrom().item(new ResultadoLigacao(acc));
        }
        Long contratoId = ids.get(index);
        return buscarOuCriarNap(contratoId, etapaId)
                .chain(napId -> pool.preparedQuery(SQL_INSERIR_LIGACAO).execute(Tuple.of(contratoId, etapaId))
                        .map(lig -> new Long[]{napId, lig.iterator().next().getLong("id")}))
                .chain(pair -> pool.preparedQuery(SQL_INCREMENTAR_LIGACAO).execute(Tuple.of(pair[1], pair[0]))
                        .replaceWith(new ResultadoLigacao(acc + 1)))
                .onItem().transformToUni(res -> processarLigacoes(etapaId, ids, index + 1, res.processados()));
    }

    private Uni<String> resolverEmail(Long contratoId) {
        return pool.preparedQuery(SQL_EMAIL_CONTRATO).execute(Tuple.of(contratoId))
                .map(rows -> rows.size() == 0 ? null : rows.iterator().next().getString("email"));
    }

    private Uni<Long> buscarOuCriarNap(Long contratoId, Long etapaId) {
        return pool.preparedQuery(SQL_BUSCAR_NAP).execute(Tuple.of(contratoId, etapaId))
                .onItem().transformToUni(rows -> {
                    if (rows.size() > 0) {
                        return Uni.createFrom().item(rows.iterator().next().getLong("id"));
                    }
                    return pool.preparedQuery(SQL_CRIAR_NAP).execute(Tuple.of(contratoId, etapaId))
                            .map(created -> created.iterator().next().getLong("id"));
                });
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

    // Portado de NAPEmailService.caseCor(String botao, SituacaoNap situacaoNap).
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
