package br.com.sol7.olimpio.basico.compromisso.service;

import io.quarkus.hibernate.reactive.panache.common.WithTransaction;
import br.com.sol7.olimpio.shared.PagedResponse;
import br.com.sol7.olimpio.shared.TupleHelper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.persistence.Tuple;
import jakarta.ws.rs.NotFoundException;

import java.util.List;
import java.util.Date;

import br.com.sol7.olimpio.basico.compromisso.dto.AgendaHorariosResponse;
import br.com.sol7.olimpio.basico.compromisso.dto.CompromissoPessoaStatusResponse;
import br.com.sol7.olimpio.basico.compromisso.dto.CompromissoRequest;
import br.com.sol7.olimpio.basico.compromisso.dto.CompromissoResponse;
import br.com.sol7.olimpio.basico.compromisso.dto.ResultadoResponse;
import br.com.sol7.olimpio.basico.compromisso.entity.Compromisso;
import br.com.sol7.olimpio.basico.compromisso.repository.CompromissoRepository;
import br.com.sol7.olimpio.basico.compromisso.repository.CompromissoPessoaStatusRepository;
import br.com.sol7.olimpio.basico.horario.dto.HorarioResponse;
import br.com.sol7.olimpio.basico.horario.service.HorarioDisponivelService;

@ApplicationScoped
@WithTransaction
public class CompromissoService {

    @Inject
    CompromissoRepository repository;
    private static final Logger logger = LoggerFactory.getLogger(CompromissoService.class);

    public Uni<Void> atualizarCompromissosAutomaticos() {
        logger.info("Atualizando compromissos automaticamente");

        return repository.atualizarCompromissosAutomaticos();
    }

    public Uni<List<CompromissoResponse>> list() {
        logger.info("Buscando todos os compromissos");
        return repository.listAll().map(items -> items.stream().map(this::toResponse).toList());
    }

    public Uni<List<CompromissoResponse>> listarCompromissosPorRangeData(Date inicio, Date fim) {
        return repository.listarCompromissosPorRangeData(inicio, fim)
                .map(items -> items.stream().map(this::toResponse).toList());
    }

    public Uni<PagedResponse<CompromissoResponse>> paged(int page, int size) {
        int p = Math.max(0, page);
        int s = (size == 10 || size == 20 || size == 50 || size == 100) ? size : 10;
        return repository.findAll(io.quarkus.panache.common.Sort.by("id").descending()).page(io.quarkus.panache.common.Page.of(p, s)).list()
                .onItem().transformToUni(items -> repository.count()
                        .map(count -> new PagedResponse<>(items.stream().map(this::toResponse).toList(), count, p, s)));
    }


    public Uni<CompromissoResponse> find(Long id) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("Compromisso not found"))
                .map(this::toResponse);
    }

    public Uni<CompromissoResponse> create(CompromissoRequest r) {
        var e = new Compromisso();
        apply(e, r);
        return repository.persist(e).replaceWith(() -> toResponse(e));
    }

    public Uni<CompromissoResponse> update(Long id, CompromissoRequest r) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("Compromisso not found"))
                .invoke(e -> apply(e, r))
                .map(this::toResponse);
    }

    public Uni<Void> delete(Long id) {
        return repository.deleteById(id).onItem()
                .transformToUni(deleted -> deleted ? Uni.createFrom().voidItem()
                        : Uni.createFrom().failure(new NotFoundException("Compromisso not found")));
    }

    private void apply(Compromisso e, CompromissoRequest r) {
        e.descricao = r.descricao();
        e.data = r.data();
        e.horarioId = r.horarioId();
        e.tipoCompromissoId = r.tipoCompromissoId();
        e.agendaId = r.agendaId();
        e.pessoaId = r.pessoaId();
        e.dataChegada = r.dataChegada();
        e.dataAlteracao = r.dataAlteracao();
        e.dataInicio = r.dataInicio();
        e.dataConclusao = r.dataConclusao();
        e.observacao = r.observacao();
        e.ativo = r.ativo();
        e.usuarioId = r.usuarioId();
        e.statusCompromissoId = r.statusCompromissoId();
        e.prospectoId = r.prospectoId();
        e.atendenteId = r.atendenteId();
        e.usuarioFinalizouId = r.usuarioFinalizouId();
    }

    private CompromissoResponse toResponse(Compromisso e) {
        return new CompromissoResponse(e.id, e.descricao, e.data, e.horarioId, e.tipoCompromissoId, e.agendaId, e.pessoaId, e.dataChegada, e.dataAlteracao, e.dataInicio, e.dataConclusao, e.observacao, e.ativo, e.usuarioId, e.statusCompromissoId, e.prospectoId, e.atendenteId, e.usuarioFinalizouId);
    }

    public Uni<Void> atualizarAgendaSchedule(Long compromissoId, Long statusCompromissoId) {
        return repository.findById(compromissoId)
                .chain(c -> repository.listarCompromissosComAgendaComStatus(c.agendaId, c.data, statusCompromissoId.intValue()).replaceWithVoid());
    }


    // Migrado de CompromissoController.autoCompleteComUnidadeDiaSemana (src/main/java/br/com/sol7/olimpio/control/controllers/basico/CompromissoController.java:159, camada controller)
    // Logica original (adaptar):
    // public List<Usuario> autoCompleteComUnidadeDiaSemana(String query) {
    //         Calendar calendario = Calendar.getInstance();
    //         calendario.setTime(getEntity().getData());
    //         int diaSemana = calendario.get(Calendar.DAY_OF_WEEK);
    //         if (agenda != null) {
    //             if (getEntity().getStatusCompromisso().getPerfil() == null) {
    //                 return usuarioService.autoCompleteComUnidadeDiaSemanaAgenda(query.toLowerCase(), diaSemana, agenda);
    //             } else {
    //                 return usuarioService.autoCompleteComUnidadeDiaSemanaAgendaComPerfil(query.toLowerCase(), diaSemana, agenda, getEntity().getStatusCompromisso().getPerfil());
    //             }
    //         }
    //         return usuarioSe ...
    // // ... (truncado, ver fonte original)
    public Uni<List<Long>> autoCompleteComUnidadeDiaSemana(String query) {
        // Obs: depende do microservico central (Usuario) - usuarioService.autoCompleteComUnidadeDiaSemanaAgenda/ComPerfil
        return Uni.createFrom().item(java.util.List.of());
    }


    public Uni<Long> carregarProspectoParaVisualizacao(Long entityId) {
        return buscarProspectoDoCompromisso(entityId);
    }


    public Uni<Long> carregarProspectoParaVisualizacao2(Long entityId) {
        return buscarProspectoDoCompromisso(entityId);
    }


    public Uni<AgendaHorariosResponse> atualizarHorariosResultados(Long agendaId, Long usuarioId, Date data, int tipoHorario) {
        return carregarAgendaHorarios(agendaId, usuarioId, data, tipoHorario);
    }


    public Uni<AgendaHorariosResponse> atualizarHorariosResultadosAgenda(Long agendaId, Long usuarioId, Date data, int tipoHorario) {
        return carregarAgendaHorarios(agendaId, usuarioId, data, tipoHorario);
    }


    public Uni<List<HorarioResponse>> atualizarHorarios(Long agendaId, Long usuarioId, Date data, int tipoHorario) {
        return buscarHorariosDisponiveis(agendaId, usuarioId, data, tipoHorario);
    }


    public Uni<List<HorarioResponse>> atualizarHorarios2(Long agendaId, Long usuarioId, Date data, int tipoHorario) {
        return buscarHorariosDisponiveis(agendaId, usuarioId, data, tipoHorario);
    }


    public Uni<List<HorarioResponse>> buscarHorariosDisponiveis(Long agendaId, Long usuarioId, Date data, int tipoHorario) {
        return carregarHorariosDisponiveis(agendaId, usuarioId, data, tipoHorario);
    }


    public Uni<List<CompromissoPessoaStatusResponse>> buscarDetalhes(Long compromissoId) {
        return compromissoPessoaStatusRepository.getCompromissoPessoaStatusByCompromisso(compromissoId)
                .map(list -> list.stream().map(row -> new CompromissoPessoaStatusResponse(
                        TupleHelper.getLong(row, "id"),
                        TupleHelper.getLong(row, "id_compromisso"),
                        TupleHelper.getLong(row, "id_status_anterior"),
                        TupleHelper.getLong(row, "id_status_proximo"),
                        TupleHelper.getLong(row, "id_pessoa"),
                        TupleHelper.getLong(row, "id_usuario"),
                        TupleHelper.getDate(row, "data"))).toList());
    }


    // Migrado de CompromissoController.autoCompletePessoaUnidade (src/main/java/br/com/sol7/olimpio/control/controllers/basico/CompromissoController.java:468, camada controller)
    // Logica original (adaptar):
    // public List<Pessoa> autoCompletePessoaUnidade(String query) {
    //         List<Pessoa> pessoa = new ArrayList<>();
    //         if (!ObjectUtil.nullOrEmpty(unidade)) {
    //             pessoa.addAll(usuarioService.autoCompletePessoaFisicaUnidade(query.toLowerCase(), unidade));
    //             pessoa.addAll(usuarioService.autoCompletePessoaJuridicaUnidade(query.toLowerCase(), unidade));
    //         }
    //         return pessoa;
    //     }
    public Uni<List<Long>> autoCompletePessoaUnidade(String query) {
        // Obs: depende do microservico central (Usuario) - usuarioService.autoCompletePessoaFisicaUnidade / autoCompletePessoaJuridicaUnidade
        return Uni.createFrom().item(java.util.List.of());
    }


    public Uni<List<HorarioResponse>> atualizarHorariosData(Long compromissoId, Long usuarioId, int tipoHorario) {
        return buscarHorarios(compromissoId, usuarioId, tipoHorario);
    }


    public Uni<List<HorarioResponse>> buscarHorarios(Long compromissoId, Long usuarioId, int tipoHorario) {
        return repository.findById(compromissoId)
                .onItem().ifNull().failWith(() -> new NotFoundException("Compromisso not found"))
                .chain(c -> carregarHorariosDisponiveis(c.agendaId, usuarioId, c.data, tipoHorario));
    }

    public Uni<List<Long>> carregarUsuarioAgenda(Long unidadeId) {
        return agendaRepository.buscarAgendasPorUnidade(unidadeId)
                .map(list -> list.stream().map(a -> a.id).toList());
    }

    public Uni<Boolean> verificaResultados(Long compromissoId) {
        return repository.buscarCompromissoComResultados(compromissoId.intValue()).map(list -> !list.isEmpty());
    }

    public Uni<Long> buscarCompromissoComResultados(Integer id) {
        return repository.buscarCompromissoComResultados(id).map(list -> list.isEmpty() ? null : list.get(0).id);
    }

    public Uni<Long> buscarLigacaoAgendamentoVencido(Long compromissoId) {
        return repository.find("compromisso = ?1", compromissoId).firstResult().map(x -> x == null ? null : x.id);
    }

    public Uni<Long> buscarProspectoDoCompromisso(Long compromissoId) {
        return repository.buscarProspectoDoCompromisso(compromissoId).map(list -> list.isEmpty() ? null : ((Number) list.get(0)).longValue());
    }

    public Uni<CompromissoResponse> trocarStatus(Long compromissoId, Long statusId) {
        if (statusId == null) {
            return Uni.createFrom().failure(new jakarta.ws.rs.WebApplicationException(
                    "Informe o novo status", jakarta.ws.rs.core.Response.Status.BAD_REQUEST));
        }
        return repository.findById(compromissoId).onItem().ifNull()
                .failWith(() -> new NotFoundException("Compromisso not found"))
                .chain(c -> repository.inserirPessoaStatus(compromissoId, c.statusCompromissoId, statusId)
                        .chain(() -> repository.modificarStatusCompromisso(compromissoId, statusId))
                        // O UPDATE nativo contorna o contexto de persistencia: recarrega a
                        // entidade antes de responder, senao o find() abaixo devolveria o
                        // estado anterior (stale read).
                        .chain(() -> io.quarkus.hibernate.reactive.panache.Panache.getSession()
                                .chain(s -> s.refresh(c)))
                        .replaceWith(() -> toResponse(c)));
    }

    public Uni<CompromissoResponse> proximoStatus(Long compromissoId, String observacao) {
        return repository.findById(compromissoId).onItem().ifNull()
                .failWith(() -> new NotFoundException("Compromisso not found"))
                .chain(c -> repository.buscarProximoStatus(compromissoId)
                        .onItem().ifNull().failWith(() -> new jakarta.ws.rs.WebApplicationException(
                                "Este compromisso nao possui proximo status", jakarta.ws.rs.core.Response.Status.BAD_REQUEST))
                        .chain(proximoId -> repository.buscarStatusAgenda(compromissoId)
                                .chain(agendaStatusId -> repository.inserirPessoaStatus(compromissoId, c.statusCompromissoId, proximoId)
                                        .chain(() -> repository.avancarStatus(compromissoId, proximoId,
                                                agendaStatusId != null && agendaStatusId.equals(proximoId), observacao))
                                        .chain(() -> io.quarkus.hibernate.reactive.panache.Panache.getSession()
                                                .chain(s -> s.refresh(c)))
                                        .replaceWith(() -> toResponse(c)))));
    }

    public Uni<CompromissoResponse> fechar(Long compromissoId) {
        return repository.findById(compromissoId).onItem().ifNull()
                .failWith(() -> new NotFoundException("Compromisso not found"))
                .chain(c -> repository.fecharCompromisso(compromissoId)
                        .chain(() -> io.quarkus.hibernate.reactive.panache.Panache.getSession()
                                .chain(s -> s.refresh(c)))
                        .replaceWith(() -> toResponse(c)));
    }

    public Uni<List<br.com.sol7.olimpio.basico.compromisso.dto.ResultadoResponse>> listarResultados(Long id) {
        return repository.buscarResultadosDoCompromisso(id)
                .map(list -> list.stream().map(row -> new br.com.sol7.olimpio.basico.compromisso.dto.ResultadoResponse(
                        TupleHelper.getLong(row, "id"),
                        TupleHelper.getString(row, "descricao")
                )).toList());
    }

    @Inject
    br.com.sol7.olimpio.basico.pessoa.repository.PessoaRepository pessoaRepository;

    @Inject
    br.com.sol7.olimpio.basico.agenda.repository.AgendaRepository agendaRepository;

    @Inject
    HorarioDisponivelService horarioDisponivelService;

    @Inject
    CompromissoPessoaStatusRepository compromissoPessoaStatusRepository;

    public Uni<List<br.com.sol7.olimpio.basico.pessoa.dto.PessoaResponse>> buscarPessoasPorAgendaOuUnidade(Long agendaId, Long unidadeId) {
        if (agendaId != null) {
            return agendaRepository.findById(agendaId)
                    .chain(agenda -> {
                        if (agenda == null || agenda.unidadeId == null) {
                            return pessoaRepository.listAll().map(list -> list.stream().map(p -> new br.com.sol7.olimpio.basico.pessoa.dto.PessoaResponse(p.id, p.numero, p.complemento, p.email, p.telefone, p.celular, p.foto, p.observacao, p.comunicado, p.logradouroId, p.dataCadastro, p.dataAlteracao)).toList());
                        }
                        return pessoaRepository.find("unidadeId", agenda.unidadeId).list()
                                .map(list -> list.stream().map(p -> new br.com.sol7.olimpio.basico.pessoa.dto.PessoaResponse(p.id, p.numero, p.complemento, p.email, p.telefone, p.celular, p.foto, p.observacao, p.comunicado, p.logradouroId, p.dataCadastro, p.dataAlteracao)).toList());
                    });
        }
        if (unidadeId != null) {
            return pessoaRepository.find("unidadeId", unidadeId).list()
                    .map(list -> list.stream().map(p -> new br.com.sol7.olimpio.basico.pessoa.dto.PessoaResponse(p.id, p.numero, p.complemento, p.email, p.telefone, p.celular, p.foto, p.observacao, p.comunicado, p.logradouroId, p.dataCadastro, p.dataAlteracao)).toList());
        }
        return pessoaRepository.listAll()
                .map(list -> list.stream().map(p -> new br.com.sol7.olimpio.basico.pessoa.dto.PessoaResponse(p.id, p.numero, p.complemento, p.email, p.telefone, p.celular, p.foto, p.observacao, p.comunicado, p.logradouroId, p.dataCadastro, p.dataAlteracao)).toList());
    }


    private Uni<List<HorarioResponse>> carregarHorariosDisponiveis(Long agendaId, Long usuarioId, Date data, int tipoHorario) {
        return horarioDisponivelService.buscarDisponiveis(agendaId, usuarioId, data, tipoHorario);
    }

    private Uni<AgendaHorariosResponse> carregarAgendaHorarios(Long agendaId, Long usuarioId, Date data, int tipoHorario) {
        return agendaRepository.listarResultadosIds(agendaId)
                .chain(resultados -> carregarHorariosDisponiveis(agendaId, usuarioId, data, tipoHorario)
                        .map(horarios -> new AgendaHorariosResponse(agendaId, data, tipoHorario, resultados, horarios)));
    }

}
