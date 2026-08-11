package br.com.sol7.olimpio.shared.security;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.ws.rs.ForbiddenException;
import java.util.Arrays;
@ApplicationScoped public class PermissionGuard {
    public void require(String authenticatedPermissions, Permission permission) {
        boolean granted = authenticatedPermissions != null && Arrays.stream(authenticatedPermissions.split(",")).map(String::trim).anyMatch(permission.name()::equals);
        if (!granted) throw new ForbiddenException("Permissão insuficiente: " + permission);
    }
}
