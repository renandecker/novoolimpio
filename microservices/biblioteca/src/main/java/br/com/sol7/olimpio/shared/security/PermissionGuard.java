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

    public void requireModule(Map<String, Set<String>> modulePermissions, String globalPermissions, String outcome, Permission permission) {
        boolean granted;
        if (modulePermissions != null && !modulePermissions.isEmpty()) {
            granted = modulePermissions.getOrDefault(outcome, Set.of()).contains(permission.name());
        } else {
            granted = globalPermissions != null && Arrays.stream(globalPermissions.split(",")).map(String::trim).anyMatch(permission.name()::equals);
        }
        if (!granted)
            throw new ForbiddenException("Permissão insuficiente: " + permission + (outcome == null ? "" : " em " + outcome));
    }
}