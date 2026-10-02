package br.com.sol7.olimpio.basico.calendarioagenda.service;

import io.quarkus.hibernate.reactive.panache.common.WithTransaction;
import br.com.sol7.olimpio.shared.PagedResponse;
import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.NotFoundException;
import br.com.sol7.olimpio.shared.TupleHelper;

import java.util.List;

import io.smallrye.mutiny.Uni;

import java.util.Date;

import br.com.sol7.olimpio.basico.calendarioagenda.dto.CalendarioAgendaRequest;
import br.com.sol7.olimpio.basico.calendarioagenda.dto.CalendarioAgendaResponse;
import br.com.sol7.olimpio.basico.calendarioagenda.entity.CalendarioAgenda;
import br.com.sol7.olimpio.basico.calendarioagenda.repository.CalendarioAgendaRepository;
import br.com.sol7.olimpio.basico.compromisso.dto.CompromissoPessoaStatusResponse;
import br.com.sol7.olimpio.basico.compromisso.repository.CompromissoPessoaStatusRepository;
import br.com.sol7.olimpio.basico.compromisso.repository.CompromissoRepository;
import br.com.sol7.olimpio.basico.agenda.repository.AgendaRepository;
import br.com.sol7.olimpio.basico.horario.dto.HorarioResponse;
import br.com.sol7.olimpio.basico.horario.service.HorarioDisponivelService;

@ApplicationScoped
@WithTransaction
public class CalendarioAgendaService {
    @Inject
    CalendarioAgendaRepository repository;
    @Inject
    HorarioDisponivelService horarioDisponivelService;
    @Inject
    CompromissoRepository compromissoRepository;
    @Inject
    CompromissoPessoaStatusRepository compromissoPessoaStatusRepository;
    @Inject
    AgendaRepository agendaRepository;

    public Uni<List<CalendarioAgendaResponse>> list() {
        return repository.listAll().map(items -> items.stream().map(this::toResponse).toList());
    }

    public Uni<PagedResponse<CalendarioAgendaResponse>> paged(int page, int size) {
        int p = Math.max(0, page);
        int s = (size == 10 || size == 20 || size == 50 || size == 100) ? size : 10;
        return repository.findAll(io.quarkus.panache.common.Sort.by("id").descending()).page(io.quarkus.panache.common.Page.of(p, s)).list()
                .onItem().transformToUni(items -> repository.count()
                        .map(count -> new PagedResponse<>(items.stream().map(this::toResponse).toList(), count, p, s)));
    }

    public Uni<CalendarioAgendaResponse> find(Long id) {
        return repository.findById(id).onItem().ifNull().failWith(() -> new NotFoundException("CalendarioAgenda not found")).map(this::toResponse);
    }

    public Uni<CalendarioAgendaResponse> create(CalendarioAgendaRequest r) {
        var e = new CalendarioAgenda();
        apply(e, r);
        return repository.persist(e).replaceWith(() -> toResponse(e));
    }

    public Uni<CalendarioAgendaResponse> update(Long id, CalendarioAgendaRequest r) {
        return repository.findById(id).onItem().ifNull().failWith(() -> new NotFoundException("CalendarioAgenda not found")).invoke(e -> apply(e, r)).map(this::toResponse);
    }

    public Uni<Void> delete(Long id) {
        return repository.deleteById(id).onItem().transformToUni(deleted -> deleted ? Uni.createFrom().voidItem() : Uni.createFrom().failure(new NotFoundException("CalendarioAgenda not found")));
    }

    private void apply(CalendarioAgenda e, CalendarioAgendaRequest r) {
        e.nome = r.nome();
        e.dadosJson = r.dadosJson();
    }

    private CalendarioAgendaResponse toResponse(CalendarioAgenda e) {
        return new CalendarioAgendaResponse(e.id, e.nome, e.dadosJson);
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


    public Uni<List<HorarioResponse>> atualizarHorarios(Long agendaId, Long usuarioId, Date data, int tipoHorario) {
        return buscarHorariosDisponiveis(agendaId, usuarioId, data, tipoHorario);
    }


    public Uni<List<HorarioResponse>> atualizarHorariosData(Long compromissoId, Long usuarioId, int tipoHorario) {
        return compromissoRepository.findById(compromissoId)
                .onItem().ifNull().failWith(() -> new NotFoundException("Compromisso not found"))
                .chain(c -> carregarHorariosDisponiveis(c.agendaId, usuarioId, c.data, tipoHorario));
    }


    public Uni<List<HorarioResponse>> buscarHorariosDisponiveis(Long agendaId, Long usuarioId, Date data, int tipoHorario) {
        return carregarHorariosDisponiveis(agendaId, usuarioId, data, tipoHorario);
    }


    public Uni<Long> carregarUsuarioAgenda(Long agendaId, Long usuarioId) {
        return agendaRepository.buscarUsuarioAgenda(usuarioId, agendaId);
    }


    private Uni<List<HorarioResponse>> carregarHorariosDisponiveis(Long agendaId, Long usuarioId, Date data, int tipoHorario) {
        return horarioDisponivelService.buscarDisponiveis(agendaId, usuarioId, data, tipoHorario);
    }

}