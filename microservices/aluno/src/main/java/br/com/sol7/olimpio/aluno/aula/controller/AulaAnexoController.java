package br.com.sol7.olimpio.aluno.aula.controller;

import br.com.sol7.olimpio.aluno.aula.dto.AulaDtos.AulaAnexoResponse;
import br.com.sol7.olimpio.aluno.aula.service.AulaAnexoService;
import io.smallrye.mutiny.Uni;
import jakarta.inject.Inject;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.QueryParam;
import jakarta.ws.rs.core.MediaType;

import java.util.List;

@Path("/api/aluno/aula-anexo")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class AulaAnexoController {

    @Inject
    AulaAnexoService service;

    @GET
    @Path("/por-aula")
    public Uni<List<AulaAnexoResponse>> anexosDaAula(@QueryParam("aulaId") Long aulaId) {
        return service.anexosDaAula(aulaId);
    }
}
