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

@ApplicationScoped
@WithTransaction
public class UsuarioService {

    @Inject UsuarioRepository repository;
    @Inject PessoaRepository pessoaRepository;
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

    public Uni<UsuarioResponse> create(UsuarioRequest r) {
        var e = new Usuario();
        apply(e, r);
        logger.info("Creating usuario with login: {}", r.login());
        return repository.persist(e).replaceWith(() -> toResponse(e));
    }

    public Uni<UsuarioResponse> update(Long id, UsuarioRequest r) {
        logger.info("Updating usuario with id: {}", id);
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("Usuario not found"))
                .invoke(e -> apply(e, r))
                .map(this::toResponse);
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

    private void apply(Usuario e, UsuarioRequest r) { e.login = r.login(); e.senha = r.senha(); e.foto = r.foto(); e.fotoBase64 = r.fotoBase64(); e.hierarquia = r.hierarquia(); e.qtdeNotify = r.qtdeNotify(); e.ativo = r.ativo(); e.senhaProvisoria = r.senhaProvisoria(); e.pessoaId = r.pessoaId(); e.funcionarioId = r.funcionarioId(); e.unidadeDefaultId = r.unidadeDefaultId(); }

    private UsuarioResponse toResponse(Usuario e) {
        return new UsuarioResponse(e.id, e.login, e.senha, e.foto, e.fotoBase64, e.hierarquia, e.qtdeNotify, e.ativo, e.senhaProvisoria, e.pessoaId, e.funcionarioId, e.unidadeDefaultId);
    }


    // Migrado de UsuarioController.gerarLogin (src/main/java/br/com/sol7/olimpio/control/controllers/basico/UsuarioController.java:283, camada controller)
    // Logica original (adaptar):
    // public void gerarLogin() {
    //         String nomecompleto = removerAcentos(getEntity().getPessoa().getPessoaFisica().getNome().toLowerCase());
    //         String nome[] = nomecompleto.split(" ");
    //         String login = nome[0];
    //         if (nome.length >= 2) {
    //             login = nome[0] + "." + nome[nome.length - 1];
    //         }
    //         boolean loginExiste = true;
    //         int contador = 1;
    //         String loginAux = login;
    //         while (loginExiste) {
    //             if (!usuarioService.buscarLoginExistente(login)) {
    // // ... (truncado, ver fonte original)
    public Uni<Void> gerarLogin() {
        // Obs: depende da entidade da sessao JSF (nome da pessoa) para montar o login - ver UsuarioController.gerarLogin
        return Uni.createFrom().voidItem();
    }


    // Migrado de UsuarioController.verificarExistencia (src/main/java/br/com/sol7/olimpio/control/controllers/basico/UsuarioController.java:385, camada controller)
    // Logica original (adaptar):
    // public boolean verificarExistencia(Integer id, Integer idpessoa, String nome, String cpf, String rg, String email) {
    //         List<Pessoa> pessoas = new ArrayList<>();
    //         List<Usuario> usuarios = new ArrayList<>();
    //         usuario = null;
    //         pessoa = null;
    //         if (!ObjectUtil.nullOrEmpty(cpf)) {
    //             if (!ObjectUtil.nullOrEmpty(id)) {
    //                 usuarios = pessoaService.existenciaUsuarioComCpf(id, cpf);
    //             } else {
    //                 usuarios = pessoaService.existenciaUsuarioComCpf(cpf);
    //             }
    //             if (!ObjectUtil.nullOrEmpty(usuarios)) {
    // // ... (truncado, ver fonte original)
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


    // Migrado de UsuarioController.buscarDetalhes (src/main/java/br/com/sol7/olimpio/control/controllers/basico/UsuarioController.java:960, camada controller)
    // Observacao: parametro event: era ToggleEvent no legado
    // Logica original (adaptar):
    // public void buscarDetalhes(ToggleEvent event) {
    //         if (event.getVisibility() == Visibility.VISIBLE) {
    //             try {
    //                 Usuario usuario = (Usuario) event.getData();
    //                 Usuario usuarioCarregado = usuarioService.buscarUsuarioComPerfil(usuario);
    //                 listaDetalhePerfil = usuarioCarregado.getPerfis();
    //                 usuarioCarregado = usuarioService.buscarUsuarioComAgendas(usuario);
    //                 listaDetalheAgenda = usuarioCarregado.getUsuarioAgendas();
    //                 usuarioCarregado = usuarioService.buscarUsuarioComUnidades(usuario);
    //                 listaDetalheUnidade = usuarioCarregado.getUnidades();
    //             } catch (Exception e) {
    //        ...
    // // ... (truncado, ver fonte original)
    public Uni<Void> buscarDetalhes(String event) {
        // Obs: metodo de UI (ToggleEvent) - depende da Usuario do evento e de buscarUsuarioComPerfil/ComAgendas/ComUnidades
        return Uni.createFrom().voidItem();
    }


    // Migrado de UsuarioController.autoComplete (src/main/java/br/com/sol7/olimpio/control/controllers/basico/UsuarioController.java:1057, camada controller)
    // Logica original (adaptar):
    // public List<Usuario> autoComplete(String query) {
    //         if (query.equals("") && usuarioLogadoController.getUsuario().getHierarquia().equals(HierarquiaPerfil.ADMIN)) {
    //             return usuarioService.buscaTodos();
    //         }
    //         if (!query.equals("") && usuarioLogadoController.getUsuario().getHierarquia().equals(HierarquiaPerfil.ADMIN)) {
    //             return usuarioService.autoComplete(query);
    //         }
    //         if (!query.equals("") && !usuarioLogadoController.getUsuario().getHierarquia().equals(HierarquiaPerfil.ADMIN)) {
    //             return usuarioService.autoCompleteComUnidade(query, usuarioLogadoController.getUnidadesDisponiveis());
    //         }
    //         if (query.equals("") && !usuarioLo ...
    // // ... (truncado, ver fonte original)
    public Uni<List<Long>> autoComplete(String query) {
        // Obs: depende do usuario logado (hierarquia ADMIN) para escolher entre buscaTodos, autoComplete e autoCompleteComUnidade
        return Uni.createFrom().item(java.util.List.of());
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


    // Migrado de UsuarioController.carregarTurnos (src/main/java/br/com/sol7/olimpio/control/controllers/basico/UsuarioController.java:1826, camada controller)
    // Logica original (adaptar):
    // public void carregarTurnos() {
    //         TurnoFuncionario turnoFuncionario1Carregado = turnoFuncionarioService.listarTurnosCarregado(turnoFuncionario);
    //         if (!ObjectUtil.nullOrEmpty(turnoFuncionario1Carregado)) {
    //             listaTurnosTrabalho = new LinkedHashSet<>(turnoFuncionario1Carregado.getTurnoTrabalhos());
    //         }
    //     }
    public Uni<Void> carregarTurnos() {
        // Obs: depende do JSF (turnoFuncionario da tela) - turnoFuncionarioService.listarTurnosCarregado
        return Uni.createFrom().voidItem();
    }


    // Migrado de UsuarioService.autoCompletePessoaFisicaUnidade (src/main/java/br/com/sol7/olimpio/service/services/basico/UsuarioService.java:128, camada service)
    // Observacao: parametro unidadeId: era Unidade (referencia por id)
    // JPQL original: select distinct u from Pessoa u inner join u.unidades un where un = ?2  and un.ativo = true and lower(u.pessoaFisica.nome) like '%' || ?1 || '%' or lower(u.pessoaFisica.cpf) like '%' || ?1 || '%'
    // Logica original (adaptar):
    // public List<Pessoa> autoCompletePessoaFisicaUnidade(String query, Unidade unidade) {
    //         return getRepository().autoCompletePessoaFisicaUnidade(query.toLowerCase().trim(), unidade, new PageRequest(0, 10)).getContent();
    //     }
    public Uni<List<Long>> autoCompletePessoaFisicaUnidade(String query, Long unidadeId) {
        return repository.autoCompletePessoaFisicaUnidade(query.toLowerCase().trim(), unidadeId).map(list -> list.stream().map(x -> x.id).toList());
    }


    // Migrado de UsuarioService.autoCompletePessoaJuridicaUnidade (src/main/java/br/com/sol7/olimpio/service/services/basico/UsuarioService.java:132, camada service)
    // Observacao: parametro unidadeId: era Unidade (referencia por id)
    // JPQL original: select distinct u from Pessoa u inner join u.unidades un where un = ?2  and un.ativo = true and lower(u.pessoaJuridica.cnpj) like '%' || ?1 || '%' or lower(u.pessoaJuridica.nomeFantasia) like '%' || ?1 || '%'
    // Logica original (adaptar):
    // public List<Pessoa> autoCompletePessoaJuridicaUnidade(String query, Unidade unidade) {
    //         return getRepository().autoCompletePessoaJuridicaUnidade(query.toLowerCase().trim(), unidade, new PageRequest(0, 10)).getContent();
    //     }
    public Uni<List<Long>> autoCompletePessoaJuridicaUnidade(String query, Long unidadeId) {
        return repository.autoCompletePessoaJuridicaUnidade(query.toLowerCase().trim(), unidadeId).map(list -> list.stream().map(x -> x.id).toList());
    }


    // Migrado de UsuarioService.buscarUsuarioComTurnos (src/main/java/br/com/sol7/olimpio/service/services/basico/UsuarioService.java:136, camada service)
    // Observacao: retorno: era Usuario (referencia por id); parametro entityId: era Usuario (referencia por id)
    // JPQL original: Select u from Usuario u left join fetch u.turnoTrabalhos t where u = ?1 order by t.diaSemana, t.descricao
    // Logica original (adaptar):
    // public Usuario buscarUsuarioComTurnos(Usuario entity) {
    //         return getRepository().buscarUsuarioComTurnos(entity);
    //     }
    public Uni<Long> buscarUsuarioComTurnos(Long entityId) {
                return repository.buscarUsuarioComTurnos(entityId).map(list -> list.isEmpty() ? null : list.get(0).id);
    }


    // Migrado de UsuarioService.buscarUsuarioPorPerfil (src/main/java/br/com/sol7/olimpio/service/services/basico/UsuarioService.java:140, camada service)
    // Observacao: parametro perfilId: era Perfil (referencia por id)
    // JPQL original: select u from Usuario u left join fetch u.perfis perfis where ?1 in (perfis) and u.ativo = true order by u.login
    // Logica original (adaptar):
    // public List<Usuario> buscarUsuarioPorPerfil(Perfil perfil) {
    //         return getRepository().buscarUsuarioPorPerfil(perfil);
    //     }
    public Uni<List<Long>> buscarUsuarioPorPerfil(Long perfilId) {
                return repository.buscarUsuarioPorPerfil(perfilId).map(list -> list.stream().map(x -> x.id).toList());
    }


    // Migrado de UsuarioService.buscarUsuarioPorUnidades (src/main/java/br/com/sol7/olimpio/service/services/basico/UsuarioService.java:144, camada service)
    // JPQL original: select distinct u from Usuario u inner join u.unidades p where p in (?1) and p.ativo = true and u.ativo = true order by u.login
    // Logica original (adaptar):
    // public List<Usuario> buscarUsuarioPorUnidades(List<Unidade> unidade) {
    //         return getRepository().buscarUsuarioPorUnidades(unidade);
    //     }
    public Uni<List<Long>> buscarUsuarioPorUnidades(List<Long> unidade) {
                return repository.buscarUsuarioPorUnidades(unidade).map(list -> list.stream().map(x -> x.id).toList());
    }


    // Migrado de UsuarioService.buscarUsuarioPorUnidade (src/main/java/br/com/sol7/olimpio/service/services/basico/UsuarioService.java:152, camada service)
    // Observacao: parametro unidadeId: era Unidade (referencia por id)
    // JPQL original: select distinct u from Usuario u inner join u.unidades p where p = ?1 and p.ativo = true and u.ativo = true order by u.login
    // Logica original (adaptar):
    // public List<Usuario> buscarUsuarioPorUnidade(Unidade unidade) {
    //         return getRepository().buscarUsuarioPorUnidade(unidade, new PageRequest(0, 10)).getContent();
    //     }
    public Uni<List<Long>> buscarUsuarioPorUnidade(Long unidadeId) {
                return repository.buscarUsuarioPorUnidade(unidadeId).map(list -> list.stream().map(x -> x.id).toList());
    }


    // Migrado de UsuarioService.autoCompleteUsuario (src/main/java/br/com/sol7/olimpio/service/services/basico/UsuarioService.java:165, camada service)
    // Observacao: parametro unidadeId: era Unidade (referencia por id)
    // JPQL original: select distinct u from Usuario u left join u.unidades un where un.ativo = true and (lower(u.login) like '%' || ?1 || '%' or str(u.id) = ?1) and un in (?2) and u.ativo = true order by u.login
    // Logica original (adaptar):
    // public List<Usuario> autoCompleteUsuario(String query, Unidade unidade) {
    //         return getRepository().autoCompleteUsuario(query.toLowerCase().trim(), unidade, new PageRequest(0, 10)).getContent();
    //     }
    public Uni<List<Long>> autoCompleteUsuario(String query, Long unidadeId) {
                return repository.autoCompleteUsuario(query.toLowerCase().trim(), unidadeId).map(list -> list.stream().map(x -> x.id).toList());
    }


    // Migrado de UsuarioService.buscarUnidadesDisponiveis (src/main/java/br/com/sol7/olimpio/service/services/basico/UsuarioService.java:185, camada service)
    // Observacao: parametro usuarioId: era Usuario (referencia por id)
    // JPQL original: select uni from Usuario u inner join u.unidades uni where u = ?1 and uni.ativo = true and u.ativo = true order by uni.sucinto
    // Logica original (adaptar):
    // public List<Unidade> buscarUnidadesDisponiveis(Usuario usuario) {
    //         return getRepository().buscarUnidadesDisponiveis(usuario);
    //     }
    public Uni<List<Long>> buscarUnidadesDisponiveis(Long usuarioId) {
        return repository.buscarUnidadesDisponiveis(usuarioId).map(list -> list.stream().map(x -> x.id).toList());
    }


    // Migrado de UsuarioService.buscarUnidadesDisponiveisRede (src/main/java/br/com/sol7/olimpio/service/services/basico/UsuarioService.java:189, camada service)
    // Observacao: parametro usuarioId: era Usuario (referencia por id)
    // JPQL original: select uni from Rede r inner join r.unidades uni where r.usuario = ?1 and uni.ativo = true order by uni.sucinto
    // Logica original (adaptar):
    // public List<Unidade> buscarUnidadesDisponiveisRede(Usuario usuario) {
    //         return getRepository().buscarUnidadesDisponiveisRede(usuario);
    //     }
    public Uni<List<Long>> buscarUnidadesDisponiveisRede(Long usuarioId) {
        return repository.buscarUnidadesDisponiveisRede(usuarioId).map(list -> list.stream().map(x -> x.id).toList());
    }


    // Migrado de UsuarioService.buscarUsuarioComUnidades (src/main/java/br/com/sol7/olimpio/service/services/basico/UsuarioService.java:193, camada service)
    // Observacao: retorno: era Usuario (referencia por id); parametro entityId: era Usuario (referencia por id)
    // JPQL original: Select u from Usuario u left join fetch u.unidades where u = ?1
    // Logica original (adaptar):
    // public Usuario buscarUsuarioComUnidades(Usuario entity) {
    //         return getRepository().buscarUsuarioComUnidades(entity);
    //     }
    public Uni<Long> buscarUsuarioComUnidades(Long entityId) {
                return repository.buscarUsuarioComUnidades(entityId).map(list -> list.isEmpty() ? null : list.get(0).id);
    }


    // Migrado de UsuarioService.buscarUsuarioComAgendas (src/main/java/br/com/sol7/olimpio/service/services/basico/UsuarioService.java:197, camada service)
    // Observacao: retorno: era Usuario (referencia por id); parametro entityId: era Usuario (referencia por id)
    // JPQL original: Select u from Usuario u left join fetch u.usuarioAgendas where u = ?1
    // Logica original (adaptar):
    // public Usuario buscarUsuarioComAgendas(Usuario entity) {
    //         return getRepository().buscarUsuarioComAgendas(entity);
    //     }
    public Uni<Long> buscarUsuarioComAgendas(Long entityId) {
                return repository.buscarUsuarioComAgendas(entityId).map(list -> list.isEmpty() ? null : list.get(0).id);
    }


    // Migrado de UsuarioService.buscarAgendasDisponiveis (src/main/java/br/com/sol7/olimpio/service/services/basico/UsuarioService.java:201, camada service)
    // Observacao: parametro usuarioId: era Usuario (referencia por id)
    // JPQL original: select ua.agenda from Usuario u inner join u.usuarioAgendas ua where u = ?1 order by u.login
    // Logica original (adaptar):
    // public List<Agenda> buscarAgendasDisponiveis(Usuario usuario) {
    //         return getRepository().buscarAgendasDisponiveis(usuario);
    //     }
    public Uni<List<Long>> buscarAgendasDisponiveis(Long usuarioId) {
        return repository.buscarAgendasDisponiveis(usuarioId).map(list -> list.stream().map(x -> ((Number) x).longValue()).toList());
    }


    // Migrado de UsuarioService.buscarConsultoresComAgenda (src/main/java/br/com/sol7/olimpio/service/services/basico/UsuarioService.java:205, camada service)
    // Observacao: parametro agendaId: era Agenda (referencia por id)
    // JPQL original: Select distinct u from Usuario u left join fetch u.turnoTrabalhos tt inner join u.usuarioAgendas ag where ag.agenda in (?1) AND tt.diaSemana.id = ?2 and u.ativo = true and ag.atender = true order by tt.inicio
    // Logica original (adaptar):
    // public List<Usuario> buscarConsultoresComAgenda(Agenda agenda, int diaSemana) {
    //         return getRepository().buscarConsultoresComAgenda(agenda, diaSemana);
    //     }
    public Uni<List<Long>> buscarConsultoresComAgenda(Long agendaId, Integer diaSemana) {
                return repository.buscarConsultoresComAgenda(agendaId, diaSemana).map(list -> list.stream().map(x -> x.id).toList());
    }


    // Migrado de UsuarioService.buscarLoginExistente (src/main/java/br/com/sol7/olimpio/service/services/basico/UsuarioService.java:209, camada service)
    // Logica original (adaptar):
    // public Boolean buscarLoginExistente(String login) {
    //         return !ObjectUtil.nullOrEmpty(getRepository().buscarLoginExistente(login));
    //     }
    public Uni<Boolean> buscarLoginExistente(String login) {
                return repository.buscarLoginExistente(login).map(list -> !list.isEmpty());
    }


    // Migrado de UsuarioService.buscarLoginEemailExistente (src/main/java/br/com/sol7/olimpio/service/services/basico/UsuarioService.java:213, camada service)
    // Logica original (adaptar):
    // public Boolean buscarLoginEemailExistente(String login, String email) {
    //         return !ObjectUtil.nullOrEmpty(getRepository().buscarLoginEemailExistente(login, email));
    //     }
    public Uni<Boolean> buscarLoginEemailExistente(String login, String email) {
                return repository.buscarLoginEemailExistente(login, email).map(list -> !list.isEmpty());
    }


    // Migrado de UsuarioService.buscarUsuarioComPerfil (src/main/java/br/com/sol7/olimpio/service/services/basico/UsuarioService.java:217, camada service)
    // Observacao: retorno: era Usuario (referencia por id); parametro entityId: era Usuario (referencia por id)
    // JPQL original: Select u from Usuario u left join fetch u.perfis where u = ?1
    // Logica original (adaptar):
    // public Usuario buscarUsuarioComPerfil(Usuario entity) {
    //         return getRepository().buscarUsuarioComPerfil(entity);
    //     }
    public Uni<Long> buscarUsuarioComPerfil(Long entityId) {
                return repository.buscarUsuarioComPerfil(entityId).map(list -> list.isEmpty() ? null : list.get(0).id);
    }


    // Migrado de UsuarioService.buscarUsuarioSeuPerfil (src/main/java/br/com/sol7/olimpio/service/services/basico/UsuarioService.java:221, camada service)
    // Observacao: parametro entityId: era Usuario (referencia por id)
    // JPQL original: Select p from Usuario u inner join  u.perfis p where u = ?1
    // Logica original (adaptar):
    // public List<Perfil> buscarUsuarioSeuPerfil(Usuario entity) {
    //         return getRepository().buscarUsuarioSeuPerfil(entity);
    //     }
    public Uni<List<Long>> buscarUsuarioSeuPerfil(Long entityId) {
        return repository.buscarUsuarioSeuPerfil(entityId).map(list -> list.stream().map(x -> x.id).toList());
    }


    // Migrado de UsuarioService.autoCompleteComUnidade (src/main/java/br/com/sol7/olimpio/service/services/basico/UsuarioService.java:225, camada service)
    // JPQL original: select distinct u from Usuario u inner join u.unidades un where un.ativo = true and ( lower(u.login) like '%' || ?1 || '%' or str(u.id) = ?1 and u.ativo = true ) AND un in (?2) order by u.login
    // Logica original (adaptar):
    // public List<Usuario> autoCompleteComUnidade(String query, List<Unidade> unidades) {
    //         return getRepository().autoCompleteComUnidade(query.toLowerCase().trim(), unidades, new PageRequest(0, 10)).getContent();
    //     }
    public Uni<List<Long>> autoCompleteComUnidade(String query, List<Long> unidades) {
                return repository.autoCompleteComUnidade(query.toLowerCase().trim(), unidades).map(list -> list.stream().map(x -> x.id).toList());
    }


    // Migrado de UsuarioService.autoCompleteComUnidadeDiaSemanaAgenda (src/main/java/br/com/sol7/olimpio/service/services/basico/UsuarioService.java:237, camada service)
    // Observacao: parametro agendaId: era Agenda (referencia por id)
    // Logica original (adaptar):
    // public List<Usuario> autoCompleteComUnidadeDiaSemanaAgenda(String query, int diaSemana, Agenda agenda) {
    //         if (agenda != null) {
    //             return getRepository().autoCompleteComUnidadeDiaSemanaAgenda(query.toLowerCase().trim(), usuarioLogadoController.getUnidadesDisponiveis(), diaSemana, agenda);
    //         }
    //         return getRepository().autoCompleteComUnidadeDiaSemana(query.toLowerCase().trim(), usuarioLogadoController.getUnidadesDisponiveis(), diaSemana);
    //     }
    public Uni<List<Long>> autoCompleteComUnidadeDiaSemanaAgenda(String query, Integer diaSemana, Long agendaId) {
        // Obs: depende do usuario logado (unidades disponiveis) - repository.autoCompleteComUnidadeDiaSemanaAgenda / autoCompleteComUnidadeDiaSemana
        return Uni.createFrom().item(java.util.List.of());
    }


    // Migrado de UsuarioService.autoCompleteComUnidadeDiaSemanaAgendaComPerfil (src/main/java/br/com/sol7/olimpio/service/services/basico/UsuarioService.java:245, camada service)
    // Observacao: parametro agendaId: era Agenda (referencia por id); parametro perfilId: era Perfil (referencia por id)
    // Logica original (adaptar):
    // public List<Usuario> autoCompleteComUnidadeDiaSemanaAgendaComPerfil(String query, int diaSemana, Agenda agenda, Perfil perfil) {
    //         if (agenda != null) {
    //             return getRepository().autoCompleteComUnidadeDiaSemanaAgendaComPerfil(query.toLowerCase().trim(), usuarioLogadoController.getUnidadesDisponiveis(), diaSemana, agenda, perfil);
    //         }
    //         return getRepository().autoCompleteComUnidadeDiaSemanaComPerfil(query.toLowerCase().trim(), usuarioLogadoController.getUnidadesDisponiveis(), diaSemana, perfil);
    //     }
    public Uni<List<Long>> autoCompleteComUnidadeDiaSemanaAgendaComPerfil(String query, Integer diaSemana, Long agendaId, Long perfilId) {
        // Obs: depende do usuario logado (unidades disponiveis) - repository.autoCompleteComUnidadeDiaSemanaAgendaComPerfil / autoCompleteComUnidadeDiaSemanaComPerfil
        return Uni.createFrom().item(java.util.List.of());
    }


    // Migrado de UsuarioService.autoCompleteComUnidadeDiaSemana (src/main/java/br/com/sol7/olimpio/service/services/basico/UsuarioService.java:252, camada service)
    // JPQL original: select distinct u from Usuario u left join fetch u.unidades un inner join u.turnoTrabalhos tt where un.ativo = true and ( lower(u.login) like '%' || ?1 || '%' or str(u.id) = ?1) and u.ativo = true  AND un in (?2) AND tt.diaSemana.id = ?3 order by u.login
    // Logica original (adaptar):
    // public List<Usuario> autoCompleteComUnidadeDiaSemana(String query, int diaSemana) {
    //         return getRepository().autoCompleteComUnidadeDiaSemana(query.toLowerCase().trim(), usuarioLogadoController.getUnidadesDisponiveis(), diaSemana);
    //     }
    public Uni<List<Long>> autoCompleteComUnidadeDiaSemana(String query, Integer diaSemana) {
        // Obs: depende do usuario logado (unidades disponiveis) - repository.autoCompleteComUnidadeDiaSemana
        return Uni.createFrom().item(java.util.List.of());
    }

}
