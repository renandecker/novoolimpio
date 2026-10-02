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
import br.com.sol7.olimpio.basico.agenda.dto.AgendaUsuariosResponse;
import br.com.sol7.olimpio.basico.agenda.dto.AgendaResponse;
import br.com.sol7.olimpio.basico.agenda.entity.Agenda;
import br.com.sol7.olimpio.basico.agenda.repository.AgendaRepository;
import br.com.sol7.olimpio.basico.shared.notificacao.NotificacaoEventProducer;
import br.com.sol7.olimpio.basico.usuario.repository.UsuarioRepository;

@ApplicationScoped
@WithTransaction
public class AgendaService {
    @Inject
    AgendaRepository repository;
    @Inject
    NotificacaoEventProducer notificacaoEventProducer;
    @Inject
    UsuarioRepository usuarioRepository;

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
        return repository.persist(entity)
                .chain(persisted -> notificarAgenda("criada", toResponse(persisted))
                        .replaceWith(() -> toResponse(persisted)));
    }

    public Uni<AgendaResponse> update(Long id, AgendaRequest request) {
        validateSpecificRules(request);
        return repository.findById(id).onItem().ifNull().failWith(() -> new NotFoundException("Agenda nao encontrada")).invoke(entity -> apply(entity, request))
                .chain(entity -> notificarAgenda("alterada", toResponse(entity))
                        .replaceWith(() -> toResponse(entity)));
    }

    private Uni<Void> notificarAgenda(String acao, AgendaResponse resp) {
        return notificacaoEventProducer.enviar(null, "AGENDA", "ALTERACAO_AGENDA",
                "Agenda " + acao + ": " + resp.descricao(),
                "A agenda '" + resp.descricao() + "' foi " + acao + ".",
                "/view/configuracao/notificacoes-usuario");
    }

    public Uni<Void> delete(Long id) {
        return repository.deleteById(id).onItem().transformToUni(deleted -> deleted ? Uni.createFrom().voidItem() : Uni.createFrom().failure(new NotFoundException("Agenda nao encontrada")));
    }

    private void validateSpecificRules(AgendaRequest request) {
        //AgendaService.save: tempo deve seguir HH:mm e minutos entre 00 e 59.
        if (!request.tempoTolerancia().matches("\\d{2}:\\d{2}"))
            throw new BadRequestException("A hora deve seguir o padrao Ex.: 01:30");
        int minute = Integer.parseInt(request.tempoTolerancia().substring(3));
        if (minute > 59) throw new BadRequestException("O minuto deve estar no intervalo de 0 a 59m. Ex.: 01:30");
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


    public Uni<AgendaUsuariosResponse> carregarUsuarios(Long agendaId, Long usuarioId) {
        return usuarioRepository.buscarUnidadesDisponiveis(usuarioId)
                .chain(unidades -> {
                    List<Long> unidadesIds = unidades.stream().map(u -> u.id).toList();
                    if (unidadesIds.isEmpty()) {
                        return Uni.createFrom().item(new AgendaUsuariosResponse(List.of(), List.of()));
                    }
                    return usuarioRepository.buscarUsuarioPorUnidades(unidadesIds)
                            .chain(usuarios -> usuarioRepository.usuariosComUnidadesAgendas(unidadesIds, agendaId)
                                    .map(marcados -> new AgendaUsuariosResponse(
                                            usuarios.stream().map(u -> u.id).toList(),
                                            marcados.stream().map(u -> u.id).toList())));
                });
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

    public Uni<List<Long>> buscarAgendasPorUnidade(Long unidadeId) {
        // Obs: condicao removida (depende de outro microservico): a.unidade.ativo = true
        return repository.find("unidadeId = ?1", unidadeId).list().map(list -> list.stream().map(x -> x.id).toList());
    }

    public Uni<Long> buscarAgendaComResultados(Long id) {
        return repository.buscarAgendaComResultados(id).map(list -> list.isEmpty() ? null : list.get(0).id);
    }

    public Uni<Long> buscarAgendaComStatus(Long id) {
        return repository.buscarAgendaComStatus(id).map(list -> list.isEmpty() ? null : list.get(0).id);
    }

    public Uni<Boolean> buscarAgendasDoUsuario(Long usuarioId) {
        return repository.verificaAgendasDoUsuario(usuarioId).map(list -> !list.isEmpty());
    }

    public Uni<List<Long>> autoCompleteAll() {
        // Obs: condicao removida (depende de outro microservico): a.unidade.ativo = true
        return repository.find("order by descricao").page(io.quarkus.panache.common.Page.of(0, 10)).list().map(list -> list.stream().map(x -> x.id).toList());
    }

    public Uni<List<Long>> autoCompleteComUsuario(String query, Long usuarioId) {
        return repository.autoCompleteComUsuario(query.toLowerCase().trim(), usuarioId).map(list -> list.stream().map(x -> x.id).toList());
    }

    public Uni<List<Long>> autoCompleteDoUsuario(Long usuarioId) {
        return repository.autoCompleteDoUsuario(usuarioId).map(list -> list.stream().map(x -> x.id).toList());
    }

    public Uni<List<Long>> autoCompleteEstrategicoComUsuario(String query, Long usuarioId) {
        return repository.autoCompleteEstrategicoComUsuario(query.toLowerCase().trim(), usuarioId).map(list -> list.stream().map(x -> x.id).toList());
    }

    public Uni<List<Long>> autoCompleteEstrategicoDoUsuario(Long usuarioId) {
        return repository.autoCompleteEstrategicoDoUsuario(usuarioId).map(list -> list.stream().map(x -> x.id).toList());
    }

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


    // usuarios marcados para a agenda.
    public Uni<List<Long>> listarUsuarios(Long agendaId) {
        return repository.listarUsuariosIds(agendaId);
    }

    public Uni<Void> substituirUsuarios(Long agendaId, List<Long> usuarios) {
        return repository.substituirUsuarios(agendaId, usuarios == null ? List.of() : usuarios);
    }

}
