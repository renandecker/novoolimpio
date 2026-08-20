package br.com.sol7.olimpio.basico.logradouro.controller;

import br.com.sol7.olimpio.shared.PagedResponse;
import io.smallrye.mutiny.Uni;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.*;

import java.util.List;

import br.com.sol7.olimpio.basico.logradouro.dto.LogradouroRequest;
import br.com.sol7.olimpio.basico.logradouro.dto.LogradouroResponse;
import br.com.sol7.olimpio.basico.logradouro.service.LogradouroService;

@Path("/api/basico/logradouro")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class LogradouroController {
    @Inject
    LogradouroService service;

    @GET
    public Uni<List<LogradouroResponse>> list() {
        return service.list();
    }

    @GET
    @Path("/paged")
    public Uni<PagedResponse<LogradouroResponse>> paged(@QueryParam("page") Integer page, @QueryParam("size") Integer size) {
        return service.paged(page == null ? 0 : page, size == null ? 10 : size);
    }

    @GET
    @Path("/{id}")
    public Uni<LogradouroResponse> find(@PathParam("id") Long id) {
        return service.find(id);
    }

    @POST
    public Uni<Response> create(@Valid LogradouroRequest r) {
        return service.create(r).map(item -> Response.status(Response.Status.CREATED).entity(item).build());
    }

    @PUT
    @Path("/{id}")
    public Uni<LogradouroResponse> update(@PathParam("id") Long id, @Valid LogradouroRequest r) {
        return service.update(id, r);
    }

    @DELETE
    @Path("/{id}")
    public Uni<Void> delete(@PathParam("id") Long id) {
        return service.delete(id);
    }

    @POST
    @Path("/atualizar-todos-logradouro")
    public Uni<Void> atualizarTodosLogradouro() {
        return service.atualizarTodosLogradouro();
    }


    @POST
    @Path("/atualizar-todos-coordenada-a-p-i")
    public Uni<Void> atualizarTodosCoordenadaAPI() {
        return service.atualizarTodosCoordenadaAPI();
    }


    @POST
    @Path("/atualizar-coordenada-a-p-i")
    public Uni<Void> atualizarCoordenadaAPI(@QueryParam("logradouroId") Long logradouroId, @QueryParam("token") String token) {
        return service.atualizarCoordenadaAPI(logradouroId, token);
    }


    @POST
    @Path("/atualizar-logradouro")
    public Uni<Void> atualizarLogradouro(@QueryParam("logradouroId") Long logradouroId) {
        return service.atualizarLogradouro(logradouroId);
    }


    @GET
    @Path("/auto-complete")
    public Uni<List<Long>> autoComplete(@QueryParam("query") String query) {
        return service.autoComplete(query);
    }


    @GET
    @Path("/auto-complete-cidade-edita")
    public Uni<List<Long>> autoCompleteCidadeEdita(@QueryParam("query") String query) {
        return service.autoCompleteCidadeEdita(query);
    }


    @GET
    @Path("/auto-complete-cidade")
    public Uni<List<Long>> autoCompleteCidade(@QueryParam("query") String query) {
        return service.autoCompleteCidade(query);
    }


    @GET
    @Path("/auto-complete-bairro-edita")
    public Uni<List<Long>> autoCompleteBairroEdita(@QueryParam("query") String query) {
        return service.autoCompleteBairroEdita(query);
    }


    @GET
    @Path("/auto-complete-bairro")
    public Uni<List<Long>> autoCompleteBairro(@QueryParam("query") String query) {
        return service.autoCompleteBairro(query);
    }


    @GET
    @Path("/auto-complete-logradouro")
    public Uni<List<Long>> autoCompleteLogradouro(@QueryParam("query") String query) {
        return service.autoCompleteLogradouro(query);
    }


    @GET
    @Path("/auto-complete-logradouro-troca")
    public Uni<List<Long>> autoCompleteLogradouroTroca(@QueryParam("query") String query) {
        return service.autoCompleteLogradouroTroca(query);
    }


    @GET
    @Path("/auto-complete-logradouro-busca")
    public Uni<List<Long>> autoCompleteLogradouroBusca(@QueryParam("query") String query) {
        return service.autoCompleteLogradouroBusca(query);
    }


    @GET
    @Path("/buscar-endereco-cadastro")
    public Uni<Void> buscarEnderecoCadastro(@QueryParam("cep") String cep) {
        return service.buscarEnderecoCadastro(cep);
    }


    @GET
    @Path("/buscar-endereco")
    public Uni<Void> buscarEndereco() {
        return service.buscarEndereco();
    }


    @GET
    @Path("/auto-complete-com-bairro")
    public Uni<List<Long>> autoCompleteComBairro(@QueryParam("query") String query, @QueryParam("bairroId") Long bairroId) {
        return service.autoCompleteComBairro(query, bairroId);
    }


    @POST
    @Path("/atualizar")
    public Uni<Void> atualizar() {
        return service.atualizar();
    }

}