package br.com.sol7.olimpio.schedule.maintenance;

import io.smallrye.mutiny.Uni;
import io.vertx.mutiny.sqlclient.Pool;
import io.vertx.mutiny.sqlclient.Row;
import io.vertx.mutiny.sqlclient.Tuple;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.eclipse.microprofile.config.inject.ConfigProperty;
import org.jboss.logging.Logger;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import io.quarkus.mailer.reactive.ReactiveMailer;
import io.quarkus.mailer.Mail;

/**
 * Rotinas do dominio "empresa" migradas de VagaService (criarEntrevistas, enviarVagasAlunos).
 * Acessa as tabelas cur_vaga/cur_entrevista_vaga_empresa e a configuracao bas_config
 * (ID_VAGA_ALUNO) diretamente pelo datasource reativo "empresa-db" - sem chamada REST para o
 * microsservico curriculo.
 * <p>
 * Observacao: o envio efetivo de e-mail nao foi portado (nao ha infra de e-mail neste backend);
 * cada candidato e registrado em log e o cursor ID_VAGA_ALUNO e avancado para o proximo lote.
 */
@ApplicationScoped
public class EmpresaMaintenanceService {

    private static final Logger LOG = Logger.getLogger(EmpresaMaintenanceService.class);

    @Inject
    Pool pool;

    @Inject
    ReactiveMailer mailer;

    @ConfigProperty(name = "schedule.email.enabled", defaultValue = "true")
    boolean emailEnabled;

    // Migrado de VagaService.criarEntrevistas() - desativa vagas expiradas e cria as entrevistas
    // dos usuarios alcancados pelas associacoes (perfil/unidade/componente/oferecimento/
    // grupo/curriculo/empresa/usuario), puxando a data_final da vaga.
    private static final String SQL_DESATIVAR_VAGAS_EXPIRADAS =
            "UPDATE cur_vaga SET fl_ativo = false WHERE fl_ativo = true AND data_fim < current_date";

    private static final String SQL_BUSCAR_VAGAS_ABERTAS =
            "SELECT id FROM cur_vaga WHERE fl_ativo = true ORDER BY id";

    private static final String SQL_INSERIR_ENTREVISTAS = """
    INSERT INTO

    cur_entrevista_vaga_empresa(id_usuario, id_vaga, data_final, fl_email_enviado_aluno, fl_email_enviado_empresa)

    SELECT DISTINCT
    u.id,v.id,v.data_fim,false,false
    FROM cur_vaga
    v
    JOIN bas_usuario
    u ON
    u.fl_ativo =true

    AND(
            EXISTS(SELECT 1 FROM cur_vaga_usuario vus WHERE vus.id_vaga=v.id AND vus.id_usuario=u.id)

    OR EXISTS(SELECT 1 FROM cur_vaga_perfil vp JOIN bas_usuario_perfil up ON up.id_perfil=vp.id_perfil WHERE vp.id_vaga=v.id AND up.id_usuario=u.id)

    OR EXISTS(SELECT 1 FROM cur_vaga_unidade vu JOIN bas_usuario_unidade uu ON uu.id_unidade=vu.id_unidade WHERE vu.id_vaga=v.id AND uu.id_usuario=u.id)

    OR EXISTS(SELECT 1 FROM cur_vaga_empresa vemp JOIN cur_empresa cemp ON cemp.id=vemp.id_empresa WHERE vemp.id_vaga=v.id AND cemp.id_pessoa=u.id_pessoa)

    OR EXISTS(SELECT 1 FROM cur_vaga_oferecimento vo JOIN edc_oferecimento_componente_curricular offc ON offc.id=vo.id_oferecimento JOIN edc_matricula m ON m.id_oferecimento_componente_curricular=offc.id JOIN edc_contrato c ON c.id=m.id_contrato WHERE vo.id_vaga=v.id AND c.id_pessoa=u.id_pessoa)

    OR EXISTS(SELECT 1 FROM cur_vaga_componente vcomp JOIN edc_componente_curricular comp ON comp.id=vcomp.id_componente JOIN edc_oferecimento_componente_curricular offcomp ON offcomp.id_componente_curricular=comp.id JOIN edc_matricula m2 ON m2.id_oferecimento_componente_curricular=offcomp.id JOIN edc_contrato c2 ON c2.id=m2.id_contrato WHERE vcomp.id_vaga=v.id AND c2.id_pessoa=u.id_pessoa)

    OR EXISTS(SELECT 1 FROM cur_vaga_curriculo vcur JOIN edc_contrato c3 ON c3.id_curso=vcur.id_curriculo WHERE vcur.id_vaga=v.id AND c3.id_pessoa=u.id_pessoa)

    OR EXISTS(SELECT 1 FROM cur_vaga_grupo vg JOIN edc_grupo gr ON gr.id=vg.id_grupo JOIN edc_oferecimento_componente_curricular offgr ON offgr.id_grupo=gr.id JOIN edc_curriculo currgr ON currgr.id=offgr.id_curso JOIN edc_contrato c4 ON c4.id_curso=currgr.id WHERE vg.id_vaga=v.id AND c4.id_pessoa=u.id_pessoa)
            )
    WHERE v.id =$1
    AND v.fl_ativo =true
    AND NOT

    EXISTS(SELECT 1 FROM cur_entrevista_vaga_empresa ceve WHERE ceve.id_vaga=v.id)
            """;

    public Uni<Map<String, Object>> criarEntrevistas() {
        return pool.query(SQL_DESATIVAR_VAGAS_EXPIRADAS).execute()
                .chain(r -> pool.query(SQL_BUSCAR_VAGAS_ABERTAS).execute())
                .map(rows -> {
                    List<Long> vagaIds = new ArrayList<>();
                    for (Row row : rows) {
                        vagaIds.add(row.getLong("id"));
                    }
                    return vagaIds;
                })
                .chain(vagaIds -> {
                    Uni<Long> chain = Uni.createFrom().item(0L);
                    for (Long vagaId : vagaIds) {
                        chain = chain.chain(created -> pool.preparedQuery(SQL_INSERIR_ENTREVISTAS)
                                .execute(Tuple.of(vagaId))
                                .map(rs -> created + rs.rowCount()));
                    }
                    return chain.map(created -> {
                        LOG.infof("criarEntrevistas: %d vaga(s) processada(s), %d entrevista(s) criada(s)",
                                vagaIds.size(), created);
                        return Map.<String, Object>of("vagasProcessadas", vagaIds.size(), "entrevistasCriadas", created);
                    });
                });
    }

    // Migrado de VagaService.enviarVagasAlunos() - processa lotes de ate 100 entrevistas sem
    // envio, avancando o cursor bas_config ID_VAGA_ALUNO a cada lote (evita reprocessamento).
    private static final String SQL_BUSCAR_CANDIDATOS = """
    SELECT a.id AS id,u.login AS login,p.email AS email,v.nome AS nome,v.titulo_email AS titulo_email
    FROM cur_entrevista_vaga_empresa
    a
    JOIN bas_usuario
    u ON
    u.id =a.id_usuario
    JOIN bas_pessoa
    p ON
    p.id =u.id_pessoa
    JOIN cur_vaga
    v ON
    v.id =a.id_vaga
    WHERE a.fl_email_enviado_aluno =false
    AND a.id >$1
    ORDER BY
    a.id
    LIMIT 100
            """;

    private record Candidato(Long id, String login, String email, String vagaNome, String tituloEmail) {}

    public Uni<Map<String, Object>> enviarVagasAlunos() {
        return buscarConfigLong("ID_VAGA_ALUNO", 0L)
                .flatMap(cursor -> processarLote(0, 0, cursor));
    }

    private Uni<Long> buscarConfigLong(String chave, long defaultValue) {
        return pool.preparedQuery("SELECT valor FROM bas_config WHERE chave = $1")
                .execute(Tuple.of(chave))
                .map(rows -> {
                    if (!rows.iterator().hasNext()) {
                        return defaultValue;
                    }
                    try {
                        return Long.parseLong(rows.iterator().next().getString("valor"));
                    } catch (NumberFormatException e) {
                        return defaultValue;
                    }
                });
    }

    private Uni<Map<String, Object>> processarLote(int total, int round, long ultimoId) {
        return pool.preparedQuery(SQL_BUSCAR_CANDIDATOS).execute(Tuple.of(ultimoId))
                .map(rows -> {
                    List<Candidato> candidatos = new ArrayList<>();
                    for (Row row : rows) {
                        candidatos.add(new Candidato(
                                row.getLong("id"), row.getString("login"), row.getString("email"),
                                row.getString("nome"), row.getString("titulo_email")
                        ));
                    }
                    return candidatos;
                })
                .chain(candidatos -> {
                    if (candidatos.isEmpty()) {
                        LOG.infof("enviarVagasAlunos: finalizado apos %d lote(s), %d candidato(s)", round, total);
                        return Uni.createFrom().item(Map.<String, Object>of("candidatos", total, "lotes", round));
                    }
                    long lastId = candidatos.stream()
                            .map(Candidato::id).max(Long::compare).orElse(ultimoId);
                    for (Candidato cand : candidatos) {
                        String email = cand.email();
                        String vagaNome = cand.vagaNome();
                        String tituloEmail = cand.tituloEmail();
                        String login = cand.login();
                        
                        if (emailEnabled && email != null && !email.isBlank()) {
                            String assunto = tituloEmail != null ? tituloEmail : "Nova vaga disponível: " + vagaNome;
                            String corpoHtml = String.format("""
                                <html>
                                <body>
                                    <p>Olá %s,</p>
                                    <p>Uma nova vaga está disponível: <strong>%s</strong></p>
                                    <p>Por favor, acesse o sistema para mais detalhes.</p>
                                    <p>Atenciosamente,<br>Equipe OlimpIO</p>
                                </body>
                                </html>
                                """, login, vagaNome);
                            
                            mailer.send(Mail.withHtml(email, assunto, corpoHtml))
                                    .onItem().invoke(() -> LOG.infof("E-mail de vaga enviado para %s <%s>", login, email))
                                    .onFailure().invoke(e -> LOG.errorf(e, "Falha ao enviar e-mail de vaga para %s <%s>", login, email))
                                    .subscribe().with(v -> {}); // Fire and forget
                        } else {
                            LOG.infof("Vaga %s: envio de e-mail para [%s] <%s> (titulo=%s) - e-mail desabilitado ou destinatário vazio",
                                    vagaNome, login, email, tituloEmail);
                        }
                    }
                    return atualizarConfig("ID_VAGA_ALUNO", lastId)
                            .chain(v -> processarLote(total + candidatos.size(), round + 1, lastId));
                });
    }

    // bas_config.chave nao tem constraint UNIQUE, entao nao usa ON CONFLICT: tenta UPDATE e,
    // se nao atualizar nenhuma linha, faz INSERT.
    private Uni<Void> atualizarConfig(String chave, long valor) {
        String novoValor = String.valueOf(valor);
        return pool.preparedQuery("UPDATE bas_config SET valor = $2 WHERE chave = $1")
                .execute(Tuple.of(chave, novoValor))
                .chain(rs -> {
                    if (rs.rowCount() > 0) {
                        return Uni.createFrom().voidItem();
                    }
                    return pool.preparedQuery("INSERT INTO bas_config (chave, valor) VALUES ($1, $2)")
                            .execute(Tuple.of(chave, novoValor))
                            .replaceWithVoid();
                });
    }
}
