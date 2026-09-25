package br.com.sol7.olimpio.curriculo.vaga;

import br.com.sol7.olimpio.shared.PagedResponse;
import br.com.sol7.olimpio.shared.RefOption;
import br.com.sol7.olimpio.shared.RefService;
import br.com.sol7.olimpio.shared.TupleHelper;
import io.quarkus.hibernate.reactive.panache.Panache;
import io.quarkus.hibernate.reactive.panache.common.WithTransaction;
import io.quarkus.mailer.Mail;
import io.quarkus.mailer.reactive.ReactiveMailer;
import io.smallrye.mutiny.Uni;
import io.smallrye.mutiny.unchecked.Unchecked;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.persistence.Tuple;
import jakarta.ws.rs.NotFoundException;
import org.eclipse.microprofile.config.inject.ConfigProperty;
import org.jboss.logging.Logger;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@ApplicationScoped
@WithTransaction
public class VagaService {

    private static final Logger LOG = Logger.getLogger(VagaService.class);

    @Inject
    ReactiveMailer mailer;

    @ConfigProperty(name = "curriculo.email.enabled", defaultValue = "true")
    boolean emailEnabled;
    VagaRepository repository;

    @Inject
    RefService refService;

    @Inject
    VagaPerfilRepository perfilRepository;

    @Inject
    VagaUnidadeRepository unidadeRepository;

    @Inject
    VagaComponenteRepository componenteRepository;

    @Inject
    VagaOferecimentoRepository oferecimentoRepository;

    @Inject
    VagaGrupoRepository grupoRepository;

    @Inject
    VagaCurriculoRepository curriculoRepository;

    @Inject
    VagaEmpresaRepository empresaRepository;

    @Inject
    VagaUsuarioRepository usuarioRepository;

    public Uni<List<VagaResponse>> list() {
        return repository.listAll().onItem().transformToUni(items -> toResponses(items));
    }

    public Uni<PagedResponse<VagaResponse>> paged(int page, int size) {
        int p = Math.max(0, page);
        int s = switch (size) {
            case 10,20, 50, 100 ->size;
            default ->10;
        } ;
        return repository.findAll().page(p, s).list()
                .onItem().transformToUni(items -> toResponses(items)
                        .chain(responses -> repository.count()
                                .map(count -> new PagedResponse<>(responses, count, p, s))));
    }

    private Uni<List<VagaResponse>> toResponses(List<Vaga> items) {
        if (items.isEmpty()) {
            return Uni.createFrom().item(List.of());
        }
        return Uni.createFrom().item(new ArrayList<VagaResponse>())
                .chain(acc -> {
                    Uni<List<VagaResponse>> chain = Uni.createFrom().item(acc);
                    for (Vaga item : items) {
                        chain = chain.chain(list -> toResponse(item).map(list::add).replaceWith(list));
                    }
                    return chain;
                });
    }

    public Uni<VagaResponse> find(Long id) {
        return repository.findById(id)
                .onItem().ifNull().failWith(() -> new NotFoundException("Vaga não encontrada: " + id))
                .onItem().transformToUni(this::toResponse);
    }

    public Uni<VagaResponse> create(VagaRequest request) {
        Vaga vaga = new Vaga();
        apply(vaga, request);
        return repository.persist(vaga)
                .chain(v -> syncAssociations(vaga.id, request))
                .onItem().transformToUni(v -> toResponse(vaga));
    }

    public Uni<VagaResponse> update(Long id, VagaRequest request) {
        return repository.findById(id)
                .onItem().ifNull().failWith(() -> new NotFoundException("Vaga não encontrada: " + id))
                .chain(vaga -> {
                    apply(vaga, request);
                    return repository.persistAndFlush(vaga)
                            .chain(v -> syncAssociations(vaga.id, request))
                            .onItem().transformToUni(v -> toResponse(vaga));
                });
    }

    public Uni<Void> delete(Long id) {
        return repository.findById(id)
                .onItem().ifNull().failWith(() -> new NotFoundException("Vaga não encontrada: " + id))
                .chain(vaga -> syncAssociations(vaga.id, new VagaRequest(
                        null, null, null, null, null, null, null, null, null, null, null, null,
                        null, null, null, null, null, null, null, null))
                        .chain(v -> repository.delete(vaga)));
    }

    public Uni<Map<String, List<RefOption>>> refs() {
        return refService.resolve(Map.of(
                "id_usuario",
                "SELECT id, login FROM bas_usuario ORDER BY 2 LIMIT 200",
                "perfis",
                "SELECT id, descricao FROM bas_perfil ORDER BY 2 LIMIT 200",
                "unidades",
                "SELECT id, COALESCE(sucinto, nome_fantasia, razao_social) FROM bas_unidade ORDER BY 2 LIMIT 200",
                "componentes",
                "SELECT id, COALESCE(sucinto, descricao) FROM edc_componente_curricular ORDER BY 2 LIMIT 200",
                "oferecimentos",
                "SELECT id, CAST(id AS TEXT) FROM edc_oferecimento_componente_curricular ORDER BY 1 LIMIT 200",
                "grupos",
                "SELECT id, nome FROM edc_grupo ORDER BY 2 LIMIT 200",
                "curriculos",
                "SELECT id, COALESCE(sucinto, descricao) FROM edc_curriculo ORDER BY 2 LIMIT 200",
                "empresas",
                "SELECT p.id, COALESCE(pf.nome, pj.nome_fantasia, pj.razao_social, p.email) " +
                        "FROM cur_empresa e " +
                        "JOIN bas_pessoa p ON p.id = e.id_pessoa " +
                        "LEFT JOIN bas_pessoa_fisica pf ON pf.id_pessoa = p.id " +
                        "LEFT JOIN bas_pessoa_juridica pj ON pj.id_pessoa = p.id " +
                        "ORDER BY 2 LIMIT 200",
                "usuarios",
                "SELECT id, login FROM bas_usuario ORDER BY 2 LIMIT 200"));
    }

    /**
     * Portado de VagaService.criarEntrevistas().
     * Desativa vagas expiradas e, para cada vaga ativa, cria as entrevistas para os
     * usuarios alcancados pelas associacoes (perfil/unidade/componente/oferecimento/
     * grupo/curriculo/empresa/usuario), puxando a data_final da vaga.
     */
    public Uni<Map<String, Object>> criarEntrevistas() {
        String INSERT_SQL = """
        INSERT INTO
        cur_entrevista_vaga_empresa(id_usuario, id_vaga, data_final, fl_email_enviado_aluno, fl_email_enviado_empresa)
        SELECT DISTINCT u.id, v.id, v.data_fim, false, false
        FROM cur_vaga v
        JOIN bas_usuario u ON u.fl_ativo = true AND(
                EXISTS(SELECT 1 FROM cur_vaga_usuario vus WHERE vus.id_vaga = v.id AND vus.id_usuario = u.id)
                OR EXISTS(SELECT 1 FROM cur_vaga_perfil vp JOIN bas_usuario_perfil up ON up.id_perfil = vp.id_perfil WHERE vp.id_vaga = v.id AND up.id_usuario = u.id)
                OR EXISTS(SELECT 1 FROM cur_vaga_unidade vu JOIN bas_usuario_unidade uu ON uu.id_unidade = vu.id_unidade WHERE vu.id_vaga = v.id AND uu.id_usuario = u.id)
                OR EXISTS(SELECT 1 FROM cur_vaga_empresa vemp JOIN cur_empresa cemp ON cemp.id = vemp.id_empresa WHERE vemp.id_vaga = v.id AND cemp.id_pessoa = u.id_pessoa)
                OR EXISTS(SELECT 1 FROM cur_vaga_oferecimento vo JOIN edc_oferecimento_componente_curricular offc ON offc.id = vo.id_oferecimento JOIN edc_matricula m ON m.id_oferecimento_componente_curricular = offc.id JOIN edc_contrato c ON c.id = m.id_contrato WHERE vo.id_vaga = v.id AND c.id_pessoa = u.id_pessoa)
                OR EXISTS(SELECT 1 FROM cur_vaga_componente vcomp JOIN edc_componente_curricular comp ON comp.id = vcomp.id_componente JOIN edc_oferecimento_componente_curricular offcomp ON offcomp.id_componente_curricular = comp.id JOIN edc_matricula m2 ON m2.id_oferecimento_componente_curricular = offcomp.id JOIN edc_contrato c2 ON c2.id = m2.id_contrato WHERE vcomp.id_vaga = v.id AND c2.id_pessoa = u.id_pessoa)
                OR EXISTS(SELECT 1 FROM cur_vaga_grupo vg JOIN edc_grupo gr ON gr.id = vg.id_grupo JOIN edc_oferecimento_componente_curricular offgr ON offgr.id_grupo = gr.id JOIN edc_curriculo currgr ON currgr.id = offgr.id_curso JOIN edc_contrato c4 ON c4.id_course = currgr.id WHERE vg.id_vaga = v.id AND c4.id_pessoa = u.id_pessoa)
        )
        WHERE v.id = ?1
        AND v.fl_ativo = true
        AND NOT EXISTS(SELECT 1 FROM cur_entrevista_vaga_empresa ceve WHERE ceve.id_vaga = v.id)
        """;

        return Panache.getSession()
                .chain(session -> session.createNativeQuery(
                        "UPDATE cur_vaga SET fl_ativo = false WHERE fl_ativo = true AND data_fim < current_date")
                        .executeUpdate())
                .chain(rows -> Panache.getSession()
                        .chain(session -> session.createNativeQuery(
                                "SELECT id FROM cur_vaga WHERE fl_ativo = true ORDER BY id")
                                .getResultList())
                        .chain(Unchecked.function(ids -> {
                            List<Long> vagaIds = ids.stream().map(v -> ((Number) v).longValue()).toList();
                            Uni<Long> chain = Uni.createFrom().item(0L);
                            for (Long vagaId : vagaIds) {
                                chain = chain.chain(created -> Panache.getSession()
                                        .chain(session -> session.createNativeQuery(INSERT_SQL)
                                                .setParameter(1, vagaId)
                                                .executeUpdate())
                                        .map(createdCount -> created + createdCount));
                            }
                            return chain.map(Unchecked.function(created -> {
                                LOG.infof("criarEntrevistas: %d vaga(s) processada(s), %d entrevista(s) criada(s)",
                                        vagaIds.size(), created);
                                return Map.<String, Object>of("vagasProcessadas", vagaIds.size(), "entrevistasCriadas", created);
                            }));
                        })));
    }

    /**
     * Portado de VagaService.enviarVagasAlunos().
     * Processa lotes de ate 100 entrevistas sem envio, avancando a configuracao
     * ID_VAGA_ALUNO. O envio efetivo de e-mail nao foi portado (nao ha infra de
     * e-mail no novo backend): cada candidato e registrado em log e o cursor e
     * avancado para evitar reprocessamento no proximo lote.
     */
    public Uni<Map<String, Object>> enviarVagasAlunos() {
        return processBatch(0, 0);
    }

    private Uni<Map<String, Object>> processBatch(int total, int round) {
        String SELECT_SQL = """
        SELECT a.id, u.login, p.email, v.nome, v.titulo_email
        FROM cur_entrevista_vaga_empresa a
        JOIN bas_usuario u ON u.id = a.id_usuario
        JOIN bas_pessoa p ON p.id = u.id_pessoa
        JOIN cur_vaga v ON v.id = a.id_vaga
        WHERE a.fl_email_enviado_aluno = false
        LIMIT 100
        """;
        return Panache.getSession()
                .chain(session -> session.createNativeQuery(SELECT_SQL, Tuple.class).getResultList())
                .chain(Unchecked.function(rows -> {
                    if (rows.isEmpty()) {
                        LOG.infof("enviarVagasAlunos: finalizado apos %d lote(s), %d candidato(s)", round, total);
                        return Uni.createFrom().item(Map.<String, Object>of("candidatos", total, "lotes", round));
                    }
                    List<Tuple> lista = rows;
                    long lastId = lista.stream().map(r -> TupleHelper.getLong(r, "id")).max(Long::compare).orElse(0L);
                    for (Tuple row : lista) {
                        String vagaNome = TupleHelper.getString(row, "nome");
                        String login = TupleHelper.getString(row, "login");
                        String email = TupleHelper.getString(row, "email");
                        String tituloEmail = TupleHelper.getString(row, "titulo_email");

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
                                    .subscribe().with(v -> {});
                        } else {
                            LOG.infof("Vaga %s: envio de e-mail para [%s] <%s> (titulo=%s) - e-mail desabilitado ou destinatário vazio",
                                    vagaNome, login, email, tituloEmail);
                        }
                    }
                    return updateConfig("ID_VAGA_ALUNO", lastId)
                            .chain(v -> Panache.getSession()
                                    .chain(session -> session.createNativeQuery(
                                            "SELECT count(*) FROM cur_entrevista_vaga_empresa WHERE fl_email_enviado_aluno = false AND id > "
                                                    + lastId)
                                            .getSingleResult())
                                    .chain(Unchecked.function(remaining -> {
                                        long rest = ((Number) remaining).longValue();
                                        if (rest > 0) {
                                            return processBatch(total + lista.size(), round + 1);
                                        }
                                        LOG.infof("enviarVagasAlunos: finalizado apos %d lote(s), %d candidato(s)",
                                                round + 1, total + lista.size());
                                        return Uni.createFrom().item(Map.<String, Object>of("candidatos", total + lista.size(), "lotes", round + 1));
                                    })));
                }));
    }

    private Uni<Void> updateConfig(String chave, long valor) {
        return Panache.getSession()
                .chain(session -> session.createNativeQuery(
                        "INSERT INTO bas_config (chave, valor) VALUES (?1, ?2) " +
                                "ON CONFLICT (chave) DO UPDATE SET valor = EXCLUDED.valor")
                        .setParameter(1, chave)
                        .setParameter(2, String.valueOf(valor))
                        .executeUpdate())
                .replaceWithVoid();
    }

    private Uni<Void> syncAssociations(Long vagaId, VagaRequest request) {
        return VagaPerfil.delete("vagaId", vagaId)
                .chain(v -> VagaUnidade.delete("vagaId", vagaId))
                .chain(v -> VagaComponente.delete("vagaId", vagaId))
                .chain(v -> VagaOferecimento.delete("vagaId", vagaId))
                .chain(v -> VagaGrupo.delete("vagaId", vagaId))
                .chain(v -> VagaCurriculo.delete("vagaId", vagaId))
                .chain(v -> VagaEmpresa.delete("vagaId", vagaId))
                .chain(v -> VagaUsuario.delete("vagaId", vagaId))
                .chain(v -> insertAssociations(vagaId, request));
    }

    private Uni<Void> insertAssociations(Long vagaId, VagaRequest request) {
        List<VagaPerfil> perfis = new ArrayList<>();
        List<VagaUnidade> unidades = new ArrayList<>();
        List<VagaComponente> componentes = new ArrayList<>();
        List<VagaOferecimento> oferecimentos = new ArrayList<>();
        List<VagaGrupo> grupos = new ArrayList<>();
        List<VagaCurriculo> curriculos = new ArrayList<>();
        List<VagaEmpresa> empresas = new ArrayList<>();
        List<VagaUsuario> usuarios = new ArrayList<>();
        if (request.perfis() != null) {
            request.perfis().forEach(id -> {
                VagaPerfil e = new VagaPerfil();
                e.vagaId = vagaId;
                e.perfilId = id;
                perfis.add(e);
            });
        }
        if (request.unidades() != null) {
            request.unidades().forEach(id -> {
                VagaUnidade e = new VagaUnidade();
                e.vagaId = vagaId;
                e.unidadeId = id;
                unidades.add(e);
            });
        }
        if (request.componentes() != null) {
            request.componentes().forEach(id -> {
                VagaComponente e = new VagaComponente();
                e.vagaId = vagaId;
                e.componenteId = id;
                componentes.add(e);
            });
        }
        if (request.oferecimentos() != null) {
            request.oferecimentos().forEach(id -> {
                VagaOferecimento e = new VagaOferecimento();
                e.vagaId = vagaId;
                e.oferecimentoId = id;
                oferecimentos.add(e);
            });
        }
        if (request.grupos() != null) {
            request.grupos().forEach(id -> {
                VagaGrupo e = new VagaGrupo();
                e.vagaId = vagaId;
                e.grupoId = id;
                grupos.add(e);
            });
        }
        if (request.curriculos() != null) {
            request.curriculos().forEach(id -> {
                VagaCurriculo e = new VagaCurriculo();
                e.vagaId = vagaId;
                e.curriculoId = id;
                curriculos.add(e);
            });
        }
        if (request.empresas() != null) {
            request.empresas().forEach(id -> {
                VagaEmpresa e = new VagaEmpresa();
                e.vagaId = vagaId;
                e.empresaId = id;
                empresas.add(e);
            });
        }
        if (request.usuarios() != null) {
            request.usuarios().forEach(id -> {
                VagaUsuario e = new VagaUsuario();
                e.vagaId = vagaId;
                e.usuarioId = id;
                usuarios.add(e);
            });
        }
        Uni<Void> chain = Uni.createFrom().voidItem();
        if (!perfis.isEmpty()) chain = chain.chain(v -> perfilRepository.persist(perfis));
        if (!unidades.isEmpty()) chain = chain.chain(v -> unidadeRepository.persist(unidades));
        if (!componentes.isEmpty()) chain = chain.chain(v -> componenteRepository.persist(componentes));
        if (!oferecimentos.isEmpty()) chain = chain.chain(v -> oferecimentoRepository.persist(oferecimentos));
        if (!grupos.isEmpty()) chain = chain.chain(v -> grupoRepository.persist(grupos));
        if (!curriculos.isEmpty()) chain = chain.chain(v -> curriculoRepository.persist(curriculos));
        if (!empresas.isEmpty()) chain = chain.chain(v -> empresaRepository.persist(empresas));
        if (!usuarios.isEmpty()) chain = chain.chain(v -> usuarioRepository.persist(usuarios));
        return chain;
    }

    private void apply(Vaga vaga, VagaRequest request) {
        vaga.nome = request.nome();
        vaga.descricao = request.descricao();
        vaga.tituloEmail = request.titulo_email();
        vaga.assuntoEmail = request.assunto_email();
        vaga.dataInicio = request.data_inicio();
        vaga.dataFim = request.data_fim();
        vaga.vagas = request.vagas();
        vaga.usuarioId = request.id_usuario();
        vaga.flAtivo = request.fl_ativo() == null ? Boolean.TRUE : request.fl_ativo();
        vaga.flExibirVaga = request.fl_exibir_vaga() == null ? Boolean.TRUE : request.fl_exibir_vaga();
        vaga.flEmail = request.fl_email() == null ? Boolean.TRUE : request.fl_email();
        vaga.dataEnvio = request.data_envio();
    }

    private Uni<VagaResponse> toResponse(Vaga vaga) {
        Uni<List<VagaPerfil>> perfis = VagaPerfil.find("vagaId", vaga.id).list();
        return perfis.chain((List<VagaPerfil> p) -> {
            Uni<List<VagaUnidade>> unidades = VagaUnidade.find("vagaId", vaga.id).list();
            return unidades.chain((List<VagaUnidade> u) -> {
                Uni<List<VagaComponente>> componentes = VagaComponente.find("vagaId", vaga.id).list();
                return componentes.chain((List<VagaComponente> c) -> {
                    Uni<List<VagaOferecimento>> oferecimentos = VagaOferecimento.find("vagaId", vaga.id).list();
                    return oferecimentos.chain((List<VagaOferecimento> o) -> {
                        Uni<List<VagaGrupo>> grupos = VagaGrupo.find("vagaId", vaga.id).list();
                        return grupos.chain((List<VagaGrupo> g) -> {
                            Uni<List<VagaCurriculo>> curriculos = VagaCurriculo.find("vagaId", vaga.id).list();
                            return curriculos.chain((List<VagaCurriculo> cr) -> {
                                Uni<List<VagaEmpresa>> empresas = VagaEmpresa.find("vagaId", vaga.id).list();
                                return empresas.chain((List<VagaEmpresa> em) -> {
                                    Uni<List<VagaUsuario>> usuarios = VagaUsuario.find("vagaId", vaga.id).list();
                                    return usuarios.map((List<VagaUsuario> us) -> buildResponse(
                                            vaga, p, u, c, o, g, cr, em, us));
                                });
                            });
                        });
                    });
                });
            });
        });
    }

    private VagaResponse buildResponse(Vaga vaga,
                                       List<VagaPerfil> perfis, List<VagaUnidade> unidades,
                                       List<VagaComponente> componentes, List<VagaOferecimento> oferecimentos,
                                       List<VagaGrupo> grupos, List<VagaCurriculo> curriculos,
                                       List<VagaEmpresa> empresas, List<VagaUsuario> usuarios) {
        return new VagaResponse(
                vaga.id, vaga.nome, vaga.descricao, vaga.tituloEmail, vaga.assuntoEmail,
                vaga.dataInicio, vaga.dataFim, vaga.vagas, vaga.usuarioId,
                vaga.flAtivo, vaga.flExibirVaga, vaga.flEmail, vaga.dataEnvio,
                perfis.stream().map(x -> x.perfilId).toList(),
                unidades.stream().map(x -> x.unidadeId).toList(),
                componentes.stream().map(x -> x.componenteId).toList(),
                oferecimentos.stream().map(x -> x.oferecimentoId).toList(),
                grupos.stream().map(x -> x.grupoId).toList(),
                curriculos.stream().map(x -> x.curriculoId).toList(),
                empresas.stream().map(x -> x.empresaId).toList(),
                usuarios.stream().map(x -> x.usuarioId).toList());
    }
}
