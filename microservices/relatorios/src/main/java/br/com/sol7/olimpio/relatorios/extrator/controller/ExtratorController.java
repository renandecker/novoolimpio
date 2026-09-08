package br.com.sol7.olimpio.relatorios.extrator;

import br.com.sol7.olimpio.shared.PagedResponse;
import br.com.sol7.olimpio.relatorios.extrator.dto.ExportRequest;
import io.smallrye.mutiny.Uni;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.*;

import java.util.List;

@Path("/api/relatorios/extrator")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class ExtratorController {
    @Inject
    ExtratorService service;

    @GET
    public Uni<List<ExtratorResponse>> list() {
        return service.list();
    }

    @GET
    @Path("/paged")
    public Uni<PagedResponse<ExtratorResponse>> paged(@QueryParam("page") Integer page, @QueryParam("size") Integer size) {
        return service.paged(page == null ? 0 : page, size == null ? 10 : size);
    }

    @GET
    @Path("/{id}")
    public Uni<ExtratorResponse> find(@PathParam("id") Long id) {
        return service.find(id);
    }

    @POST
    public Uni<Response> create(@Valid ExtratorRequest r) {
        return service.create(r).map(item -> Response.status(Response.Status.CREATED).entity(item).build());
    }

    @PUT
    @Path("/{id}")
    public Uni<ExtratorResponse> update(@PathParam("id") Long id, @Valid ExtratorRequest r) {
        return service.update(id, r);
    }

    @DELETE
    @Path("/{id}")
    public Uni<Void> delete(@PathParam("id") Long id) {
        return service.delete(id);
    }

    @GET
    @Path("/carregarextrator")
    public Uni<String> carregarextrator() {
        return service.carregarextrator();
    }

    @POST
    @Path("/{id}/reiniciar")
    public Uni<ExtratorResponse> reiniciar(@PathParam("id") Long id) {
        return service.reiniciar(id);
    }

    @GET
    @Path("/{id}/arquivo")
    public Uni<Response> arquivo(@PathParam("id") Long id, @QueryParam("tipo") String tipo) {
        String t = "PDF".equalsIgnoreCase(tipo) ? "PDF" : "CSV";
        return service.arquivo(id, t).map(file -> Response.ok(file)
                .type("PDF".equals(t) ? MediaType.APPLICATION_OCTET_STREAM : "text/csv")
                .header("Content-Disposition", "attachment; filename=\"" + id + "." + ("PDF".equals(t) ? "pdf" : "csv") + "\"")
                .build());
    }

    @POST
    @Path("/remover")
    public Uni<Void> remover() {
        return service.remover();
    }

    @POST
    @Path("/exportar")
    public Uni<ExtratorResponse> exportar(ExportRequest request) {
        return service.solicitarExportacao(request.tabelaId(), request.usuarioId(), request.tipo(), request.filtros());
    }

}