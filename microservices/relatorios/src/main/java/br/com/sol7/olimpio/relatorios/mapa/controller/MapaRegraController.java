package br.com.sol7.olimpio.relatorios.mapa;

import io.smallrye.mutiny.Uni;
import jakarta.inject.Inject;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;

import java.util.List;

@Path("/api/relatorios/mapa-regra")
@Produces(MediaType.APPLICATION_JSON)
public class MapaRegraController {

    @Inject
    MapaRegraService service;

    @GET
    @Path("/mapa/{mapaId}")
    public Uni<List<MapaRegraResponse>> findByMapaId(@PathParam("mapaId") Long mapaId) {
        return service.findByMapaId(mapaId);
    }
}