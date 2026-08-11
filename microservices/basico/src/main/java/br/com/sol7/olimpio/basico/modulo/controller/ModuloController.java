package br.com.sol7.olimpio.basico.modulo.controller;
import br.com.sol7.olimpio.basico.usuarioperfil.repository.UsuarioPerfilRepository;
import br.com.sol7.olimpio.shared.PagedResponse;
import io.smallrye.mutiny.Uni; import jakarta.inject.Inject; import jakarta.validation.Valid; import jakarta.ws.rs.*; import jakarta.ws.rs.core.*; import java.util.List;
import java.util.stream.Collectors;
import br.com.sol7.olimpio.basico.modulo.dto.ModuloMenuResponse;
import br.com.sol7.olimpio.basico.modulo.dto.ModuloRequest;
import br.com.sol7.olimpio.basico.modulo.dto.ModuloResponse;
import br.com.sol7.olimpio.basico.modulo.service.ModuloService;
@Path("/api/basico/modulo") @Produces(MediaType.APPLICATION_JSON) @Consumes(MediaType.APPLICATION_JSON) public class ModuloController { @Inject ModuloService service; @GET public Uni<List<ModuloResponse>> list(){return service.list();} @GET @Path("/paged") public Uni<PagedResponse<ModuloResponse>> paged(@QueryParam("page") Integer page,@QueryParam("size") Integer size){return service.paged(page==null?0:page,size==null?10:size);} @GET @Path("/{id}") public Uni<ModuloResponse> find(@PathParam("id") Long id){return service.find(id);}@POST public Uni<Response> create(@Valid ModuloRequest r){return service.create(r).map(item->Response.status(Response.Status.CREATED).entity(item).build());}@PUT @Path("/{id}") public Uni<ModuloResponse> update(@PathParam("id") Long id,@Valid ModuloRequest r){return service.update(id,r);}@DELETE @Path("/{id}") public Uni<Void> delete(@PathParam("id") Long id){return service.delete(id);}

    @GET
    @Path("/menu")
    public Uni<List<ModuloMenuResponse>> menu() {
        return service.list().onItem().transform(modulos -> {
            return modulos.stream()
                .map(m -> new ModuloMenuResponse(m.id(), m.antecessorId(), m.rotulo(), m.descricao(), m.icone(), m.ajuda(), m.outcome(), m.ordem()))
                .collect(Collectors.toList());
        });
    }

    @GET
    @Path("/verificar-antecessor")
    public Uni<Boolean> verificarAntecessor(@QueryParam("moduloId") Long moduloId) {
        return service.verificarAntecessor(moduloId);
    }

    @GET
    @Path("/carregar-perfis")
    public Uni<Void> carregarPerfis(@QueryParam("moduloId") Long moduloId) {
        return service.carregarPerfis(moduloId);
    }

    @GET
    @Path("/auto-complete")
    public Uni<List<Long>> autoComplete(@QueryParam("query") String query) {
        return service.autoComplete(query);
    }

    @GET
    @Path("/auto-complete-antecessor")
    public Uni<List<Long>> autoCompleteAntecessor(@QueryParam("query") String query) {
        return service.autoCompleteAntecessor(query);
    }

    @GET
    @Path("/auto-complete-antecessor-outcome")
    public Uni<List<Long>> autoCompleteAntecessorOutcome(@QueryParam("query") String query) {
        return service.autoCompleteAntecessorOutcome(query);
    }

    @GET
    @Path("/buscar-por-outcome")
    public Uni<Long> buscarPorOutcome(@QueryParam("url") String url) {
        return service.buscarPorOutcome(url);
    }

    @GET
    @Path("/auto-complete-favorito")
    public Uni<List<Long>> autoCompleteFavorito(@QueryParam("perfilId") Long perfilId, @QueryParam("query") String query) {
        return service.autoCompleteFavorito(perfilId, query);
    }

    @GET
    @Path("/buscar-por-rotulo")
    public Uni<Long> buscarPorRotulo(@QueryParam("id") String id) {
        return service.buscarPorRotulo(id);
    }

    @GET
    @Path("/buscar-antecesso-por-rotulo")
    public Uni<List<Long>> buscarAntecessoPorRotulo(@QueryParam("moduloId") Long moduloId) {
        return service.buscarAntecessoPorRotulo(moduloId);
    }

}