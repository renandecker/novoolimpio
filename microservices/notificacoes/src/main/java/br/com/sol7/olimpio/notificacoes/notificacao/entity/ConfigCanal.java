package br.com.sol7.olimpio.notificacoes.notificacao.entity;

import io.quarkus.hibernate.reactive.panache.PanacheEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;

import java.time.OffsetDateTime;

@Entity
@Table(name = "not_config_canal")
public class ConfigCanal extends PanacheEntity {

    @Column(name = "canal", nullable = false, unique = true, length = 30)
    public String canal;

    @Column(name = "ativo", nullable = false)
    public boolean ativo = true;

    @Column(name = "destinatario", length = 255)
    public String destinatario;

    @Column(name = "descricao", length = 255)
    public String descricao;

    @Column(name = "created_at", nullable = false)
    public OffsetDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    public OffsetDateTime updatedAt;

    @PrePersist
    void onCreate() {
        createdAt = updatedAt = OffsetDateTime.now();
    }

    @PreUpdate
    void onUpdate() {
        updatedAt = OffsetDateTime.now();
    }
}
