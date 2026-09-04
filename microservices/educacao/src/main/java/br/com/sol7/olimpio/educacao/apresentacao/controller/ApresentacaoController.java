package br.com.sol7.olimpio.educacao.apresentacao;

import br.com.sol7.olimpio.educacao.apresentacaovideo.ApresentacaoVideoResponse;
import br.com.sol7.olimpio.shared.PagedResponse;
import io.smallrye.mutiny.Uni;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.*;
import org.jboss.resteasy.reactive.RestForm;
import org.jboss.resteasy.reactive.multipart.FileUpload;

import java.util.List;

@Path("/api/educacao/apresentacao")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class ApresentacaoController {
    @Inject
    ApresentacaoService service;

    @GET
    public Uni<List<ApresentacaoResponse>> list() {
        return service.list();
    }

    @GET
    @Path("/paged")
    public Uni<PagedResponse<ApresentacaoResponse>> paged(@QueryParam("page") Integer page, @QueryParam("size") Integer size) {
        return service.paged(page == null ? 0 : page, size == null ? 10 : size);
    }

    @GET
    @Path("/ordenado")
    public Uni<java.util.List<ApresentacaoResponse>> ordenado() {
        return service.ordenado();
    }

    @GET
    @Path("/imagens")
    public Uni<java.util.List<String>> imagens() {
        return service.imagens();
    }

    @GET
    @Path("/{id}")
    public Uni<ApresentacaoResponse> find(@PathParam("id") Long id) {
        return service.find(id);
    }

    @POST
    public Uni<Response> create(@Valid ApresentacaoRequest r) {
        return service.create(r).map(item -> Response.status(Response.Status.CREATED).entity(item).build());
    }

    @PUT
    @Path("/{id}")
    public Uni<ApresentacaoResponse> update(@PathParam("id") Long id, @Valid ApresentacaoRequest r) {
        return service.update(id, r);
    }

    @PUT
    @Path("/{id}/ordem")
    public Uni<ApresentacaoResponse> updateOrdem(@PathParam("id") Long id, @QueryParam("ordem") Integer ordem) {
        return service.updateOrdem(id, ordem);
    }

    @DELETE
    @Path("/{id}")
    public Uni<Void> delete(@PathParam("id") Long id) {
        return service.delete(id);
    }

    @POST
    @Path("/upload-imagem")
    @Consumes(MediaType.MULTIPART_FORM_DATA)
    @Produces(MediaType.APPLICATION_JSON)
    public Uni<ApresentacaoResponse> uploadImagem(
            @RestForm("file") FileUpload fileUpload,
            @RestForm("ordem") Integer ordem
    ) {
        return service.uploadImagem(fileUpload, ordem);
    }

    @POST
    @Path("/upload-video")
    @Consumes(MediaType.MULTIPART_FORM_DATA)
    @Produces(MediaType.APPLICATION_JSON)
    public Uni<ApresentacaoVideoResponse> uploadVideo(
            @RestForm("file") FileUpload fileUpload,
            @RestForm("titulo") String titulo
    ) {
        return service.uploadVideo(fileUpload, titulo);
    }
}
