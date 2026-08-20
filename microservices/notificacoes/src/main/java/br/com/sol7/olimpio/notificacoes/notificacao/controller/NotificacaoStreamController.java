package br.com.sol7.olimpio.notificacoes.notificacao.controller;

import br.com.sol7.olimpio.notificacoes.notificacao.service.NotificacaoSseHub;
import br.com.sol7.olimpio.shared.security.JwtTokenService;
import io.smallrye.mutiny.Multi;
import jakarta.inject.Inject;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.NotFoundException;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.QueryParam;
import jakarta.ws.rs.WebApplicationException;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

/**
 * Streaming em tempo real (Server-Sent Events) das notificacoes por canal.
 * <ul>
 * <li>GET /api/notificacoes/stream/WEB    -> react web</li>
 * <li>GET /api/notificacoes/stream/MOBILE -> react native</li>
 * </ul>
 * Autenticacao via token no query param (?token=...) porque o EventSource dos
 * navegadores nao permite cabecalho Authorization.
 */
@Path("/api/notificacoes/stream")
public class NotificacaoStreamController {

    @Inject
    NotificacaoSseHub hub;

    @Inject
    JwtTokenService jwt;

    @GET
    @Path("/{canal}")
    @Produces(MediaType.SERVER_SENT_EVENTS)
    public Multi<String> stream(@PathParam("canal") String canal, @QueryParam("token") String token) {
        String c = canal == null ? "" : canal.toUpperCase().trim();
        if (!NotificacaoSseHub.CANAL_WEB.equals(c) && !NotificacaoSseHub.CANAL_MOBILE.equals(c)) {
            throw new NotFoundException("Canal inválido. Use WEB ou MOBILE.");
        }
        String username = autenticar(token);
        return hub.subscribe(c, username);
    }

    private String autenticar(String token) {
        if (token == null || token.isBlank()) {
            throw new WebApplicationException(Response.status(Response.Status.UNAUTHORIZED)
                    .entity(java.util.Map.of("error", "Token ausente")).build());
        }
        try {
            return jwt.verify(token).subject();
        } catch (IllegalArgumentException e) {
            throw new WebApplicationException(Response.status(Response.Status.UNAUTHORIZED)
                    .entity(java.util.Map.of("error", "Token inválido ou expirado")).build());
        }
    }
}
