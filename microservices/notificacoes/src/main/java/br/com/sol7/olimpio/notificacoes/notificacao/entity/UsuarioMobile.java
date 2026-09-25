package br.com.sol7.olimpio.notificacoes.notificacao.entity;

import io.quarkus.hibernate.reactive.panache.PanacheEntityBase;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.SequenceGenerator;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

import java.time.OffsetDateTime;

@Entity
@Table(name = "bas_usuario_mobile", uniqueConstraints = @UniqueConstraint(name = "uk_bas_usuario_mobile_usuario_token", columnNames = {"id_usuario", "token"}))
public class UsuarioMobile extends PanacheEntityBase {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "bas_usuario_mobile_id_seq")
    @SequenceGenerator(name = "bas_usuario_mobile_id_seq", sequenceName = "bas_usuario_mobile_id_seq", allocationSize = 1)
    public Long id;

    @Column(name = "id_usuario", nullable = false)
    public Integer idUsuario;

    @Column(name = "token", nullable = false, length = 500)
    public String token;

    @Column(name = "plataforma", nullable = false, length = 20)
    public String plataforma = "ANDROID";

    @Column(name = "ativo", nullable = false)
    public boolean ativo = true;

    @Column(name = "ultimo_uso")
    public OffsetDateTime ultimoUso;

    @Column(name = "created_at", nullable = false)
    public OffsetDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    public OffsetDateTime updatedAt;

    @PrePersist
    void onCreate() {
        createdAt = updatedAt = OffsetDateTime.now();
        if (ultimoUso == null) {
            ultimoUso = OffsetDateTime.now();
        }
    }

    @PreUpdate
    void onUpdate() {
        updatedAt = OffsetDateTime.now();
    }
}