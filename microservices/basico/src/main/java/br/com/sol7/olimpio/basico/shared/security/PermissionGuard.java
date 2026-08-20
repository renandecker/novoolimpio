package br.com.sol7.olimpio.shared.security;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.ws.rs.ForbiddenException;

import java.util.Arrays;
import java.util.Map;
import java.util.Set;

@ApplicationScoped
public class PermissionGuard {
    public void require(String authenticatedPermissions, Permission permission) {
        boolean granted = authenticatedPermissions != null && Arrays.stream(authenticatedPermissions.split(",")).map(String::trim).anyMatch(permission.name()::equals);
        if (!granted) throw new ForbiddenException("Permissão insuficiente: " + permission);
    }

    /**
     * Permissão por módulo: quando o token traz permissões por módulo, o acesso é
     * avaliado contra o outcome solicitado; usuários sem mapa (ex.: ADMIN, sem
     * vínculo de perfil) caem nas permissões globais do token.
     */
    public void requireModule(Map<String, Set<String>> modulePermissions, String globalPermissions, String outcome, Permission permission) {
        boolean granted;
        if (modulePermissions != null && !modulePermissions.isEmpty()) {
            Set<String> perms = modulePermissions.get(outcome);
            granted = perms != null ? perms.contains(permission.name())
                    : globalPermissions != null && Arrays.stream(globalPermissions.split(",")).map(String::trim).anyMatch(permission.name()::equals);
        } else {
            granted = globalPermissions != null && Arrays.stream(globalPermissions.split(",")).map(String::trim).anyMatch(permission.name()::equals);
        }
        if (!granted)
            throw new ForbiddenException("Permissão insuficiente: " + permission + (outcome == null ? "" : " em " + outcome));
    }
}



