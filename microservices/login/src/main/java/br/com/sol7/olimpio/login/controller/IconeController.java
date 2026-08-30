package br.com.sol7.olimpio.login.controller;

import br.com.sol7.olimpio.login.permissao.entity.Icone;
import br.com.sol7.olimpio.login.permissao.service.IconeService;
import io.smallrye.mutiny.Uni;
import jakarta.inject.Inject;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.QueryParam;
import jakarta.ws.rs.core.MediaType;

import java.util.List;
import java.util.Set;

@Path("/api/icones")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class IconeController {

    @Inject
    IconeService iconeService;

    @GET
    public Uni<List<Icone>> listAll() {
        return iconeService.listAll();
    }

    @GET
    @Path("/versao/{versao}")
    public Uni<List<Icone>> listByVersao(@PathParam("versao") String versao) {
        return iconeService.listByVersao(versao);
    }

    @GET
    @Path("/search")
    public Uni<List<Icone>> search(@QueryParam("q") String termo) {
        return iconeService.search(termo);
    }

    @GET
    @Path("/count")
    public Uni<Long> count() {
        return iconeService.count();
    }

    @POST
    @Path("/bulk")
    public Uni<Void> createBulk(List<Icone> icones) {
        return iconeService.createAll(icones);
    }
}