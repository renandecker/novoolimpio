package br.com.sol7.olimpio.basico.configuracaoemail.controller;

import br.com.sol7.olimpio.shared.PagedResponse;
import io.smallrye.mutiny.Uni;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.*;

import java.util.List;

import br.com.sol7.olimpio.basico.configuracaoemail.dto.ConfiguracaoEmailRequest;
import br.com.sol7.olimpio.basico.configuracaoemail.dto.ConfiguracaoEmailResponse;
import br.com.sol7.olimpio.basico.configuracaoemail.service.ConfiguracaoEmailService;

@Path("/api/basico/configuracao-email")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class ConfiguracaoEmailController {
    @Inject
    ConfiguracaoEmailService service;

    @GET
    public Uni<List<ConfiguracaoEmailResponse>> list() {
        return service.list();
    }

    @GET
    @Path("/paged")
    public Uni<PagedResponse<ConfiguracaoEmailResponse>> paged(@QueryParam("page") Integer page, @QueryParam("size") Integer size) {
        return service.paged(page == null ? 0 : page, size == null ? 10 : size);
    }

    @GET
    @Path("/{id}")
    public Uni<ConfiguracaoEmailResponse> find(@PathParam("id") Long id) {
        return service.find(id);
    }

    @POST
    public Uni<Response> create(@Valid ConfiguracaoEmailRequest r) {
        return service.create(r).map(item -> Response.status(Response.Status.CREATED).entity(item).build());
    }

    @PUT
    @Path("/{id}")
    public Uni<ConfiguracaoEmailResponse> update(@PathParam("id") Long id, @Valid ConfiguracaoEmailRequest r) {
        return service.update(id, r);
    }

    @DELETE
    @Path("/{id}")
    public Uni<Void> delete(@PathParam("id") Long id) {
        return service.delete(id);
    }

    @GET
    @Path("/auto-complete-token-google")
    public Uni<List<Long>> autoCompleteTokenGoogle(@QueryParam("query") String query) {
        return service.autoCompleteTokenGoogle(query);
    }


    @GET
    @Path("/verificar-cota-auto")
    public Uni<Void> verificarCotaAuto() {
        return service.verificarCotaAuto();
    }

    @POST
    @Path("/verificar-cota-automatico")
    public Uni<Void> verificarCotaAutomatico() {
        return service.verificarCotaAutomatico();
    }

}