package br.com.sol7.olimpio.comercial.controleprospecto;

import br.com.sol7.olimpio.shared.PagedResponse;
import io.smallrye.mutiny.Uni;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.*;

import java.util.List;

@Path("/api/comercial/controle-prospecto")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class ControleProspectoController {
    @Inject
    ControleProspectoService service;

    @GET
    public Uni<List<ControleProspectoResponse>> list(@QueryParam("campoId") Long campoId) {
        return service.list(campoId);
    }

    @GET
    @Path("/wapper")
    public Uni<List<ControleProspectoWapperResponse>> listarPorCampo(
            @QueryParam("campoId") Long campoId,
            @QueryParam("page") Integer page,
            @QueryParam("size") Integer size,
            @QueryParam("sortField") String sortField,
            @QueryParam("sortOrder") String sortOrder,
            @QueryParam("filtroNome") String filtroNome,
            @QueryParam("filtroId") String filtroId,
            @QueryParam("filtroValor") String filtroValor) {
        return service.listarPorCampo(campoId, page == null ? 0 : page, size == null ? 10 : size, sortField, sortOrder, filtroNome, filtroId, filtroValor);
    }

    @GET
    @Path("/wapper/paged")
    public Uni<PagedResponse<ControleProspectoWapperResponse>> pagedPorCampo(
            @QueryParam("campoId") Long campoId,
            @QueryParam("page") Integer page,
            @QueryParam("size") Integer size,
            @QueryParam("sortField") String sortField,
            @QueryParam("sortOrder") String sortOrder,
            @QueryParam("filtroNome") String filtroNome,
            @QueryParam("filtroId") String filtroId,
            @QueryParam("filtroValor") String filtroValor) {
        return service.pagedPorCampo(campoId, page == null ? 0 : page, size == null ? 10 : size, sortField, sortOrder, filtroNome, filtroId, filtroValor);
    }

    @GET
    @Path("/paged")
    public Uni<PagedResponse<ControleProspectoResponse>> paged(@QueryParam("page") Integer page, @QueryParam("size") Integer size) {
        return service.paged(page == null ? 0 : page, size == null ? 10 : size);
    }

    @GET
    @Path("/{id}")
    public Uni<ControleProspectoResponse> find(@PathParam("id") Long id) {
        return service.find(id);
    }

    @POST
    public Uni<Response> create(@Valid ControleProspectoRequest r) {
        return service.create(r).map(item -> Response.status(Response.Status.CREATED).entity(item).build());
    }

    @PUT
    @Path("/{id}")
    public Uni<ControleProspectoResponse> update(@PathParam("id") Long id, @Valid ControleProspectoRequest r) {
        return service.update(id, r);
    }

    @DELETE
    @Path("/{id}")
    public Uni<Void> delete(@PathParam("id") Long id) {
        return service.delete(id);
    }

    @GET
    @Path("/carregar-prospecto-para-visualizacao")
    public Uni<List<ProspectoDetalheResponse>> carregarProspectoParaVisualizacao(@QueryParam("id") Integer id) {
        return service.carregarProspectoParaVisualizacao(id);
    }


    @GET
    @Path("/carregar-prospecto-para-visualizacao2")
    public Uni<List<ProspectoDetalheResponse>> carregarProspectoParaVisualizacao2(@QueryParam("id") String id) {
        return service.carregarProspectoParaVisualizacao2(id);
    }


    @GET
    @Path("/carregar-outros-prospecto")
    public Uni<List<ProspectoSimplesResponse>> carregarOutrosProspecto(@QueryParam("id") String id, @QueryParam("valor") String valor) {
        return service.carregarOutrosProspecto(id, valor);
    }

    @POST
    @Path("/salvar")
    public Uni<Response> salvar(@Valid AjustarProspectoRequest r) {
        return service.salvar(r.id(), r.outro())
                .map(v -> Response.ok().build());
    }

    @POST
    @Path("/salvar-selecionados")
    public Uni<Response> salvarSelecionados(@Valid AjustarProspectoRequest r) {
        return service.salvarSelecionados(r.id(), r.selectedIds())
                .map(v -> Response.ok().build());
    }

}