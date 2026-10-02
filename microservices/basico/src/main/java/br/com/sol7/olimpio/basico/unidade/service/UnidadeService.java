package br.com.sol7.olimpio.basico.unidade.service;

import io.quarkus.cache.CacheInvalidateAll;
import io.quarkus.cache.CacheResult;
import io.quarkus.hibernate.reactive.panache.common.WithTransaction;
import br.com.sol7.olimpio.shared.PagedResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.NotFoundException;

import java.util.List;

import br.com.sol7.olimpio.basico.unidade.dto.UnidadeRequest;
import br.com.sol7.olimpio.basico.unidade.dto.UnidadeResponse;
import br.com.sol7.olimpio.basico.unidade.entity.Unidade;
import br.com.sol7.olimpio.basico.unidade.repository.UnidadeRepository;
import br.com.sol7.olimpio.basico.turnofuncionario.repository.TurnoFuncionarioRepository;
import br.com.sol7.olimpio.basico.pessoa.repository.PessoaRepository;
import br.com.sol7.olimpio.basico.usuario.repository.UsuarioRepository;
import br.com.sol7.olimpio.basico.unidade.dto.UnidadeIdsResponse;
import br.com.sol7.olimpio.basico.unidade.dto.UnidadePessoasResponse;
import br.com.sol7.olimpio.basico.unidade.dto.UnidadeUsuariosResponse;

@ApplicationScoped
@WithTransaction
public class UnidadeService {

    @Inject
    UnidadeRepository repository;
    @Inject
    UsuarioRepository usuarioRepository;
    @Inject
    PessoaRepository pessoaRepository;
    @Inject
    TurnoFuncionarioRepository turnoFuncionarioRepository;
    private static final Logger logger = LoggerFactory.getLogger(UnidadeService.class);

    @CacheResult(cacheName = "unidade-list-cache")
    public Uni<List<UnidadeResponse>> list() {
        return repository.listAll().map(items -> items.stream().map(this::toResponse).toList());
    }

    public Uni<PagedResponse<UnidadeResponse>> paged(int page, int size) {
        int p = Math.max(0, page);
        int s = (size == 10 || size == 20 || size == 50 || size == 100) ? size : 10;
        return repository.findAll(io.quarkus.panache.common.Sort.by("id").descending()).page(io.quarkus.panache.common.Page.of(p, s)).list()
                .onItem().transformToUni(items -> repository.count()
                        .map(count -> new PagedResponse<>(items.stream().map(this::toResponse).toList(), count, p, s)));
    }


    public Uni<UnidadeResponse> find(Long id) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("Unidade not found"))
                .map(this::toResponse);
    }

    @CacheInvalidateAll(cacheName = "unidade-list-cache")
    public Uni<UnidadeResponse> create(UnidadeRequest r) {
        var e = new Unidade();
        apply(e, r);
        return repository.persist(e).replaceWith(() -> toResponse(e));
    }

    @CacheInvalidateAll(cacheName = "unidade-list-cache")
    public Uni<UnidadeResponse> update(Long id, UnidadeRequest r) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("Unidade not found"))
                .invoke(e -> apply(e, r))
                .map(this::toResponse);
    }

    @CacheInvalidateAll(cacheName = "unidade-list-cache")
    public Uni<Void> delete(Long id) {
        return repository.deleteById(id).onItem()
                .transformToUni(deleted -> deleted ? Uni.createFrom().voidItem()
                        : Uni.createFrom().failure(new NotFoundException("Unidade not found")));
    }

    private void apply(Unidade e, UnidadeRequest r) {
        e.razaoSocial = r.razaoSocial();
        e.nomeFantasia = r.nomeFantasia();
        e.CNPJ = r.CNPJ();
        e.inscricaoEstadual = r.inscricaoEstadual();
        e.logradouroId = r.logradouroId();
        e.email = r.email();
        e.numero = r.numero();
        e.area = r.area();
        e.emailRH = r.emailRH();
        e.tipoUnidadeId = r.tipoUnidadeId();
        e.regiaoId = r.regiaoId();
        e.responsavelId = r.responsavelId();
        e.layoutId = r.layoutId();
        e.pontoReferencia = r.pontoReferencia();
        e.sucinto = r.sucinto();
        e.diretorEnsino = r.diretorEnsino();
        e.coordenador = r.coordenador();
        e.cep = r.cep();
        e.registro = r.registro();
        e.ativo = r.ativo();
    }

    private UnidadeResponse toResponse(Unidade e) {
        return new UnidadeResponse(e.id, e.razaoSocial, e.nomeFantasia, e.CNPJ, e.inscricaoEstadual, e.logradouroId, e.email, e.numero, e.area, e.emailRH, e.tipoUnidadeId, e.regiaoId, e.responsavelId, e.layoutId, e.pontoReferencia, e.sucinto, e.diretorEnsino, e.coordenador, e.cep, e.registro, e.ativo);
    }


    // Migrado de UnidadeController.carregarUsuarios (src/main/java/br/com/sol7/olimpio/control/controllers/basico/UnidadeController.java:299, camada controller)
    // Observacao: parametro unidadeId: era Unidade (referencia por id)
    // Logica original (adaptar):
    // public void carregarUsuarios(Unidade unidade) {
    //         setEntity(unidade);
    //         usuarios = usuarioService.buscarUsuarioPorUnidades(usuarioLogadoController.getUnidadesDisponiveis());
    //         usuariosMarcados = usuarioService.usuarioComUnidades(unidade);
    //     }
    public Uni<UnidadeUsuariosResponse> carregarUsuarios(Long unidadeId, Long usuarioLogadoId) {
        return usuarioRepository.buscarUnidadesDisponiveis(usuarioLogadoId).chain(unidades -> {
            List<Long> unidadesIds = unidades.stream().map(u -> u.id).toList();
            if (unidadesIds.isEmpty()) {
                return Uni.createFrom().item(new UnidadeUsuariosResponse(List.of(), List.of()));
            }
            return usuarioRepository.buscarUsuarioPorUnidades(unidadesIds).chain(todos ->
                    usuarioRepository.usuarioComUnidades(unidadeId).map(marcados ->
                            new UnidadeUsuariosResponse(
                                    todos.stream().map(u -> u.id).toList(),
                                    marcados.stream().map(u -> u.id).toList())));
        });
    }


    // Migrado de UnidadeController.carregarProfessores (src/main/java/br/com/sol7/olimpio/control/controllers/basico/UnidadeController.java:305, camada controller)
    // Observacao: parametro unidadeId: era Unidade (referencia por id)
    // Logica original (adaptar):
    // public void carregarProfessores(Unidade unidade) {
    //         setEntity(unidade);
    //         professores = professorService.buscarProfessorPorUnidades(usuarioLogadoController.getUnidadesDisponiveis());
    //         professoresMarcados = professorService.professorComUnidades(unidade);
    //     }
    public Uni<UnidadeIdsResponse> carregarProfessores(Long unidadeId, Long usuarioLogadoId) {
        return usuarioRepository.buscarUnidadesDisponiveis(usuarioLogadoId).chain(unidades -> {
            List<Long> unidadesIds = unidades.stream().map(u -> u.id).toList();
            if (unidadesIds.isEmpty()) {
                return Uni.createFrom().item(new UnidadeIdsResponse(List.of(), List.of()));
            }
            // Professor is in educacao module - use repository cross-module or return empty for now
            return Uni.createFrom().item(new UnidadeIdsResponse(List.of(), List.of()));
        });
    }


    // Migrado de UnidadeController.carregarCurriculos (src/main/java/br/com/sol7/olimpio/control/controllers/basico/UnidadeController.java:311, camada controller)
    // Observacao: parametro unidadeId: era Unidade (referencia por id)
    // Logica original (adaptar):
    // public void carregarCurriculos(Unidade unidade) {
    //         setEntity(unidade);
    //         curriculos = curriculoService.buscarCurriculoPorUnidades(usuarioLogadoController.getUnidadesDisponiveis());
    //         curriculosMarcados = curriculoService.curriculoComUnidades(unidade);
    //     }
    public Uni<UnidadeIdsResponse> carregarCurriculos(Long unidadeId, Long usuarioLogadoId) {
        return usuarioRepository.buscarUnidadesDisponiveis(usuarioLogadoId).chain(unidades -> {
            List<Long> unidadesIds = unidades.stream().map(u -> u.id).toList();
            if (unidadesIds.isEmpty()) {
                return Uni.createFrom().item(new UnidadeIdsResponse(List.of(), List.of()));
            }
            // Curriculo is in educacao module - return empty for now
            return Uni.createFrom().item(new UnidadeIdsResponse(List.of(), List.of()));
        });
    }


    // Migrado de UnidadeController.carregarPessoas (src/main/java/br/com/sol7/olimpio/control/controllers/basico/UnidadeController.java:317, camada controller)
    // Observacao: parametro unidadeId: era Unidade (referencia por id)
    // Logica original (adaptar):
    // public void carregarPessoas(Unidade unidade) {
    //         setEntity(unidade);
    //         pessoas = pessoaService.buscarPessoaPorUnidades(usuarioLogadoController.getUnidadesDisponiveis());
    //         pessoasMarcados = pessoaService.pessoaComUnidades(unidade);
    //     }
    public Uni<UnidadePessoasResponse> carregarPessoas(Long unidadeId, Long usuarioLogadoId) {
        return usuarioRepository.buscarUnidadesDisponiveis(usuarioLogadoId).chain(unidades -> {
            List<Long> unidadesIds = unidades.stream().map(u -> u.id).toList();
            if (unidadesIds.isEmpty()) {
                return Uni.createFrom().item(new UnidadePessoasResponse(List.of(), List.of()));
            }
            return pessoaRepository.buscarPessoaPorUnidades(unidadesIds).chain(todas ->
                    pessoaRepository.pessoaComUnidades(unidadeId).map(marcadas ->
                            new UnidadePessoasResponse(
                                    todas.stream().map(p -> p.id).toList(),
                                    marcadas.stream().map(p -> p.id).toList())));
        });
    }


    // Migrado de UnidadeController.carregarTurnos (src/main/java/br/com/sol7/olimpio/control/controllers/basico/UnidadeController.java:394, camada controller)
    // Logica original (adaptar):
    // public void carregarTurnos() {
    //         TurnoFuncionario turnoFuncionario1Carregado = turnoFuncionarioService.listarTurnosCarregado(turnoFuncionario);
    //         if (!ObjectUtil.nullOrEmpty(turnoFuncionario1Carregado)) {
    //             listaTurnosTrabalho = new LinkedHashSet<>(turnoFuncionario1Carregado.getTurnoTrabalhos());
    //         }
    //     }
    public Uni<List<Long>> carregarTurnos(Long usuarioId) {
        return usuarioRepository.findById(usuarioId).onItem().ifNull()
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


    // Migrado de UnidadeController.autoComplete (src/main/java/br/com/sol7/olimpio/control/controllers/basico/UnidadeController.java:401, camada controller)
    // Logica original (adaptar):
    // public List<Unidade> autoComplete(String query) {
    //         if (query.equals("") && (usuarioLogadoController.getUsuario().getHierarquia().equals(HierarquiaPerfil.ADMIN) || usuarioLogadoController.getUsuario().getHierarquia().equals(HierarquiaPerfil.ESTRATEGICO))) {
    //             return unidadeService.autoCompleteAll();
    //         }
    //         if (!query.equals("") && (usuarioLogadoController.getUsuario().getHierarquia().equals(HierarquiaPerfil.ADMIN) || usuarioLogadoController.getUsuario().getHierarquia().equals(HierarquiaPerfil.ESTRATEGICO))) {
    //             return unidadeService.autoComplete(query);
    //         }
    //         if (!query.equals("") && !usuarioLogadoController.getUsuario().getHierarquia().equals ...
    // // ... (truncado, ver fonte original)
    public Uni<List<Long>> autoComplete(String query) {
        // Obs: depende do usuario logado (hierarquia ADMIN/ESTRATEGICO) para escolher entre autoCompleteAll, autoComplete, autoCompleteComUsuario e autoCompleteDoUsuario
        return Uni.createFrom().item(java.util.List.of());
    }


    // Migrado de UnidadeService.buscarUnidadeComTelefones (src/main/java/br/com/sol7/olimpio/service/services/basico/UnidadeService.java:28, camada service)
    // Observacao: retorno: era Unidade (referencia por id); parametro unidadeId: era Unidade (referencia por id)
    // JPQL original: select u from Unidade u left join fetch u.telefones where u = ?1
    // Logica original (adaptar):
    // public Unidade buscarUnidadeComTelefones(Unidade unidade) {
    //         return getUnidadeRepository().buscarUnidadeComTelefones(unidade);
    //     }
    public Uni<Long> buscarUnidadeComTelefones(Long unidadeId) {
        return repository.buscarUnidadeComTelefones(unidadeId).map(list -> list.isEmpty() ? null : list.get(0).id);
    }


    // Migrado de UnidadeService.buscarUnidades (src/main/java/br/com/sol7/olimpio/service/services/basico/UnidadeService.java:32, camada service)
    // Logica original (adaptar):
    // public List<Unidade> buscarUnidades() {
    //         return getUnidadeRepository().buscarUnidades();
    //     }
    public Uni<List<Long>> buscarUnidades() {
        return repository.find("order by sucinto").list().map(list -> list.stream().map(x -> x.id).toList());
    }


    // Migrado de UnidadeService.autoCompleteAll (src/main/java/br/com/sol7/olimpio/service/services/basico/UnidadeService.java:40, camada service)
    // Logica original (adaptar):
    // public List<Unidade> autoCompleteAll() {
    //         return getUnidadeRepository().autoCompleteAll(new PageRequest(0, 10)).getContent();
    //     }
    public Uni<List<Long>> autoCompleteAll() {
        return repository.find("order by sucinto").page(io.quarkus.panache.common.Page.of(0, 10)).list().map(list -> list.stream().map(x -> x.id).toList());
    }


    // Migrado de UnidadeService.buscarTodos (src/main/java/br/com/sol7/olimpio/service/services/basico/UnidadeService.java:44, camada service)
    // Logica original (adaptar):
    // public List<Unidade> buscarTodos() {
    //         return getUnidadeRepository().buscarTodos();
    //     }
    public Uni<List<Long>> buscarTodos() {
        return repository.find("order by sucinto").list().map(list -> list.stream().map(x -> x.id).toList());
    }


    // Migrado de UnidadeService.autoCompleteComUsuario (src/main/java/br/com/sol7/olimpio/service/services/basico/UnidadeService.java:48, camada service)
    // Observacao: parametro usuarioId: era Usuario (referencia por id)
    // JPQL original: select distinct  u from Usuario usu inner join usu.unidades u where usu = ?2 and (lower(u.sucinto) like '%' || ?1 || '%' OR lower(u.nomeFantasia) like '%' || ?1 || '%'  OR lower(u.CNPJ) like '%' || ?1 || '%' OR lower(u.razaoSocial) like '%' || ?1 || '%' OR str(u.id) = ?1) order by u.sucinto
    // Logica original (adaptar):
    // public List<Unidade> autoCompleteComUsuario(String query, Usuario usuario) {
    //         return getUnidadeRepository().autoCompleteComUsuario(query.toLowerCase().trim(), usuario, new PageRequest(0, 10)).getContent();
    //     }
    public Uni<List<Long>> autoCompleteComUsuario(String query, Long usuarioId) {
        return repository.autoCompleteComUsuario(query.toLowerCase().trim(), usuarioId).map(list -> list.stream().map(x -> x.id).toList());
    }


    // Migrado de UnidadeService.autoCompleteDoUsuario (src/main/java/br/com/sol7/olimpio/service/services/basico/UnidadeService.java:52, camada service)
    // Observacao: parametro usuarioId: era Usuario (referencia por id)
    // JPQL original: select distinct  u from Usuario usu inner join usu.unidades u where usu = ?1 order by u.sucinto
    // Logica original (adaptar):
    // public List<Unidade> autoCompleteDoUsuario(Usuario usuario) {
    //         return getUnidadeRepository().autoCompleteDoUsuario(usuario, new PageRequest(0, 10)).getContent();
    //     }
    public Uni<List<Long>> autoCompleteDoUsuario(Long usuarioId) {
        return repository.autoCompleteDoUsuario(usuarioId).map(list -> list.stream().map(x -> x.id).toList());
    }


    // Migrado de UnidadeService.autoCompleteComCurriculoSemBusca (src/main/java/br/com/sol7/olimpio/service/services/basico/UnidadeService.java:56, camada service)
    // JPQL original: select distinct u from Curriculo usu inner join usu.unidades u where u in (?1) order by u.sucinto
    // Logica original (adaptar):
    // public List<Unidade> autoCompleteComCurriculoSemBusca(List<Unidade> unidades) {
    //         return getUnidadeRepository().autoCompleteComCurriculoSemBusca(unidades);
    //     }
    public Uni<List<Long>> autoCompleteComCurriculoSemBusca(List<Long> unidades) {
        return repository.autoCompleteComCurriculoSemBusca(unidades).map(list -> list.stream().map(x -> x.id).toList());
    }


    // Migrado de UnidadeService.autoCompleteUnidadeUsuario (src/main/java/br/com/sol7/olimpio/service/services/basico/UnidadeService.java:60, camada service)
    // Logica original (adaptar):
    // public List<Unidade> autoCompleteUnidadeUsuario(String query) {
    //         List<Unidade> unidades = usuarioLogadoController.getUnidadesDisponiveis();
    //         if (ObjectUtil.nullOrEmpty(query)) {
    //             return unidades;
    //         }
    //         return getUnidadeRepository().autoCompleteComUnidades(query.toLowerCase().trim(), unidades);
    //     }
    public Uni<List<Long>> autoCompleteUnidadeUsuario(String query, List<Long> unidadesIds) {
        if (unidadesIds == null || unidadesIds.isEmpty()) {
            return Uni.createFrom().item(java.util.List.of());
        }
        return repository.autoCompleteComUnidades(query.toLowerCase().trim(), unidadesIds).map(list -> list.stream().map(x -> x.id).toList());
    }


    // Migrado de UnidadeService.autoCompleteComUnidades (src/main/java/br/com/sol7/olimpio/service/services/basico/UnidadeService.java:68, camada service)
    // JPQL original: select distinct  u from Curriculo usu inner join usu.unidades u  where (lower(u.sucinto) like '%' || ?1 || '%' OR lower(u.nomeFantasia) like '%' || ?1 || '%'  OR lower(u.CNPJ) like '%' || ?1 || '%' OR lower(u.razaoSocial) like '%' || ?1 || '%' OR str(u.id) = ?1)  and u in (?2) order by u.sucinto
    // Logica original (adaptar):
    // public List<Unidade> autoCompleteComUnidades(String query, List<Unidade> unidades) {
    //         return getUnidadeRepository().autoCompleteComUnidades(query.toLowerCase().trim(), unidades);
    //     }
    public Uni<List<Long>> autoCompleteComUnidades(String query, List<Long> unidades) {
        return repository.autoCompleteComUnidades(query.toLowerCase().trim(), unidades).map(list -> list.stream().map(x -> x.id).toList());
    }


    // Migrado de UnidadeService.buscarUnidadeComTurnosDiaSemana (src/main/java/br/com/sol7/olimpio/service/services/basico/UnidadeService.java:72, camada service)
    // JPQL original: Select distinct  u from Usuario usu inner join usu.unidades u left join fetch u.turnoTrabalhos tt where tt.diaSemana.id = ?1 and usu = ?2 order by tt.inicio
    // Logica original (adaptar):
    // public List<Unidade> buscarUnidadeComTurnosDiaSemana(int diaSemana) {
    //         return getUnidadeRepository().buscarUnidadeComTurnosDiaSemana(diaSemana, usuarioLogadoController.getUsuario());
    //     }
    public Uni<List<Long>> buscarUnidadeComTurnosDiaSemana(Integer diaSemana, Long usuarioId) {
        if (diaSemana == null || usuarioId == null) {
            return Uni.createFrom().item(java.util.List.of());
        }
        return repository.buscarUnidadeComTurnosDiaSemana(diaSemana, usuarioId).map(list -> list.stream().map(x -> x.id).toList());
    }


    // Migrado de UnidadeService.buscarUnidade (src/main/java/br/com/sol7/olimpio/service/services/basico/UnidadeService.java:76, camada service)
    // Observacao: parametro regiaoId: era Regiao (referencia por id)
    // Logica original (adaptar):
    // public List<Unidade> buscarUnidade(Regiao regiao) {
    //         return getUnidadeRepository().buscarUnidade(regiao);
    //     }
    public Uni<List<Long>> buscarUnidade(Long regiaoId) {
        return repository.find("regiaoId = ?1", regiaoId).list().map(list -> list.stream().map(x -> x.id).toList());
    }


    // Migrado de UnidadeService.buscarUnidadeDaLigacao (src/main/java/br/com/sol7/olimpio/service/services/basico/UnidadeService.java:80, camada service)
    // Observacao: retorno: era Unidade (referencia por id); parametro operacionalId: era Operacional (referencia por id)
    // JPQL original: select op.pacote.unidade from Operacional op left join fetch op.pacote.unidade.telefones where op= ?1
    // Logica original (adaptar):
    // public Unidade buscarUnidadeDaLigacao(Operacional operacional) {
    //         return getUnidadeRepository().buscarUnidadeDaLigacao(operacional);
    //     }
    public Uni<Long> buscarUnidadeDaLigacao(Long operacionalId) {
        // Obs: depende do microservico central (Operacional) - repository.buscarUnidadeDaLigacao
        return Uni.createFrom().item(null);
    }


    // Migrado de UnidadeService.buscarUnidadeComTurnos (src/main/java/br/com/sol7/olimpio/service/services/basico/UnidadeService.java:84, camada service)
    // Observacao: retorno: era Unidade (referencia por id); parametro entityId: era Unidade (referencia por id)
    // JPQL original: Select u from Unidade u left join fetch u.turnoTrabalhos t where u = ?1 order by t.diaSemana, t.descricao
    // Logica original (adaptar):
    // public Unidade buscarUnidadeComTurnos(Unidade entity) {
    //         return getUnidadeRepository().buscarUnidadeComTurnos(entity);
    //     }
    public Uni<Long> buscarUnidadeComTurnos(Long entityId) {
        return repository.buscarUnidadeComTurnos(entityId).map(list -> list.isEmpty() ? null : list.get(0).id);
    }


    // Migrado de UnidadeService.autoCompleteGrupo (src/main/java/br/com/sol7/olimpio/service/services/basico/UnidadeService.java:89, camada service)
    // Observacao: parametro grupoId: era Grupo (referencia por id)
    // JPQL original: select distinct u from OferecimentoComponenteCurricular oo, Unidade u where  oo.unidade = u and oo.grupo = ?2 and lower(u.sucinto) like '%' || ?1 || '%' OR  lower(u.CNPJ) like '%' || ?1 || '%' OR lower(u.razaoSocial) like '%' || ?1 || '%' OR str(u.id) = ?1 order by u.sucinto
    // Logica original (adaptar):
    // public List<Unidade> autoCompleteGrupo(String query, Grupo grupo) {
    //         return getUnidadeRepository().autoCompleteGrupo(query.toLowerCase().trim(), grupo, new PageRequest(0, 10)).getContent();
    //     }
    public Uni<List<Long>> autoCompleteGrupo(String query, Long grupoId) {
        // Obs: depende do microservico educacao (OferecimentoComponenteCurricular) - repository.autoCompleteGrupo
        return Uni.createFrom().item(java.util.List.of());
    }


    // Migrado de UnidadeService.autoCompleteAllGrupo (src/main/java/br/com/sol7/olimpio/service/services/basico/UnidadeService.java:93, camada service)
    // Observacao: parametro grupoId: era Grupo (referencia por id)
    // JPQL original: select distinct u from OferecimentoComponenteCurricular oo, Unidade u where oo.unidade = u and oo.grupo = ?1  order by u.sucinto
    // Logica original (adaptar):
    // public List<Unidade> autoCompleteAllGrupo(Grupo grupo) {
    //         return getUnidadeRepository().autoCompleteAllGrupo(grupo, new PageRequest(0, 10)).getContent();
    //     }
    public Uni<List<Long>> autoCompleteAllGrupo(Long grupoId) {
        // Obs: depende do microservico educacao (OferecimentoComponenteCurricular) - repository.autoCompleteAllGrupo
        return Uni.createFrom().item(java.util.List.of());
    }


    // Migrado de UnidadeService.autoCompleteComUsuarioGrupo (src/main/java/br/com/sol7/olimpio/service/services/basico/UnidadeService.java:97, camada service)
    // Observacao: parametro usuarioId: era Usuario (referencia por id); parametro grupoId: era Grupo (referencia por id)
    // JPQL original: select distinct  u from OferecimentoComponenteCurricular oo, Usuario usu inner join usu.unidades u  where oo.unidade = u and oo.grupo = ?3 and usu = ?2 and (lower(u.sucinto) like '%' || ?1 || '%' OR  lower(u.CNPJ) like '%' || ?1 || '%' OR lower(u.razaoSocial) like '%' || ?1 || '%' OR str(u.id) = ?1) order by u.sucinto
    // Logica original (adaptar):
    // public List<Unidade> autoCompleteComUsuarioGrupo(String query, Usuario usuario, Grupo grupo) {
    //         return getUnidadeRepository().autoCompleteComUsuarioGrupo(query.toLowerCase().trim(), usuario, grupo, new PageRequest(0, 10)).getContent();
    //     }
    public Uni<List<Long>> autoCompleteComUsuarioGrupo(String query, Long usuarioId, Long grupoId) {
        // Obs: depende do microservico educacao (OferecimentoComponenteCurricular) - repository.autoCompleteComUsuarioGrupo
        return Uni.createFrom().item(java.util.List.of());
    }


    // Migrado de UnidadeService.autoCompleteDoUsuarioGrupo (src/main/java/br/com/sol7/olimpio/service/services/basico/UnidadeService.java:101, camada service)
    // Observacao: parametro usuarioId: era Usuario (referencia por id); parametro grupoId: era Grupo (referencia por id)
    // JPQL original: select distinct  u from OferecimentoComponenteCurricular oo, Usuario usu inner join usu.unidades u  where oo.unidade = u and oo.grupo = ?2 and usu = ?1 order by u.sucinto
    // Logica original (adaptar):
    // public List<Unidade> autoCompleteDoUsuarioGrupo(Usuario usuario, Grupo grupo) {
    //         return getUnidadeRepository().autoCompleteDoUsuarioGrupo(usuario, grupo, new PageRequest(0, 10)).getContent();
    //     }
    public Uni<List<Long>> autoCompleteDoUsuarioGrupo(Long usuarioId, Long grupoId) {
        // Obs: depende do microservico educacao (OferecimentoComponenteCurricular) - repository.autoCompleteDoUsuarioGrupo
        return Uni.createFrom().item(java.util.List.of());
    }

}
