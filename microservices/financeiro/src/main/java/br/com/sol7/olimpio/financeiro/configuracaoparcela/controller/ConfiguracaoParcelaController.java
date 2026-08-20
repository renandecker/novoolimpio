package br.com.sol7.olimpio.financeiro.configuracaoparcela;

import br.com.sol7.olimpio.shared.PagedResponse;
import io.smallrye.mutiny.Uni;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.*;

import java.util.List;

@Path("/api/financeiro/configuracao-parcela")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class ConfiguracaoParcelaController {
    @Inject
    ConfiguracaoParcelaService service;

    @GET
    public Uni<List<ConfiguracaoParcelaResponse>> list() {
        return service.list();
    }

    @GET
    @Path("/paged")
    public Uni<PagedResponse<ConfiguracaoParcelaResponse>> paged(@QueryParam("page") Integer page, @QueryParam("size") Integer size) {
        return service.paged(page == null ? 0 : page, size == null ? 10 : size);
    }

    @GET
    @Path("/{id}")
    public Uni<ConfiguracaoParcelaResponse> find(@PathParam("id") Long id) {
        return service.find(id);
    }

    @POST
    public Uni<Response> create(@Valid ConfiguracaoParcelaRequest r) {
        return service.create(r).map(item -> Response.status(Response.Status.CREATED).entity(item).build());
    }

    @PUT
    @Path("/{id}")
    public Uni<ConfiguracaoParcelaResponse> update(@PathParam("id") Long id, @Valid ConfiguracaoParcelaRequest r) {
        return service.update(id, r);
    }

    @DELETE
    @Path("/{id}")
    public Uni<Void> delete(@PathParam("id") Long id) {
        return service.delete(id);
    }

    @GET
    @Path("/carregar-novo-cancelamento")
    public Uni<Void> carregarNovoCancelamento() {
        return service.carregarNovoCancelamento();
    }


    @GET
    @Path("/buscar-conf")
    public Uni<Long> buscarConf(@QueryParam("unidadeId") Long unidadeId) {
        return service.buscarConf(unidadeId);
    }


    @GET
    @Path("/buscar-conf2")
    public Uni<Long> buscarConf2(@QueryParam("unidadeId") Long unidadeId, @QueryParam("id") Integer id) {
        return service.buscarConf2(unidadeId, id);
    }


    @GET
    @Path("/buscar-conf-com-unidades")
    public Uni<List<Long>> buscarConfComUnidades(@QueryParam("unidade") List<Long> unidade) {
        return service.buscarConfComUnidades(unidade);
    }


    @GET
    @Path("/buscar-conf-com-unidades-not-cancelamento")
    public Uni<List<Long>> buscarConfComUnidadesNotCancelamento(@QueryParam("unidade") List<Long> unidade) {
        return service.buscarConfComUnidadesNotCancelamento(unidade);
    }

}