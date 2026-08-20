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
    public Uni<Void> buscarDetalhes(@QueryParam("event") String event) {
        return service.buscarDetalhes(event);
    }


    @POST
    @Path("/atualizar-horarios")
    public Uni<Void> atualizarHorarios(@QueryParam("event") String event) {
        return service.atualizarHorarios(event);
    }


    @POST
    @Path("/atualizar-horarios-data")
    public Uni<Void> atualizarHorariosData() {
        return service.atualizarHorariosData();
    }


    @GET
    @Path("/buscar-horarios-disponiveis")
    public Uni<Void> buscarHorariosDisponiveis(@QueryParam("agendaId") Long agendaId, @QueryParam("data") Date data) {
        return service.buscarHorariosDisponiveis(agendaId, data);
    }


    @GET
    @Path("/carregar-usuario-agenda")
    public Uni<Void> carregarUsuarioAgenda() {
        return service.carregarUsuarioAgenda();
    }

}