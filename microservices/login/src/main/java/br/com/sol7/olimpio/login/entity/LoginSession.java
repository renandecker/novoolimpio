package br.com.sol7.olimpio.login.entity;

import io.quarkus.hibernate.reactive.panache.PanacheEntityBase;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "bas_login_session")
public class LoginSession extends PanacheEntityBase {
    @Id
    public UUID id;

    @Column(name = "username", nullable = false, length = 120)
    public String username;

    @Column(name = "created_at", nullable = false)
    public Instant createdAt;

    @Column(name = "expires_at", nullable = false)
    public Instant expiresAt;

    @Column(name = "active", nullable = false)
    public boolean active = true;
}
