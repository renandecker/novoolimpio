package br.com.sol7.olimpio.login.service;

import br.com.sol7.olimpio.login.dto.BootstrapRequest;
import br.com.sol7.olimpio.login.dto.ChangePasswordRequest;
import br.com.sol7.olimpio.login.dto.ForgotPasswordRequest;
import br.com.sol7.olimpio.login.dto.LoginRequest;
import br.com.sol7.olimpio.login.dto.LoginResponse;
import br.com.sol7.olimpio.login.dto.MessageResponse;
import br.com.sol7.olimpio.login.entity.Login;
import br.com.sol7.olimpio.login.entity.LoginSession;
import br.com.sol7.olimpio.login.permissao.service.ModulePermissionService;
import br.com.sol7.olimpio.login.repository.LoginRepository;
import br.com.sol7.olimpio.login.repository.LoginSessionRepository;
import br.com.sol7.olimpio.shared.security.JwtTokenService;
import io.quarkus.hibernate.reactive.panache.common.WithTransaction;
import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.BadRequestException;
import jakarta.ws.rs.NotAuthorizedException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.security.SecureRandom;
import java.time.Instant;
import java.util.Arrays;
import java.util.LinkedHashSet;
import java.util.Set;
import java.util.UUID;

@ApplicationScoped
public class LoginService {
    private static final Logger LOGGER = LoggerFactory.getLogger(LoginService.class);
    private static final Set<String> ALL_PERMISSIONS = Set.of("READ", "CREATE", "UPDATE", "DELETE", "EXECUTE");
    private static final String RESET_REQUESTED = "Se o usuário informado existir, uma senha provisória será enviada ao e-mail cadastrado.";
    private static final SecureRandom RANDOM = new SecureRandom();
    private static final char[] TEMP_PASSWORD_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789".toCharArray();
    @Inject LoginRepository repository;
    @Inject LoginSessionRepository sessions;
    @Inject JwtTokenService jwt;
    @Inject MailService mailService;
    @Inject ModulePermissionService modulePermissions;

    @WithTransaction
    public Uni<LoginResponse> authenticate(LoginRequest request) {
        return repository.findByUsername(request.username()).onItem().ifNull().failWith(() -> new NotAuthorizedException("Usuário ou senha inválidos"))
            .onItem().transformToUni(login -> {
                if (!login.active || !PasswordHasher.matches(request.password(), login.passwordHash)) throw new NotAuthorizedException("Usuário ou senha inválidos");
                return issueSession(login);
            });
    }

    @WithTransaction
    public Uni<LoginResponse> bootstrap(BootstrapRequest request) {
        return repository.count().onItem().transformToUni(count -> {
            if (count > 0) return Uni.createFrom().failure(new BadRequestException("O usuário inicial já foi criado"));
            var login = new Login();
            login.username = normalise(request.username());
            login.passwordHash = PasswordHasher.hash(request.password());
            login.permissions = String.join(",", ALL_PERMISSIONS);
            login.active = true;
            return repository.persist(login).onItem().transformToUni(ignored -> issueSession(login));
        });
    }

    @WithTransaction
    public Uni<Void> logout(String authorization) {
        if (authorization == null || !authorization.startsWith("Bearer ")) return Uni.createFrom().failure(new NotAuthorizedException("Token Bearer ausente"));
        try {
            var claims = jwt.verify(authorization.substring(7));
            return sessions.deactivate(claims.jti()).replaceWithVoid();
        } catch (IllegalArgumentException exception) { return Uni.createFrom().failure(new NotAuthorizedException("Token inválido ou expirado")); }
    }

    @WithTransaction
    public Uni<MessageResponse> forgotPassword(ForgotPasswordRequest request) {
        String username = normalise(request.username());
        return repository.findByUsername(username)
            .onItem().transformToUni(login -> {
                if (login == null || !login.active) return Uni.createFrom().item(new MessageResponse(RESET_REQUESTED));
                String temporaryPassword = generateTemporaryPassword();
                login.passwordHash = PasswordHasher.hash(temporaryPassword);
                return repository.findEmailByUsername(username)
                    .onItem().transformToUni(email -> {
                        if (email == null || email.isBlank()) {
                            LOGGER.warn("Redefinição de senha solicitada para '{}', mas não há e-mail cadastrado.", username);
                            return Uni.createFrom().item(new MessageResponse(RESET_REQUESTED));
                        }
                        return sessions.deactivateAllByUsername(username)
                            .replaceWith(() -> mailService.sendTemporaryPassword(email, username, temporaryPassword))
                            .replaceWith(new MessageResponse(RESET_REQUESTED));
                    });
            });
    }

    @WithTransaction
    public Uni<LoginResponse> changePassword(String authorization, ChangePasswordRequest request) {
        if (authorization == null || !authorization.startsWith("Bearer ")) return Uni.createFrom().failure(new NotAuthorizedException("Token Bearer ausente"));
        try {
            var claims = jwt.verify(authorization.substring(7));
            String username = normalise(claims.subject());
            return repository.findByUsername(username)
                .onItem().transformToUni(login -> {
                    if (login == null || !login.active) return Uni.createFrom().failure(new NotAuthorizedException("Usuário não encontrado"));
                    if (!PasswordHasher.matches(request.currentPassword(), login.passwordHash)) return Uni.createFrom().failure(new BadRequestException("Senha atual incorreta"));
                    login.passwordHash = PasswordHasher.hash(request.newPassword());
                    return sessions.deactivateAllByUsername(username)
                        .onItem().transformToUni(ignored -> issueSession(login));
                });
        } catch (IllegalArgumentException exception) { return Uni.createFrom().failure(new NotAuthorizedException("Token inválido ou expirado")); }
    }

    private String generateTemporaryPassword() {
        StringBuilder builder = new StringBuilder(10);
        for (int i = 0; i < 10; i++) builder.append(TEMP_PASSWORD_CHARS[RANDOM.nextInt(TEMP_PASSWORD_CHARS.length)]);
        return builder.toString();
    }

    private Uni<LoginResponse> issueSession(Login login) {
        Set<String> permissions = parsePermissions(login.permissions);
        return modulePermissions.resolve(login.id)
                .onItem().transformToUni(perModule -> {
                    var token = jwt.issue(login.username, permissions, perModule);
                    var session = new LoginSession();
                    session.id = UUID.fromString(token.jti());
                    session.username = login.username;
                    session.createdAt = Instant.now();
                    session.expiresAt = Instant.ofEpochSecond(token.expiresAt());
                    session.active = true;
                    return sessions.persist(session)
                            .onItem().transformToUni(ignored -> repository.perfilPorUsername(login.username))
                            .map(perfil -> new LoginResponse(token.token(), token.expiresAt(), login.username, permissions, perModule,
                                    perfil == null ? null : str(perfil[2]), perfil == null ? null : str(perfil[1]),
                                    perfil == null ? null : str(perfil[3]), perfil == null ? null : str(perfil[0])));
                });
    }
    private String normalise(String username) { return username.trim().toLowerCase(); }
    private String str(Object value) { return value == null ? null : value.toString(); }
    private Set<String> parsePermissions(String value) {
        var result = new LinkedHashSet<String>();
        Arrays.stream(value.split(",")).map(String::trim).map(String::toUpperCase).filter(ALL_PERMISSIONS::contains).forEach(result::add);
        return result;
    }
}
