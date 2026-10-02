package br.com.sol7.olimpio.basico.usuario.controller;

import br.com.sol7.olimpio.shared.PagedResponse;
import io.smallrye.mutiny.Uni;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.container.ContainerRequestContext;
import jakarta.ws.rs.core.*;
import org.eclipse.microprofile.config.inject.ConfigProperty;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.util.List;

import br.com.sol7.olimpio.basico.usuario.dto.UsuarioFotoRequest;
import br.com.sol7.olimpio.basico.usuario.dto.UsuarioRequest;
import br.com.sol7.olimpio.basico.usuario.dto.UsuarioResponse;
import br.com.sol7.olimpio.basico.usuario.service.FileStorageService;
import br.com.sol7.olimpio.basico.usuario.service.UsuarioService;
import br.com.sol7.olimpio.basico.usuario.dto.UsuarioDetalheResponse;
import org.jboss.resteasy.reactive.RestForm;
import org.jboss.resteasy.reactive.multipart.FileUpload;

@Path("/api/basico/usuario")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class UsuarioController {

    @Inject
    UsuarioService service;

    @Inject
    FileStorageService fileStorageService;

    @ConfigProperty(name = "olimpio.storage.foto-usuario-path", defaultValue = "fotousuario")
    String fotoUsuarioPath;

    @GET
    public Uni<List<UsuarioResponse>> list() {
        return service.list();
    }

    @GET
    @Path("/paged")
    public Uni<PagedResponse<UsuarioResponse>> paged(
            @QueryParam("page") Integer page,
            @QueryParam("size") Integer size) {
        return service.paged(page == null ? 0 : page, size == null ? 10 : size);
    }

    @GET
    @Path("/{id}")
    public Uni<UsuarioResponse> find(@PathParam("id") Long id) {
        return service.find(id);
    }

    @GET
    @Path("/atual")
    public Uni<UsuarioResponse> atual(@HeaderParam("X-Authenticated-Username") String username) {
        return service.buscarPorUsername(username);
    }

    // ── Sub-recursos de acesso (Acessos no formUsuario): perfis, agendas e unidades ──
    @GET
    @Path("/{id}/perfis")
    public Uni<List<Long>> listarPerfis(@PathParam("id") Long id) {
        return service.listarPerfis(id);
    }

    @PUT
    @Path("/{id}/perfis")
    public Uni<Void> substituirPerfis(@PathParam("id") Long id, List<Long> perfis) {
        return service.substituirPerfis(id, perfis);
    }

    @GET
    @Path("/{id}/agendas")
    public Uni<List<Long>> listarAgendas(@PathParam("id") Long id) {
        return service.listarAgendas(id);
    }

    @PUT
    @Path("/{id}/agendas")
    public Uni<Void> substituirAgendas(@PathParam("id") Long id, List<Long> agendas) {
        return service.substituirAgendas(id, agendas);
    }

    @GET
    @Path("/{id}/unidades")
    public Uni<List<Long>> listarUnidades(@PathParam("id") Long id) {
        return service.listarUnidades(id);
    }

    @PUT
    @Path("/{id}/unidades")
    public Uni<Void> substituirUnidades(@PathParam("id") Long id, List<Long> unidades) {
        return service.substituirUnidades(id, unidades);
    }

    @POST
    public Uni<Response> create(@Valid UsuarioRequest r) {
        return service.create(r).map(item -> Response.status(Response.Status.CREATED).entity(item).build());
    }

    @PUT
    @Path("/foto")
    public Uni<UsuarioResponse> atualizarFoto(@Context ContainerRequestContext ctx, UsuarioFotoRequest r) {
        Object user = ctx.getProperty("authenticatedUser");
        String username = user == null ? "" : user.toString();
        return service.atualizarFoto(username, r.foto());
    }

    @PUT
    @Path("/foto-base64")
    public Uni<UsuarioResponse> atualizarFotoBase64(@Context ContainerRequestContext ctx, UsuarioFotoRequest r) {
        Object user = ctx.getProperty("authenticatedUser");
        String username = user == null ? "" : user.toString();
        return service.atualizarFotoBase64(username, r.foto());
    }

    @POST
    @Path("/foto-upload")
    @Consumes(MediaType.MULTIPART_FORM_DATA)
    @Produces(MediaType.APPLICATION_JSON)
    public Uni<UsuarioResponse> uploadFoto(@Context ContainerRequestContext ctx,
                                           @RestForm("file") FileUpload file) {
        Object user = ctx.getProperty("authenticatedUser");
        String username = user == null ? "" : user.toString();
        try (InputStream is = Files.newInputStream(file.uploadedFile())) {
            String relativePath = fileStorageService.saveFotoUsuario(username, is, file.fileName());
            String fotoUrl = "/app-resources/" + relativePath;
            return service.atualizarFoto(username, fotoUrl);
        } catch (IOException e) {
            return Uni.createFrom().failure(new WebApplicationException("Erro ao fazer upload da foto", Response.Status.INTERNAL_SERVER_ERROR));
        }
    }

    @PUT
    @Path("/{id}")
    public Uni<UsuarioResponse> update(
            @PathParam("id") Long id,
            @Valid UsuarioRequest r) {
        return service.update(id, r);
    }

    @DELETE
    @Path("/{id}")
    public Uni<Void> delete(@PathParam("id") Long id) {
        return service.delete(id);
    }

    @POST
    @Path("/gerar-login")
    public Uni<String> gerarLogin(@QueryParam("pessoaId") Long pessoaId) {
        return service.gerarLogin(pessoaId);
    }

    @GET
    @Path("/verificar-existencia")
    public Uni<Boolean> verificarExistencia(@QueryParam("id") Integer id, @QueryParam("idpessoa") Integer idpessoa, @QueryParam("nome") String nome, @QueryParam("cpf") String cpf, @QueryParam("rg") String rg, @QueryParam("email") String email) {
        return service.verificarExistencia(id, idpessoa, nome, cpf, rg, email);
    }

    @GET
    @Path("/buscar-detalhes/{id}")
    public Uni<UsuarioDetalheResponse> buscarDetalhes(@PathParam("id") Long id) {
        return service.buscarDetalhes(id);
    }

    @GET
    @Path("/auto-complete")
    public Uni<List<Long>> autoComplete(@HeaderParam("X-Authenticated-Username") String username, @QueryParam("query") String query) {
        return service.buscarUsuarioIdPorUsername(username)
                .chain(usuarioId -> service.buscarUnidadesDisponiveis(usuarioId))
                .chain(unidadesIds -> service.autoComplete(query, true, unidadesIds));
    }

    @POST
    @Path("/gerar-relatorio")
    public Uni<String> gerarRelatorio(@QueryParam("localRelatorio") String localRelatorio, @QueryParam("lista") String lista, @QueryParam("nomeArquivoSaida") String nomeArquivoSaida) {
        return service.gerarRelatorio(localRelatorio, lista, nomeArquivoSaida);
    }

    @GET
    @Path("/carregar-turnos/{id}")
    public Uni<List<Long>> carregarTurnos(@PathParam("id") Long id) {
        return service.carregarTurnos(id);
    }

    @GET
    @Path("/auto-complete-pessoa-fisica-unidade")
    public Uni<List<Long>> autoCompletePessoaFisicaUnidade(@QueryParam("query") String query, @QueryParam("unidadeId") Long unidadeId) {
        return service.autoCompletePessoaFisicaUnidade(query, unidadeId);
    }

    @GET
    @Path("/auto-complete-pessoa-juridica-unidade")
    public Uni<List<Long>> autoCompletePessoaJuridicaUnidade(@QueryParam("query") String query, @QueryParam("unidadeId") Long unidadeId) {
        return service.autoCompletePessoaJuridicaUnidade(query, unidadeId);
    }

    @GET
    @Path("/buscar-usuario-com-turnos")
    public Uni<Long> buscarUsuarioComTurnos(@QueryParam("entityId") Long entityId) {
        return service.buscarUsuarioComTurnos(entityId);
    }

    @GET
    @Path("/buscar-usuario-por-perfil")
    public Uni<List<Long>> buscarUsuarioPorPerfil(@QueryParam("perfilId") Long perfilId) {
        return service.buscarUsuarioPorPerfil(perfilId);
    }

    @GET
    @Path("/buscar-usuario-por-unidades")
    public Uni<List<Long>> buscarUsuarioPorUnidades(@QueryParam("unidade") List<Long> unidade) {
        return service.buscarUsuarioPorUnidades(unidade);
    }

    @GET
    @Path("/buscar-usuario-por-unidade")
    public Uni<List<Long>> buscarUsuarioPorUnidade(@QueryParam("unidadeId") Long unidadeId) {
        return service.buscarUsuarioPorUnidade(unidadeId);
    }

    @GET
    @Path("/auto-complete-usuario")
    public Uni<List<Long>> autoCompleteUsuario(@QueryParam("query") String query, @QueryParam("unidadeId") Long unidadeId) {
        return service.autoCompleteUsuario(query, unidadeId);
    }

    @GET
    @Path("/buscar-unidades-disponiveis")
    public Uni<List<Long>> buscarUnidadesDisponiveis(@QueryParam("usuarioId") Long usuarioId) {
        return service.buscarUnidadesDisponiveis(usuarioId);
    }

    @GET
    @Path("/buscar-unidades-disponiveis-rede")
    public Uni<List<Long>> buscarUnidadesDisponiveisRede(@QueryParam("usuarioId") Long usuarioId) {
        return service.buscarUnidadesDisponiveisRede(usuarioId);
    }

    @GET
    @Path("/buscar-usuario-com-unidades")
    public Uni<Long> buscarUsuarioComUnidades(@QueryParam("entityId") Long entityId) {
        return service.buscarUsuarioComUnidades(entityId);
    }

    @GET
    @Path("/buscar-usuario-com-agendas")
    public Uni<Long> buscarUsuarioComAgendas(@QueryParam("entityId") Long entityId) {
        return service.buscarUsuarioComAgendas(entityId);
    }

    @GET
    @Path("/buscar-agendas-disponiveis")
    public Uni<List<Long>> buscarAgendasDisponiveis(@QueryParam("usuarioId") Long usuarioId) {
        return service.buscarAgendasDisponiveis(usuarioId);
    }

    @GET
    @Path("/buscar-consultores-com-agenda")
    public Uni<List<Long>> buscarConsultoresComAgenda(@QueryParam("agendaId") Long agendaId, @QueryParam("diaSemana") Integer diaSemana) {
        return service.buscarConsultoresComAgenda(agendaId, diaSemana);
    }

    @GET
    @Path("/buscar-login-existente")
    public Uni<Boolean> buscarLoginExistente(@QueryParam("login") String login) {
        return service.buscarLoginExistente(login);
    }

    @GET
    @Path("/buscar-login-eemail-existente")
    public Uni<Boolean> buscarLoginEemailExistente(@QueryParam("login") String login, @QueryParam("email") String email) {
        return service.buscarLoginEemailExistente(login, email);
    }

    @GET
    @Path("/buscar-usuario-com-perfil")
    public Uni<Long> buscarUsuarioComPerfil(@QueryParam("entityId") Long entityId) {
        return service.buscarUsuarioComPerfil(entityId);
    }

    @GET
    @Path("/buscar-usuario-seu-perfil")
    public Uni<List<Long>> buscarUsuarioSeuPerfil(@QueryParam("entityId") Long entityId) {
        return service.buscarUsuarioSeuPerfil(entityId);
    }

    @GET
    @Path("/auto-complete-com-unidade")
    public Uni<List<Long>> autoCompleteComUnidade(@QueryParam("query") String query, @QueryParam("unidades") List<Long> unidades) {
        return service.autoCompleteComUnidade(query, unidades);
    }

    @GET
    @Path("/auto-complete-com-unidade-dia-semana-agenda")
    public Uni<List<Long>> autoCompleteComUnidadeDiaSemanaAgenda(@HeaderParam("X-Authenticated-Username") String username, @QueryParam("query") String query, @QueryParam("diaSemana") Integer diaSemana, @QueryParam("agendaId") Long agendaId) {
        return service.buscarUnidadesDisponiveisPorUsername(username)
                .chain(unidadesIds -> service.autoCompleteComUnidadeDiaSemanaAgenda(query, diaSemana, agendaId, unidadesIds));
    }

    @GET
    @Path("/auto-complete-com-unidade-dia-semana-agenda-com-perfil")
    public Uni<List<Long>> autoCompleteComUnidadeDiaSemanaAgendaComPerfil(@HeaderParam("X-Authenticated-Username") String username, @QueryParam("query") String query, @QueryParam("diaSemana") Integer diaSemana, @QueryParam("agendaId") Long agendaId, @QueryParam("perfilId") Long perfilId) {
        return service.buscarUnidadesDisponiveisPorUsername(username)
                .chain(unidadesIds -> service.autoCompleteComUnidadeDiaSemanaAgendaComPerfil(query, diaSemana, agendaId, perfilId, unidadesIds));
    }

    @GET
    @Path("/auto-complete-com-unidade-dia-semana")
    public Uni<List<Long>> autoCompleteComUnidadeDiaSemana(@HeaderParam("X-Authenticated-Username") String username, @QueryParam("query") String query, @QueryParam("diaSemana") Integer diaSemana) {
        return service.buscarUnidadesDisponiveisPorUsername(username)
                .chain(unidadesIds -> service.autoCompleteComUnidadeDiaSemana(query, diaSemana, unidadesIds));
    }

}