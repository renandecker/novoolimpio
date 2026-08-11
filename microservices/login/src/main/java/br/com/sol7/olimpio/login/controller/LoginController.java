package br.com.sol7.olimpio.login.controller;

import br.com.sol7.olimpio.login.dto.BootstrapRequest;
import br.com.sol7.olimpio.login.dto.ChangePasswordRequest;
import br.com.sol7.olimpio.login.dto.ForgotPasswordRequest;
import br.com.sol7.olimpio.login.dto.LoginRequest;
import br.com.sol7.olimpio.login.dto.LoginResponse;
import br.com.sol7.olimpio.login.dto.MessageResponse;
import br.com.sol7.olimpio.login.service.LoginService;
import io.smallrye.mutiny.Uni;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.HeaderParam;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;

@Path("/api/login")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class LoginController {
    @Inject LoginService service;
    @POST @Path("/authenticate") public Uni<LoginResponse> authenticate(@Valid LoginRequest request) { return service.authenticate(request); }
    @POST @Path("/bootstrap") public Uni<LoginResponse> bootstrap(@Valid BootstrapRequest request) { return service.bootstrap(request); }
    @POST @Path("/forgot-password") public Uni<MessageResponse> forgotPassword(@Valid ForgotPasswordRequest request) { return service.forgotPassword(request); }
    @POST @Path("/change-password") public Uni<LoginResponse> changePassword(@HeaderParam("Authorization") String authorization, @Valid ChangePasswordRequest request) { return service.changePassword(authorization, request); }
    @POST @Path("/logout") public Uni<Void> logout(@HeaderParam("Authorization") String authorization) { return service.logout(authorization); }
}