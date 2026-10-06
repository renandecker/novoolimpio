package br.com.sol7.olimpio.basico.acesso.controller;

import br.com.sol7.olimpio.basico.acesso.dto.VerificarAcessoResponse;
import br.com.sol7.olimpio.basico.acesso.service.VerificarAcessoService;
import io.smallrye.mutiny.Uni;
import jakarta.inject.Inject;
import jakarta.ws.rs.BadRequestException;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.QueryParam;
import jakarta.ws.rs.container.ContainerRequestContext;
import jakarta.ws.rs.core.Context;
import jakarta.ws.rs.core.MediaType;

import java.util.Map;
import java.util.Set;

@Path("/api/basico/verificar-acesso")
@Produces(MediaType.APPLICATION_JSON)
public class VerificarAcessoController {

    @Inject
    VerificarAcessoService service;

    /**
     * Permissoes do usuario autenticado na tela informada. O caminho da tela e o
     * outcome de bas_modulo; a resposta sao os booleanos de bas_perfil_modulo dos
     * perfis do usuario. A rota fica atras do JwtAuthenticationFilter: o login vem
     * do token ja validado e nunca de um parametro da requisicao.
     */
    @GET
    public Uni<VerificarAcessoResponse> tela(@Context ContainerRequestContext context,
                                             @QueryParam("outcome") String outcome) {
        String usuario = usuarioAutenticado(context);
        if (outcome == null || outcome.isBlank()) {
            throw new BadRequestException("Informe o outcome da tela");
        }
        return service.porTela(usuario, outcome);
    }

    /**
     * Mapa outcome -> permissoes de todas as telas, no mesmo formato do claim
     * modulePermissions do JWT. Substitui o antigo /api/permissao/me, que vivia
     * no servico de login sem filtro e por isso devolvia sempre um mapa vazio.
     */
    @GET
    @Path("/todas")
    public Uni<Map<String, Set<String>>> todas(@Context ContainerRequestContext context) {
        return service.todasAsTelas(usuarioAutenticado(context));
    }

    private String usuarioAutenticado(ContainerRequestContext context) {
        Object valor = context.getProperty("authenticatedUser");
        return valor == null ? "" : valor.toString();
    }
}