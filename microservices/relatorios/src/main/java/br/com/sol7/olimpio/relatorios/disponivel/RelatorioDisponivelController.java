package br.com.sol7.olimpio.relatorios.disponivel;

import io.smallrye.mutiny.Uni;
import jakarta.inject.Inject;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.HeaderParam;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;

import java.util.List;

@Path("/api/relatorios/relatorio/disponiveis")
@Produces(MediaType.APPLICATION_JSON)
public class RelatorioDisponivelController {

    @Inject RelatorioDisponivelService service;

    @GET
    public Uni<List<RelatorioDisponivelResponse>> listar(@HeaderParam("X-Authenticated-Username") String username) {
        return service.listarDisponiveis(username);
    }
}
