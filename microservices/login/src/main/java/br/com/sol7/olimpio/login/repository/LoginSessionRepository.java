package br.com.sol7.olimpio.login.repository;

import br.com.sol7.olimpio.login.entity.LoginSession;
import io.quarkus.hibernate.reactive.panache.Panache;
import io.quarkus.hibernate.reactive.panache.PanacheRepository;
import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import java.util.UUID;

@ApplicationScoped
public class LoginSessionRepository implements PanacheRepository<LoginSession> {
    public Uni<Boolean> isActive(UUID id) { return Panache.withTransaction(() -> find("id = ?1 and active = true", id).count().map(count -> count > 0)); }
    public Uni<Boolean> deactivate(UUID id) { return update("active = false where id = ?1", id).map(count -> count > 0); }
    public Uni<Void> deactivateAllByUsername(String username) { return update("active = false where username = ?1", username).replaceWithVoid(); }
}
