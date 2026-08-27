package br.com.sol7.olimpio.central.turnotrabalho;

import br.com.sol7.olimpio.shared.PagedResponse;
import io.smallrye.mutiny.Uni;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.*;

import java.util.List;
import java.util.Map;

@Path("/api/central/turno-trabalho")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class TurnoTrabalhoController {
    @Inject
    TurnoTrabalhoService service;

    @GET
    public Uni<List<TurnoTrabalhoResponse>> list() {
        return service.list();
    }

    @GET
    @Path("/paged")
    public Uni<PagedResponse<TurnoTrabalhoResponse>> paged(@QueryParam("page") Integer page, @QueryParam("size") Integer size) {
        return service.paged(page == null ? 0 : page, size == null ? 10 : size);
    }

    @GET
    @Path("/{id}")
    public Uni<TurnoTrabalhoResponse> find(@PathParam("id") Long id) {
        return service.find(id);
    }

    @POST
    public Uni<Response> create(@Valid TurnoTrabalhoRequest r) {
        return service.create(r).map(item -> Response.status(Response.Status.CREATED).entity(item).build());
    }

    @PUT
    @Path("/{id}")
    public Uni<TurnoTrabalhoResponse> update(@PathParam("id") Long id, @Valid TurnoTrabalhoRequest r) {
        return service.update(id, r);
    }

    @DELETE
    @Path("/{id}")
    public Uni<Void> delete(@PathParam("id") Long id) {
        return service.delete(id);
    }

    // ---- Combos / opcoes (para replicar po:inputSelecioneUm e po:inputMestreDetalheAutoComplete) ----

    @GET
    @Path("/dia-semana/opcoes")
    public Uni<List<Map<String, Object>>> diaSemanaOpcoes() {
        return service.listDiaSemana();
    }

    @GET
    @Path("/unidade/opcoes")
    public Uni<List<Map<String, Object>>> unidadeOpcoes(@QueryParam("query") String query) {
        return service.listUnidadeOpcoes(query);
    }

    @GET
    @Path("/{id}/unidades")
    public Uni<List<Long>> unidadesDoTurno(@PathParam("id") Long id) {
        return service.buscarUnidadeIds(id);
    }

    @GET
    @Path("/opcoes")
    public Uni<List<Map<String, Object>>> opcoes(@QueryParam("query") String query) {
        // Para AutoComplete de TurnoTrabalho (labelTurnoTrabalho: descricao, inicio as fim + diaSemana.nome)
        return service.list().map(list -> {
            String q = query == null ? "" : query.toLowerCase().trim();
            return list.stream()
                    .filter(r -> q.isEmpty()
                            || String.valueOf(r.id()).contains(q)
                            || (r.descricao() != null && r.descricao().toLowerCase().contains(q))
                            || (r.diaSemanaNome() != null && r.diaSemanaNome().toLowerCase().contains(q)))
                    .map(r -> {
                        Map<String, Object> m = new java.util.LinkedHashMap<>();
                        m.put("id", r.id());
                        String label;
                        try {
                            label = r.descricao() + ", " + r.inicio() + " as " + r.fim() + " " + (r.diaSemanaNome() == null ? "" : r.diaSemanaNome());
                        } catch (Exception e) {
                            label = r.descricao();
                        }
                        m.put("label", label.trim());
                        m.put("descricao", r.descricao());
                        m.put("inicio", r.inicio());
                        m.put("fim", r.fim());
                        m.put("diaSemanaNome", r.diaSemanaNome());
                        return m;
                    }).toList();
        });
    }

    @GET
    @Path("/min-turno")
    public Uni<String> minTurno() {
        return service.minTurno();
    }

    @GET
    @Path("/max-turno")
    public Uni<String> maxTurno() {
        return service.maxTurno();
    }

    // ---- Legados preservados ----

    @GET
    @Path("/auto-complete")
    public Uni<List<Long>> autoComplete(@QueryParam("query") String query) {
        return service.autoComplete(query);
    }

    @GET
    @Path("/auto-complete-turno-trabalho")
    public Uni<List<Long>> autoCompleteTurnoTrabalho(@QueryParam("query") String query) {
        return service.autoCompleteTurnoTrabalho(query);
    }

    @GET
    @Path("/buscar-turno-trabalho-com-unidades")
    public Uni<Long> buscarTurnoTrabalhoComUnidades(@QueryParam("entityId") Long entityId) {
        return service.buscarTurnoTrabalhoComUnidades(entityId);
    }

    @GET
    @Path("/buscar-turnos-da-unidade")
    public Uni<List<Long>> buscarTurnosDaUnidade() {
        return service.buscarTurnosDaUnidade();
    }

}
