package br.com.sol7.olimpio.notificacoes.notificacao.entity;

import io.quarkus.hibernate.reactive.panache.PanacheEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;

import java.time.OffsetDateTime;

@Entity
@Table(name = "not_notificacao")
public class Notificacao extends PanacheEntity {

    @Column(name = "username", nullable = false, length = 120)
    public String username;

    @Column(name = "titulo", nullable = false, length = 255)
    public String titulo;

    @Column(name = "mensagem", columnDefinition = "text")
    public String mensagem;

    @Column(name = "tipo", length = 50)
    public String tipo;

    @Column(name = "link", length = 500)
    public String link;

    @Column(name = "lida", nullable = false)
    public boolean lida;

    @Column(name = "canal_sistema", nullable = false)
    public boolean canalSistema = true;

    @Column(name = "canal_mobile", nullable = false)
    public boolean canalMobile = false;

    @Column(name = "canal_email", nullable = false)
    public boolean canalEmail = false;

    @Column(name = "email_enviado", nullable = false)
    public boolean emailEnviado = false;

    @Column(name = "mobile_enviado", nullable = false)
    public boolean mobileEnviado = false;

    @Column(name = "data_leitura")
    public OffsetDateTime dataLeitura;

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
