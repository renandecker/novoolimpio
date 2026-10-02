package br.com.sol7.olimpio.basico.calendarioagenda.controller;

import br.com.sol7.olimpio.shared.PagedResponse;
import io.smallrye.mutiny.Uni;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.*;

import java.util.List;
import java.util.Date;

import br.com.sol7.olimpio.basico.calendarioagenda.dto.CalendarioAgendaRequest;
import br.com.sol7.olimpio.basico.calendarioagenda.dto.CalendarioAgendaResponse;
import br.com.sol7.olimpio.basico.calendarioagenda.service.CalendarioAgendaService;
import br.com.sol7.olimpio.basico.compromisso.dto.CompromissoPessoaStatusResponse;
import br.com.sol7.olimpio.basico.horario.dto.HorarioResponse;

@Path("/api/basico/calendario-agenda")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class CalendarioAgendaController {
    @Inject
    CalendarioAgendaService service;

    @GET
    public Uni<List<CalendarioAgendaResponse>> list() {
        return service.list();
    }

    @GET
    @Path("/paged")
    public Uni<PagedResponse<CalendarioAgendaResponse>> paged(@QueryParam("page") Integer page, @QueryParam("size") Integer size) {
        return service.paged(page == null ? 0 : page, size == null ? 10 : size);
    }

    @GET
    @Path("/{id}")
    public Uni<CalendarioAgendaResponse> find(@PathParam("id") Long id) {
        return service.find(id);
    }

    @POST
    public Uni<Response> create(@Valid CalendarioAgendaRequest r) {
        return service.create(r).map(item -> Response.status(Response.Status.CREATED).entity(item).build());
    }

    @PUT
    @Path("/{id}")
    public Uni<CalendarioAgendaResponse> update(@PathParam("id") Long id, @Valid CalendarioAgendaRequest r) {
        return service.update(id, r);
    }

    @DELETE
    @Path("/{id}")
    public Uni<Void> delete(@PathParam("id") Long id) {
        return service.delete(id);
    }

    @GET
    @Path("/buscar-detalhes")
    public Uni<List<CompromissoPessoaStatusResponse>> buscarDetalhes(@QueryParam("compromissoId") Long compromissoId) {
        return service.buscarDetalhes(compromissoId);
    }


    @POST
    @Path("/atualizar-horarios")
    public Uni<List<HorarioResponse>> atualizarHorarios(@QueryParam("agendaId") Long agendaId, @QueryParam("usuarioId") Long usuarioId, @QueryParam("data") Date data, @QueryParam("tipoHorario") Integer tipoHorario) {
        return service.atualizarHorarios(agendaId, usuarioId, data, tipoHorario == null ? 0 : tipoHorario);
    }


    @POST
    @Path("/atualizar-horarios-data")
    public Uni<List<HorarioResponse>> atualizarHorariosData(@QueryParam("compromissoId") Long compromissoId, @QueryParam("usuarioId") Long usuarioId, @QueryParam("tipoHorario") Integer tipoHorario) {
        return service.atualizarHorariosData(compromissoId, usuarioId, tipoHorario == null ? 0 : tipoHorario);
    }


    @GET
    @Path("/buscar-horarios-disponiveis")
    public Uni<List<HorarioResponse>> buscarHorariosDisponiveis(@QueryParam("agendaId") Long agendaId, @QueryParam("usuarioId") Long usuarioId, @QueryParam("data") Date data, @QueryParam("tipoHorario") Integer tipoHorario) {
        return service.buscarHorariosDisponiveis(agendaId, usuarioId, data, tipoHorario == null ? 0 : tipoHorario);
    }


    @GET
    @Path("/carregar-usuario-agenda")
    public Uni<Long> carregarUsuarioAgenda(@QueryParam("agendaId") Long agendaId, @QueryParam("usuarioId") Long usuarioId) {
        return service.carregarUsuarioAgenda(agendaId, usuarioId);
    }

}