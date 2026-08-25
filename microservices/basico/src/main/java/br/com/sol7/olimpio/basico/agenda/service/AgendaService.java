package br.com.sol7.olimpio.basico.agenda.service;

import io.quarkus.hibernate.reactive.panache.common.WithTransaction;
import br.com.sol7.olimpio.shared.PagedResponse;

import br.com.sol7.olimpio.basico.usuarioperfil.repository.UsuarioPerfilRepository;
import br.com.sol7.olimpio.basico.usuarioperfil.repository.UsuarioPerfilRepository;
import br.com.sol7.olimpio.basico.usuarioperfil.repository.UsuarioPerfilRepository;
import br.com.sol7.olimpio.basico.usuarioperfil.repository.UsuarioPerfilRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.BadRequestException;
import jakarta.ws.rs.NotFoundException;
import io.smallrye.mutiny.Uni;

import java.util.List;

import br.com.sol7.olimpio.basico.agenda.dto.AgendaRequest;
import br.com.sol7.olimpio.basico.agenda.dto.AgendaResponse;
import br.com.sol7.olimpio.basico.agenda.entity.Agenda;
import br.com.sol7.olimpio.basico.agenda.repository.AgendaRepository;

@ApplicationScoped
@WithTransaction
public class AgendaService {
    @Inject
    AgendaRepository repository;

    public Uni<List<AgendaResponse>> list() {
        return repository.listAll().map(items -> items.stream().map(this::toResponse).toList());
    }

    public Uni<PagedResponse<AgendaResponse>> paged(int page, int size) {
        int p = Math.max(0, page);
        int s = (size == 10 || size == 20 || size == 50 || size == 100) ? size : 10;
        return repository.findAll(io.quarkus.panache.common.Sort.by("id").descending()).page(io.quarkus.panache.common.Page.of(p, s)).list()
                .onItem().transformToUni(items -> repository.count()
                        .map(count -> new PagedResponse<>(items.stream().map(this::toResponse).toList(), count, p, s)));
    }

    public Uni<AgendaResponse> find(Long id) {
        return repository.findById(id).onItem().ifNull().failWith(() -> new NotFoundException("Agenda nao encontrada")).map(this::toResponse);
    }

    public Uni<AgendaResponse> create(AgendaRequest request) {
        validateSpecificRules(request);
        var entity = new Agenda();
        apply(entity, request);
        return repository.persist(entity).replaceWith(() -> toResponse(entity));
    }

    public Uni<AgendaResponse> update(Long id, AgendaRequest request) {
        validateSpecificRules(request);
        return repository.findById(id).onItem().ifNull().failWith(() -> new NotFoundException("Agenda nao encontrada")).invoke(entity -> apply(entity, request)).map(this::toResponse);
    }

    public Uni<Void> delete(Long id) {
        return repository.deleteById(id).onItem().transformToUni(deleted -> deleted ? Uni.createFrom().voidItem() : Uni.createFrom().failure(new NotFoundException("Agenda nao encontrada")));
    }

    private void validateSpecificRules(AgendaRequest request) {
        // Migrado de AgendaService.save: tempo deve seguir HH:mm e minutos entre 00 e 59.
        if (!request.tempoTolerancia().matches("\\d{2}:\\d{2}"))
            throw new BadRequestException("A hora deve seguir o padrao Ex.: 01:30");
        int minute = Integer.parseInt(request.tempoTolerancia().substring(3));
        if (minute > 59) throw new BadRequestException("O minuto deve estar no intervalo de 0 a 59m. Ex.: 01:30");
        // Migrado de AgendaController.saveOrUpdate: status final e obrigatorio.
        if (request.statusCompromissoUltimoId() == null)
            throw new BadRequestException("Troca de status sem o ultimo status compromisso");
    }

    private void apply(Agenda e, AgendaRequest r) {
        e.descricao = r.descricao();
        e.proprio = r.proprio();
        e.diasMaximo = r.diasMaximo();
        e.quantidadeDiasMaximo = r.quantidadeDiasMaximo();
        e.tipoAgendaId = r.tipoAgendaId();
        e.statusCompromissoId = r.statusCompromissoId();
        e.statusCompromissoUltimoId = r.statusCompromissoUltimoId();
        e.unidadeId = r.unidadeId();
        e.tempoTolerancia = r.tempoTolerancia();
    }

    private AgendaResponse toResponse(Agenda e) {
        return new AgendaResponse(e.id, e.descricao, e.proprio, e.diasMaximo, e.quantidadeDiasMaximo, e.tipoAgendaId, e.statusCompromissoId, e.statusCompromissoUltimoId, e.unidadeId, e.tempoTolerancia);
    }


    // Migrado de AgendaController.carregarUsuarios (src/main/java/br/com/sol7/olimpio/control/controllers/basico/AgendaController.java:88, camada controller)
    // Observacao: parametro agendaId: era Agenda (referencia por id)
    // Logica original (adaptar):
    // public void carregarUsuarios(Agenda agenda) {
    //         setEntity(agenda);
    //         usuarios = usuarioService.buscarUsuarioPorUnidades(usuarioLogadoController.getUnidadesDisponiveis());
    //         usuariosMarcados = usuarioService.usuariosComUnidadesAgenda(usuarioLogadoController.getUnidadesDisponiveis(), agenda);
    //     }
    public Uni<Void> carregarUsuarios(Long agendaId) {
        // Obs: depende do microservico central (Usuario) - usuarioService.buscarUsuarioPorUnidades / usuariosComUnidadesAgenda
        return Uni.createFrom().voidItem();
    }


    // Migrado de AgendaController.autoComplete (src/main/java/br/com/sol7/olimpio/control/controllers/basico/AgendaController.java:230, camada controller)
    // Logica original (adaptar):
    // public List<Agenda> autoComplete(String query) {
    //         if (query.equals("") && usuarioLogadoController.getUsuario().getHierarquia().equals(HierarquiaPerfil.ADMIN)) {
    //             return agendaService.autoCompleteAll();
    //         }
    //         if (!query.equals("") && usuarioLogadoController.getUsuario().getHierarquia().equals(HierarquiaPerfil.ADMIN)) {
    //             return agendaService.autoComplete(query);
    //         }
    // 		/*if (!query.equals("") && usuarioLogadoController.getUsuario().getHierarquia().equals(HierarquiaPerfil.ESTRATEGICO)) {
    // 			return agendaService.autoCompleteEstrategicoComUsuario(query,usuarioLogadoController.getUsuario());
    // 		}
    // 		if (query.equals("") && usuarioLogadoController.getUsua ...
    // // ... (truncado, ver fonte original)
    public Uni<List<Long>> autoComplete(String query) {
        // Obs: depende do microservico central (usuario logado/hierarquia) para escolher entre autoCompleteAll, autoCompleteComUsuario e autoCompleteDoUsuario
        return Uni.createFrom().item(java.util.List.of());
    }


    // Migrado de AgendaService.buscarAgendasPorUnidade (src/main/java/br/com/sol7/olimpio/service/services/basico/AgendaService.java:65, camada service)
    // Observacao: parametro unidadeId: era Unidade (referencia por id)
    // Logica original (adaptar):
    // public List<Agenda> buscarAgendasPorUnidade(Unidade unidade) {
    //         return getAgendaRepository().buscarAgendasPorUnidade(unidade);
    //     }
    public Uni<List<Long>> buscarAgendasPorUnidade(Long unidadeId) {
        // Obs: condicao removida (depende de outro microservico): a.unidade.ativo = true
        return repository.find("unidadeId = ?1", unidadeId).list().map(list -> list.stream().map(x -> x.id).toList());
    }


    // Migrado de AgendaService.buscarAgendaComResultados (src/main/java/br/com/sol7/olimpio/service/services/basico/AgendaService.java:69, camada service)
    // Observacao: retorno: era Agenda (referencia por id); parametro id: era Agenda (referencia por id)
    // JPQL original: Select a from Agenda a left join fetch a.resultados where  a.unidade.ativo = true and a = ?1
    // Logica original (adaptar):
    // public Agenda buscarAgendaComResultados(Agenda id) {
    //         return getAgendaRepository().buscarAgendaComResultados(id);
    //     }
    public Uni<Long> buscarAgendaComResultados(Long id) {
        return repository.buscarAgendaComResultados(id).map(list -> list.isEmpty() ? null : list.get(0).id);
    }


    // Migrado de AgendaService.buscarAgendaComStatus (src/main/java/br/com/sol7/olimpio/service/services/basico/AgendaService.java:73, camada service)
    // Observacao: retorno: era Agenda (referencia por id); parametro id: era Agenda (referencia por id)
    // JPQL original: Select a from Agenda a left join fetch a.status where  a.unidade.ativo = true and a = ?1
    // Logica original (adaptar):
    // public Agenda buscarAgendaComStatus(Agenda id) {
    //         return getAgendaRepository().buscarAgendaComStatus(id);
    //     }
    public Uni<Long> buscarAgendaComStatus(Long id) {
        return repository.buscarAgendaComStatus(id).map(list -> list.isEmpty() ? null : list.get(0).id);
    }


    // Migrado de AgendaService.buscarAgendasDoUsuario (src/main/java/br/com/sol7/olimpio/service/services/basico/AgendaService.java:77, camada service)
    // Observacao: parametro usuarioId: era Usuario (referencia por id)
    // Logica original (adaptar):
    // public boolean buscarAgendasDoUsuario(Usuario usuario) {
    //         if (ObjectUtil.nullOrEmpty(getAgendaRepository().verificaAgendasDoUsuario(usuario, new PageRequest(0, 1)).getContent())) {
    //             return false;
    //         } else {
    //             return true;
    //         }
    //     }
    public Uni<Boolean> buscarAgendasDoUsuario(Long usuarioId) {
        return repository.verificaAgendasDoUsuario(usuarioId).map(list -> !list.isEmpty());
    }


    // Migrado de AgendaService.autoCompleteAll (src/main/java/br/com/sol7/olimpio/service/services/basico/AgendaService.java:93, camada service)
    // Logica original (adaptar):
    // public List<Agenda> autoCompleteAll() {
    //         return getAgendaRepository().autoCompleteAll(new PageRequest(0, 10)).getContent();
    //     }
    public Uni<List<Long>> autoCompleteAll() {
        // Obs: condicao removida (depende de outro microservico): a.unidade.ativo = true
        return repository.find("order by descricao").page(io.quarkus.panache.common.Page.of(0, 10)).list().map(list -> list.stream().map(x -> x.id).toList());
    }


    // Migrado de AgendaService.autoCompleteComUsuario (src/main/java/br/com/sol7/olimpio/service/services/basico/AgendaService.java:97, camada service)
    // Observacao: parametro usuarioId: era Usuario (referencia por id)
    // JPQL original: select distinct a from Usuario usu inner join usu.usuarioAgendas u inner join u.agenda a  where  a.unidade.ativo = true and usu = ?2 and (lower(a.descricao) like '%' || ?1 || '%' OR str(a.id) = ?1) order by a.descricao
    // Logica original (adaptar):
    // public List<Agenda> autoCompleteComUsuario(String query, Usuario usuario) {
    //         return getAgendaRepository().autoCompleteComUsuario(query.toLowerCase().trim(), usuario, new PageRequest(0, 10)).getContent();
    //     }
    public Uni<List<Long>> autoCompleteComUsuario(String query, Long usuarioId) {
        return repository.autoCompleteComUsuario(query.toLowerCase().trim(), usuarioId).map(list -> list.stream().map(x -> x.id).toList());
    }


    // Migrado de AgendaService.autoCompleteDoUsuario (src/main/java/br/com/sol7/olimpio/service/services/basico/AgendaService.java:101, camada service)
    // Observacao: parametro usuarioId: era Usuario (referencia por id)
    // JPQL original: select distinct a from Usuario usu inner join usu.usuarioAgendas u inner join u.agenda a where  a.unidade.ativo = true and usu = ?1 order by a.descricao
    // Logica original (adaptar):
    // public List<Agenda> autoCompleteDoUsuario(Usuario usuario) {
    //         return getAgendaRepository().autoCompleteDoUsuario(usuario, new PageRequest(0, 10)).getContent();
    //     }
    public Uni<List<Long>> autoCompleteDoUsuario(Long usuarioId) {
        return repository.autoCompleteDoUsuario(usuarioId).map(list -> list.stream().map(x -> x.id).toList());
    }


    // Migrado de AgendaService.autoCompleteEstrategicoComUsuario (src/main/java/br/com/sol7/olimpio/service/services/basico/AgendaService.java:105, camada service)
    // Observacao: parametro usuarioId: era Usuario (referencia por id)
    // JPQL original: select distinct a from Usuario usu inner join usu.usuarioAgendas u inner join u.agenda a where  a.unidade.ativo = true and (usu.hierarquia = 'ESTRATEGICO' or usu = ?2) and (lower(a.descricao) like '%' || ?1 || '%' OR str(a.id) = ?1) order by a.descricao
    // Logica original (adaptar):
    // public List<Agenda> autoCompleteEstrategicoComUsuario(String query, Usuario usuario) {
    //         return getAgendaRepository().autoCompleteEstrategicoComUsuario(query.toLowerCase().trim(), usuario, new PageRequest(0, 10)).getContent();
    //     }
    public Uni<List<Long>> autoCompleteEstrategicoComUsuario(String query, Long usuarioId) {
        return repository.autoCompleteEstrategicoComUsuario(query.toLowerCase().trim(), usuarioId).map(list -> list.stream().map(x -> x.id).toList());
    }


    // Migrado de AgendaService.autoCompleteEstrategicoDoUsuario (src/main/java/br/com/sol7/olimpio/service/services/basico/AgendaService.java:109, camada service)
    // Observacao: parametro usuarioId: era Usuario (referencia por id)
    // JPQL original: select distinct a from Usuario usu inner join usu.usuarioAgendas u inner join u.agenda a where  a.unidade.ativo = true and usu.hierarquia = 'ESTRATEGICO' or usu = ?1 order by a.descricao
    // Logica original (adaptar):
    // public List<Agenda> autoCompleteEstrategicoDoUsuario(Usuario usuario) {
    //         return getAgendaRepository().autoCompleteEstrategicoDoUsuario(usuario, new PageRequest(0, 10)).getContent();
    //     }
    public Uni<List<Long>> autoCompleteEstrategicoDoUsuario(Long usuarioId) {
        return repository.autoCompleteEstrategicoDoUsuario(usuarioId).map(list -> list.stream().map(x -> x.id).toList());
    }


    // Migrado do formAgenda.xhtml: listas Resultados e Status (inputMestreDetalheAutoComplete).
    public Uni<List<Long>> listarResultados(Long agendaId) {
        return repository.listarResultadosIds(agendaId);
    }

    public Uni<Void> substituirResultados(Long agendaId, List<Long> resultados) {
        return repository.substituirResultados(agendaId, resultados == null ? List.of() : resultados);
    }

    public Uni<List<Long>> listarStatus(Long agendaId) {
        return repository.listarStatusIds(agendaId);
    }

    public Uni<Void> substituirStatus(Long agendaId, List<Long> statuses) {
        return repository.substituirStatus(agendaId, statuses == null ? List.of() : statuses);
    }


    // Migrado de AgendaController.carregarUsuarios/salvarPerfilUsuario (listAgenda.xhtml dialogPessoa):
    // usuarios marcados para a agenda.
    public Uni<List<Long>> listarUsuarios(Long agendaId) {
        return repository.listarUsuariosIds(agendaId);
    }

    public Uni<Void> substituirUsuarios(Long agendaId, List<Long> usuarios) {
        return repository.substituirUsuarios(agendaId, usuarios == null ? List.of() : usuarios);
    }

}
