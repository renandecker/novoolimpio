package br.com.sol7.olimpio.educacao.auditoria;

import br.com.sol7.olimpio.educacao.auditoria.dto.AuditoriaResponse;
import br.com.sol7.olimpio.educacao.shared.PagedResponse;
import io.smallrye.mutiny.Uni;
import jakarta.inject.Inject;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.QueryParam;
import jakarta.ws.rs.core.MediaType;

@Path("/api/educacao/auditoria")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class AuditoriaController {

    @Inject
    AuditoriaService service;

    @GET
    public Uni<PagedResponse<AuditoriaResponse>> paged(
            @QueryParam("entidade") String entidade,
            @QueryParam("page") Integer page,
            @QueryParam("size") Integer size) {
        return service.paged(entidade, page == null ? 0 : page, size == null ? 10 : size);
    }
}

