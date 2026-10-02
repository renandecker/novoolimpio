package br.com.sol7.olimpio.basico.usuario.service;

import io.quarkus.hibernate.reactive.panache.common.WithTransaction;
import br.com.sol7.olimpio.shared.PagedResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import br.com.sol7.olimpio.basico.usuarioperfil.repository.UsuarioPerfilRepository;
import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.NotFoundException;

import java.util.List;

import br.com.sol7.olimpio.basico.pessoa.repository.PessoaRepository;
import br.com.sol7.olimpio.basico.usuario.dto.UsuarioRequest;
import br.com.sol7.olimpio.basico.usuario.dto.UsuarioResponse;
import br.com.sol7.olimpio.basico.usuario.entity.Usuario;
import br.com.sol7.olimpio.basico.usuario.repository.UsuarioRepository;
import java.text.Normalizer;
import br.com.sol7.olimpio.basico.pessoafisica.repository.PessoaFisicaRepository;
import br.com.sol7.olimpio.basico.pessoafisica.entity.PessoaFisica;
import br.com.sol7.olimpio.basico.usuario.dto.UsuarioDetalheResponse;
import br.com.sol7.olimpio.basico.turnofuncionario.repository.TurnoFuncionarioRepository;
import br.com.sol7.olimpio.basico.shared.notificacao.NotificacaoEventProducer;

@ApplicationScoped
@WithTransaction
public class UsuarioService {

    @Inject
    UsuarioRepository repository;
    @Inject
    PessoaRepository pessoaRepository;
    @Inject
    PessoaFisicaRepository pessoaFisicaRepository;
    @Inject
    TurnoFuncionarioRepository turnoFuncionarioRepository;
    @Inject
    NotificacaoEventProducer notificacaoEventProducer;
    private static final Logger logger = LoggerFactory.getLogger(UsuarioService.class);

    public Uni<List<UsuarioResponse>> list() {
        logger.info("Buscando todos os usuarios");
        return repository.listAll().map(items -> items.stream().map(this::toResponse).toList());
    }

    public Uni<PagedResponse<UsuarioResponse>> paged(int page, int size) {
        int p = Math.max(0, page);
        int s = (size == 10 || size == 20 || size == 50 || size == 100) ? size : 10;
        return repository.findAll(io.quarkus.panache.common.Sort.by("id").descending()).page(io.quarkus.panache.common.Page.of(p, s)).list()
                .onItem().transformToUni(items -> repository.count()
                        .map(count -> new PagedResponse<>(items.stream().map(this::toResponse).toList(), count, p, s)));
    }


    public Uni<UsuarioResponse> find(Long id) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("Usuario not found"))
                .map(this::toResponse);
    }

    public Uni<UsuarioResponse> buscarPorUsername(String username) {
        if (username == null || username.isBlank()) {
            return Uni.createFrom().failure(new NotFoundException("Usuario not found"));
        }
        return repository.buscarPorLogin(username).onItem().ifNull()
                .failWith(() -> new NotFoundException("Usuario not found"))
                .map(this::toResponse);
    }

    public Uni<UsuarioResponse> create(UsuarioRequest r) {
        var e = new Usuario();
        apply(e, r);
        logger.info("Creating usuario with login: {}", r.login());
        return repository.persist(e)
                .chain(persisted -> notificacaoEventProducer.enviar(r.login(), "USUARIO", "ALTERACAO_CADASTRO",
                        "Cadastro criado: " + r.login(),
                        "O cadastro do usuário '" + r.login() + "' foi criado.",
                        "/view/configuracao/notificacoes-usuario")
                        .replaceWith(() -> toResponse(persisted)));
    }

    public Uni<UsuarioResponse> update(Long id, UsuarioRequest r) {
        logger.info("Updating usuario with id: {}", id);
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("Usuario not found"))
                .invoke(e -> apply(e, r))
                .chain(e -> notificacaoEventProducer.enviar(r.login(), "USUARIO", "ALTERACAO_CADASTRO",
                        "Cadastro alterado: " + r.login(),
                        "O cadastro do usuário '" + r.login() + "' foi alterado.",
                        "/view/configuracao/notificacoes-usuario")
                        .replaceWith(() -> toResponse(e)));
    }

    public Uni<Void> delete(Long id) {
        logger.info("Deleting usuario with id: {}", id);
        return repository.deleteById(id).onItem()
                .transformToUni(deleted -> deleted ? Uni.createFrom().voidItem()
                        : Uni.createFrom().failure(new NotFoundException("Usuario not found")));
    }

    public Uni<UsuarioResponse> atualizarFoto(String username, String foto) {
        logger.info("Atualizando foto do usuario logado: {}", username);
        return repository.buscarPorLogin(username).onItem().ifNull()
                .failWith(() -> new NotFoundException("Usuario not found"))
                .invoke(e -> e.foto = foto)
                .map(this::toResponse);
    }

    public Uni<UsuarioResponse> atualizarFotoBase64(String username, String fotoBase64) {
        logger.info("Atualizando foto base64 do usuario logado: {}", username);
        return repository.buscarPorLogin(username).onItem().ifNull()
                .failWith(() -> new NotFoundException("Usuario not found"))
                .invoke(e -> e.fotoBase64 = fotoBase64)
                .map(this::toResponse);
    }

    private void apply(Usuario e, UsuarioRequest r) {
        e.login = r.login();
        e.senha = r.senha();
        e.foto = r.foto();
        e.fotoBase64 = r.fotoBase64();
        e.hierarquia = r.hierarquia();
        e.qtdeNotify = r.qtdeNotify();
        e.ativo = r.ativo();
        e.senhaProvisoria = r.senhaProvisoria();
        e.pessoaId = r.pessoaId();
        e.funcionarioId = r.funcionarioId();
        e.unidadeDefaultId = r.unidadeDefaultId();
    }

    private UsuarioResponse toResponse(Usuario e) {
        return new UsuarioResponse(e.id, e.login, e.senha, e.foto, e.fotoBase64, e.hierarquia, e.qtdeNotify, e.ativo, e.senhaProvisoria, e.pessoaId, e.funcionarioId, e.unidadeDefaultId);
    }


    public Uni<String> gerarLogin(Long pessoaId) {
        return pessoaFisicaRepository.findByPessoaId(pessoaId).onItem().ifNull()
                .failWith(() -> new NotFoundException("PessoaFisica not found"))
                .map(pf -> {
                    String nome = pf.nome != null ? pf.nome.toLowerCase() : "";
                    nome = Normalizer.normalize(nome, Normalizer.Form.NFD)
                            .replaceAll("\\p{InCombiningDiacriticalMarks}", "");
                    String[] partes = nome.split("\\s+");
                    String login = partes[0];
                    if (partes.length >= 2) {
                        login = partes[0] + "." + partes[partes.length - 1];
                    }
                    String base = login;
                    int contador = 1;
                    while (true) {
                        final String candidate = login;
                        boolean exists = buscarLoginExistente(candidate).await().indefinitely();
                        if (!exists) break;
                        login = base + contador;
                        contador++;
                    }
                    return login;
                });
    }

    public Uni<Boolean> verificarExistencia(Integer id, Integer idpessoa, String nome, String cpf, String rg, String email) {
        return verificaExistenciaCpf(id, idpessoa, cpf)
                .chain(achou -> achou ? Uni.createFrom().item(true) : verificaExistenciaEmail(id, idpessoa, email))
                .chain(achou -> achou ? Uni.createFrom().item(true) : verificaExistenciaRg(id, idpessoa, rg));
    }

    private Uni<Boolean> verificaExistenciaCpf(Integer id, Integer idpessoa, String cpf) {
        if (cpf == null || cpf.isBlank()) return Uni.createFrom().item(false);
        Uni<Boolean> usuario = (id != null ? repository.existenciaUsuarioComCpfComUsuario(cpf, id.longValue()) : repository.existenciaUsuarioComCpf(cpf)).map(list -> !list.isEmpty());
        return usuario.chain(achouUsuario -> {
            if (achouUsuario) return Uni.createFrom().item(true);
            return (idpessoa != null ? pessoaRepository.existenciaPessoaComCpf(cpf, idpessoa) : pessoaRepository.existenciaPessoaComCpf(cpf)).map(list -> !list.isEmpty());
        });
    }

    private Uni<Boolean> verificaExistenciaRg(Integer id, Integer idpessoa, String rg) {
        if (rg == null || rg.isBlank()) return Uni.createFrom().item(false);
        Uni<Boolean> usuario = (id != null ? repository.existenciaUsuarioComRgComUsuario(rg, id.longValue()) : repository.existenciaUsuarioComRg(rg)).map(list -> !list.isEmpty());
        return usuario.chain(achouUsuario -> {
            if (achouUsuario) return Uni.createFrom().item(true);
            return (idpessoa != null ? pessoaRepository.existenciaPessoaComRg(rg, idpessoa) : pessoaRepository.existenciaPessoaComRg(rg)).map(list -> !list.isEmpty());
        });
    }

    private Uni<Boolean> verificaExistenciaEmail(Integer id, Integer idpessoa, String email) {
        if (email == null || email.isBlank()) return Uni.createFrom().item(false);
        Uni<Boolean> usuario = (id != null ? repository.existenciaUsuarioComEmailComUsuario(email, id.longValue()) : repository.existenciaUsuarioComEmail(email)).map(list -> !list.isEmpty());
        return usuario.chain(achouUsuario -> {
            if (achouUsuario) return Uni.createFrom().item(true);
            return (idpessoa != null ? pessoaRepository.existenciaPessoaComEmail(email, idpessoa) : pessoaRepository.existenciaPessoaComEmail(email)).map(list -> !list.isEmpty());
        });
    }


    public Uni<UsuarioDetalheResponse> buscarDetalhes(Long usuarioId) {
        return Uni.combine().all().unis(
                listarPerfis(usuarioId),
                listarAgendas(usuarioId),
                listarUnidades(usuarioId))
            .with((perfis, agendas, unidades) -> new UsuarioDetalheResponse(usuarioId, perfis, agendas, unidades));
    }

    public Uni<List<Long>> autoComplete(String query, Boolean isAdmin, List<Long> unidadesIds) {
        if (isAdmin != null && isAdmin) {
            if (query == null || query.isBlank()) {
                return repository.buscaTodos().map(list -> list.stream().map(x -> x.id).toList());
            }
            return repository.autoComplete(query.toLowerCase().trim()).map(list -> list.stream().map(x -> x.id).toList());
        }
        if (unidadesIds != null && !unidadesIds.isEmpty()) {
            return repository.autoCompleteComUnidade(query.toLowerCase().trim(), unidadesIds).map(list -> list.stream().map(x -> x.id).toList());
        }
        return repository.autoCompleteUsuario(query.toLowerCase().trim(), unidadesIds != null && !unidadesIds.isEmpty() ? unidadesIds.get(0) : null).map(list -> list.stream().map(x -> x.id).toList());
    }


    // Migrado de UsuarioController.gerarRelatorio (src/main/java/br/com/sol7/olimpio/control/controllers/basico/UsuarioController.java:1595, camada controller)
    // Observacao: retorno: era File no legado; parametro lista: era List<?> no legado
    // Logica original (adaptar):
    // public File gerarRelatorio(String localRelatorio, List<?> lista, String nomeArquivoSaida) throws MalformedURLException {
    //         InputStream relatorio = null;
    //         ByteArrayOutputStream relat = new ByteArrayOutputStream();
    //         ExternalContext externalContext = FacesContext.getCurrentInstance().getExternalContext();
    //         ServletContext contextS = (ServletContext) externalContext.getContext();
    //         String arquivo = contextS.getRealPath(localRelatorio);
    //         FileInputStream file = null;
    //         try {
    //             file = new FileInputStream(new File(arquivo));
    //             JasperPrint print = JasperFillManager.fillReport(file, new HashMap<>(), new JRBeanCollectionDataSource(lista)) ...
    // // ... (truncado, ver fonte original)
    public Uni<String> gerarRelatorio(String localRelatorio, String lista, String nomeArquivoSaida) {
        // Obs: metodo de UI (JasperReports/PrimerFaces) - geracao de arquivo, sem logica de dados portaavel
        return Uni.createFrom().item(null);
    }


    public Uni<List<Long>> carregarTurnos(Long usuarioId) {
        return repository.findById(usuarioId).onItem().ifNull()
                .failWith(() -> new NotFoundException("Usuario not found"))
                .chain(usuario -> {
                    if (usuario.funcionarioId == null) {
                        return Uni.createFrom().item(java.util.List.of());
                    }
                    return turnoFuncionarioRepository.buscarPorFuncionario(usuario.funcionarioId)
                            .chain(tf -> tf == null ? Uni.createFrom().item(java.util.List.of())
                                    : turnoFuncionarioRepository.getTurnoTrabalhoIds(tf.id));
                });
    }

    public Uni<List<Long>> autoCompletePessoaFisicaUnidade(String query, Long unidadeId) {
        return repository.autoCompletePessoaFisicaUnidade(query.toLowerCase().trim(), unidadeId).map(list -> list.stream().map(x -> x.id).toList());
    }

    public Uni<List<Long>> autoCompletePessoaJuridicaUnidade(String query, Long unidadeId) {
        return repository.autoCompletePessoaJuridicaUnidade(query.toLowerCase().trim(), unidadeId).map(list -> list.stream().map(x -> x.id).toList());
    }

    public Uni<Long> buscarUsuarioComTurnos(Long entityId) {
        return repository.buscarUsuarioComTurnos(entityId).map(list -> list.isEmpty() ? null : list.get(0).id);
    }

    public Uni<List<Long>> buscarUsuarioPorPerfil(Long perfilId) {
        return repository.buscarUsuarioPorPerfil(perfilId).map(list -> list.stream().map(x -> x.id).toList());
    }

    public Uni<List<Long>> buscarUsuarioPorUnidades(List<Long> unidade) {
        return repository.buscarUsuarioPorUnidades(unidade).map(list -> list.stream().map(x -> x.id).toList());
    }

    public Uni<List<Long>> buscarUsuarioPorUnidade(Long unidadeId) {
        return repository.buscarUsuarioPorUnidade(unidadeId).map(list -> list.stream().map(x -> x.id).toList());
    }

    public Uni<List<Long>> autoCompleteUsuario(String query, Long unidadeId) {
        return repository.autoCompleteUsuario(query.toLowerCase().trim(), unidadeId).map(list -> list.stream().map(x -> x.id).toList());
    }

    public Uni<List<Long>> buscarUnidadesDisponiveis(Long usuarioId) {
        return repository.buscarUnidadesDisponiveis(usuarioId).map(list -> list.stream().map(x -> x.id).toList());
    }

    public Uni<List<Long>> buscarUnidadesDisponiveisPorUsername(String username) {
        return repository.buscarPorLogin(username)
                .onItem().ifNull().failWith(() -> new jakarta.ws.rs.NotFoundException("Usuario not found: " + username))
                .chain(usuario -> buscarUnidadesDisponiveis(usuario.id));
    }

    public Uni<Long> buscarUsuarioIdPorUsername(String username) {
        return repository.buscarPorLogin(username)
                .onItem().ifNull().failWith(() -> new jakarta.ws.rs.NotFoundException("Usuario not found: " + username))
                .map(usuario -> usuario.id);
    }

    public Uni<List<Long>> buscarUnidadesDisponiveisRede(Long usuarioId) {
        return repository.buscarUnidadesDisponiveisRede(usuarioId).map(list -> list.stream().map(x -> x.id).toList());
    }

    public Uni<Long> buscarUsuarioComUnidades(Long entityId) {
        return repository.buscarUsuarioComUnidades(entityId).map(list -> list.isEmpty() ? null : list.get(0).id);
    }

    public Uni<Long> buscarUsuarioComAgendas(Long entityId) {
        return repository.buscarUsuarioComAgendas(entityId).map(list -> list.isEmpty() ? null : list.get(0).id);
    }

    public Uni<List<Long>> buscarAgendasDisponiveis(Long usuarioId) {
        return repository.buscarAgendasDisponiveis(usuarioId).map(list -> list.stream().map(x -> ((Number) x).longValue()).toList());
    }


    // Sub-recursos de acesso do usuario (Acessos no formUsuario): perfis, agendas e unidades.
    public Uni<List<Long>> listarPerfis(Long usuarioId) {
        return repository.listarPerfisIds(usuarioId);
    }

    public Uni<Void> substituirPerfis(Long usuarioId, List<Long> perfis) {
        return repository.substituirPerfis(usuarioId, perfis == null ? List.of() : perfis);
    }

    public Uni<List<Long>> listarAgendas(Long usuarioId) {
        return repository.listarAgendasIds(usuarioId);
    }

    public Uni<Void> substituirAgendas(Long usuarioId, List<Long> agendas) {
        return repository.substituirAgendas(usuarioId, agendas == null ? List.of() : agendas);
    }

    public Uni<List<Long>> listarUnidades(Long usuarioId) {
        return repository.listarUnidadesIds(usuarioId);
    }

    public Uni<Void> substituirUnidades(Long usuarioId, List<Long> unidades) {
        return repository.substituirUnidades(usuarioId, unidades == null ? List.of() : unidades);
    }

    public Uni<List<Long>> buscarConsultoresComAgenda(Long agendaId, Integer diaSemana) {
        return repository.buscarConsultoresComAgenda(agendaId, diaSemana).map(list -> list.stream().map(x -> x.id).toList());
    }

    public Uni<Boolean> buscarLoginExistente(String login) {
        return repository.buscarLoginExistente(login).map(list -> !list.isEmpty());
    }

    public Uni<Boolean> buscarLoginEemailExistente(String login, String email) {
        return repository.buscarLoginEemailExistente(login, email).map(list -> !list.isEmpty());
    }

    public Uni<Long> buscarUsuarioComPerfil(Long entityId) {
        return repository.buscarUsuarioComPerfil(entityId).map(list -> list.isEmpty() ? null : list.get(0).id);
    }

    public Uni<List<Long>> buscarUsuarioSeuPerfil(Long entityId) {
        return repository.buscarUsuarioSeuPerfil(entityId).map(list -> list.stream().map(x -> x.id).toList());
    }

    public Uni<List<Long>> autoCompleteComUnidade(String query, List<Long> unidades) {
        return repository.autoCompleteComUnidade(query.toLowerCase().trim(), unidades).map(list -> list.stream().map(x -> x.id).toList());
    }

    public Uni<List<Long>> autoCompleteComUnidadeDiaSemanaAgenda(String query, Integer diaSemana, Long agendaId, List<Long> unidadesIds) {
        if (unidadesIds == null || unidadesIds.isEmpty() || diaSemana == null) {
            return Uni.createFrom().item(java.util.List.of());
        }
        if (agendaId != null) {
            return repository.autoCompleteComUnidadeDiaSemanaAgenda(query.toLowerCase().trim(), unidadesIds, diaSemana, agendaId).map(list -> list.stream().map(x -> x.id).toList());
        }
        return repository.autoCompleteComUnidadeDiaSemana(query.toLowerCase().trim(), unidadesIds, diaSemana).map(list -> list.stream().map(x -> x.id).toList());
    }

    public Uni<List<Long>> autoCompleteComUnidadeDiaSemanaAgendaComPerfil(String query, Integer diaSemana, Long agendaId, Long perfilId, List<Long> unidadesIds) {
        if (unidadesIds == null || unidadesIds.isEmpty() || diaSemana == null) {
            return Uni.createFrom().item(java.util.List.of());
        }
        if (agendaId != null) {
            return repository.autoCompleteComUnidadeDiaSemanaAgendaComPerfil(query.toLowerCase().trim(), unidadesIds, diaSemana, agendaId, perfilId).map(list -> list.stream().map(x -> x.id).toList());
        }
        return repository.autoCompleteComUnidadeDiaSemanaComPerfil(query.toLowerCase().trim(), unidadesIds, diaSemana, perfilId).map(list -> list.stream().map(x -> x.id).toList());
    }

    public Uni<List<Long>> autoCompleteComUnidadeDiaSemana(String query, Integer diaSemana, List<Long> unidadesIds) {
        if (unidadesIds == null || unidadesIds.isEmpty() || diaSemana == null) {
            return Uni.createFrom().item(java.util.List.of());
        }
        return repository.autoCompleteComUnidadeDiaSemana(query.toLowerCase().trim(), unidadesIds, diaSemana).map(list -> list.stream().map(x -> x.id).toList());
    }

}
