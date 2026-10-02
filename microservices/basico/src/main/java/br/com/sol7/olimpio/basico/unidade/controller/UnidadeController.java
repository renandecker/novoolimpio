package br.com.sol7.olimpio.basico.unidade.controller;

import br.com.sol7.olimpio.basico.usuario.service.UsuarioService;
import br.com.sol7.olimpio.shared.PagedResponse;
import io.smallrye.mutiny.Uni;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.*;

import java.util.List;

import br.com.sol7.olimpio.basico.unidade.dto.UnidadeRequest;
import br.com.sol7.olimpio.basico.unidade.dto.UnidadeResponse;
import br.com.sol7.olimpio.basico.unidade.service.UnidadeService;
import br.com.sol7.olimpio.basico.unidade.dto.UnidadeIdsResponse;
import br.com.sol7.olimpio.basico.unidade.dto.UnidadePessoasResponse;
import br.com.sol7.olimpio.basico.unidade.dto.UnidadeUsuariosResponse;

@Path("/api/basico/unidade")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class UnidadeController {
    @Inject
    UnidadeService service;
    @Inject
    UsuarioService usuarioService;

    @GET
    public Uni<List<UnidadeResponse>> list() {
        return service.list();
    }

    @GET
    @Path("/paged")
    public Uni<PagedResponse<UnidadeResponse>> paged(@QueryParam("page") Integer page, @QueryParam("size") Integer size) {
        return service.paged(page == null ? 0 : page, size == null ? 10 : size);
    }

    @GET
    @Path("/{id}")
    public Uni<UnidadeResponse> find(@PathParam("id") Long id) {
        return service.find(id);
    }

    @POST
    public Uni<Response> create(@Valid UnidadeRequest r) {
        return service.create(r).map(item -> Response.status(Response.Status.CREATED).entity(item).build());
    }

    @PUT
    @Path("/{id}")
    public Uni<UnidadeResponse> update(@PathParam("id") Long id, @Valid UnidadeRequest r) {
        return service.update(id, r);
    }

    @DELETE
    @Path("/{id}")
    public Uni<Void> delete(@PathParam("id") Long id) {
        return service.delete(id);
    }

    @GET
    @Path("/carregar-usuarios/{unidadeId}/{usuarioLogadoId}")
    public Uni<UnidadeUsuariosResponse> carregarUsuarios(@PathParam("unidadeId") Long unidadeId, @PathParam("usuarioLogadoId") Long usuarioLogadoId) {
        return service.carregarUsuarios(unidadeId, usuarioLogadoId);
    }


    @GET
    @Path("/carregar-professores/{unidadeId}/{usuarioLogadoId}")
    public Uni<UnidadeIdsResponse> carregarProfessores(@PathParam("unidadeId") Long unidadeId, @PathParam("usuarioLogadoId") Long usuarioLogadoId) {
        return service.carregarProfessores(unidadeId, usuarioLogadoId);
    }


    @GET
    @Path("/carregar-curriculos/{unidadeId}/{usuarioLogadoId}")
    public Uni<UnidadeIdsResponse> carregarCurriculos(@PathParam("unidadeId") Long unidadeId, @PathParam("usuarioLogadoId") Long usuarioLogadoId) {
        return service.carregarCurriculos(unidadeId, usuarioLogadoId);
    }


    @GET
    @Path("/carregar-pessoas/{unidadeId}/{usuarioLogadoId}")
    public Uni<UnidadePessoasResponse> carregarPessoas(@PathParam("unidadeId") Long unidadeId, @PathParam("usuarioLogadoId") Long usuarioLogadoId) {
        return service.carregarPessoas(unidadeId, usuarioLogadoId);
    }


    @GET
    @Path("/carregar-turnos/{usuarioId}")
    public Uni<List<Long>> carregarTurnos(@PathParam("usuarioId") Long usuarioId) {
        return service.carregarTurnos(usuarioId);
    }


    @GET
    @Path("/auto-complete")
    public Uni<List<Long>> autoComplete(@QueryParam("query") String query) {
        return service.autoComplete(query);
    }


    @GET
    @Path("/buscar-unidade-com-telefones")
    public Uni<Long> buscarUnidadeComTelefones(@QueryParam("unidadeId") Long unidadeId) {
        return service.buscarUnidadeComTelefones(unidadeId);
    }


    @GET
    @Path("/buscar-unidades")
    public Uni<List<Long>> buscarUnidades() {
        return service.buscarUnidades();
    }


    @GET
    @Path("/auto-complete-all")
    public Uni<List<Long>> autoCompleteAll() {
        return service.autoCompleteAll();
    }


    @GET
    @Path("/buscar-todos")
    public Uni<List<Long>> buscarTodos() {
        return service.buscarTodos();
    }


    @GET
    @Path("/auto-complete-com-usuario")
    public Uni<List<Long>> autoCompleteComUsuario(@QueryParam("query") String query, @QueryParam("usuarioId") Long usuarioId) {
        return service.autoCompleteComUsuario(query, usuarioId);
    }


    @GET
    @Path("/auto-complete-do-usuario")
    public Uni<List<Long>> autoCompleteDoUsuario(@QueryParam("usuarioId") Long usuarioId) {
        return service.autoCompleteDoUsuario(usuarioId);
    }


    @GET
    @Path("/auto-complete-com-curriculo-sem-busca")
    public Uni<List<Long>> autoCompleteComCurriculoSemBusca(@QueryParam("unidades") List<Long> unidades) {
        return service.autoCompleteComCurriculoSemBusca(unidades);
    }


    @GET
    @Path("/auto-complete-unidade-usuario")
    public Uni<List<Long>> autoCompleteUnidadeUsuario(@HeaderParam("X-Authenticated-Username") String username, @QueryParam("query") String query) {
        return usuarioService.buscarUnidadesDisponiveisPorUsername(username)
                .onItem().transformToUni(unidadesIds -> service.autoCompleteUnidadeUsuario(query, unidadesIds));
    }


    @GET
    @Path("/auto-complete-com-unidades")
    public Uni<List<Long>> autoCompleteComUnidades(@QueryParam("query") String query, @QueryParam("unidades") List<Long> unidades) {
        return service.autoCompleteComUnidades(query, unidades);
    }


    @GET
    @Path("/buscar-unidade-com-turnos-dia-semana")
    public Uni<List<Long>> buscarUnidadeComTurnosDiaSemana(@HeaderParam("X-Authenticated-Username") String username, @QueryParam("diaSemana") Integer diaSemana) {
        return usuarioService.buscarUsuarioIdPorUsername(username)
                .onItem().transformToUni(usuarioId -> service.buscarUnidadeComTurnosDiaSemana(diaSemana, usuarioId));
    }


    @GET
    @Path("/buscar-unidade")
    public Uni<List<Long>> buscarUnidade(@QueryParam("regiaoId") Long regiaoId) {
        return service.buscarUnidade(regiaoId);
    }


    @GET
    @Path("/buscar-unidade-da-ligacao")
    public Uni<Long> buscarUnidadeDaLigacao(@QueryParam("operacionalId") Long operacionalId) {
        return service.buscarUnidadeDaLigacao(operacionalId);
    }


    @GET
    @Path("/buscar-unidade-com-turnos")
    public Uni<Long> buscarUnidadeComTurnos(@QueryParam("entityId") Long entityId) {
        return service.buscarUnidadeComTurnos(entityId);
    }


    @GET
    @Path("/auto-complete-grupo")
    public Uni<List<Long>> autoCompleteGrupo(@QueryParam("query") String query, @QueryParam("grupoId") Long grupoId) {
        return service.autoCompleteGrupo(query, grupoId);
    }


    @GET
    @Path("/auto-complete-all-grupo")
    public Uni<List<Long>> autoCompleteAllGrupo(@QueryParam("grupoId") Long grupoId) {
        return service.autoCompleteAllGrupo(grupoId);
    }


    @GET
    @Path("/auto-complete-com-usuario-grupo")
    public Uni<List<Long>> autoCompleteComUsuarioGrupo(@QueryParam("query") String query, @QueryParam("usuarioId") Long usuarioId, @QueryParam("grupoId") Long grupoId) {
        return service.autoCompleteComUsuarioGrupo(query, usuarioId, grupoId);
    }


    @GET
    @Path("/auto-complete-do-usuario-grupo")
    public Uni<List<Long>> autoCompleteDoUsuarioGrupo(@QueryParam("usuarioId") Long usuarioId, @QueryParam("grupoId") Long grupoId) {
        return service.autoCompleteDoUsuarioGrupo(usuarioId, grupoId);
    }

}