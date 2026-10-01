package br.com.sol7.olimpio.basico.comunicacao.entity;

import io.quarkus.hibernate.reactive.panache.PanacheEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;

import java.time.OffsetDateTime;

@Entity
@Table(name = "bas_comunicacao")
public class Comunicacao extends PanacheEntity {

    @Column(name = "id_usuario")
    public Integer idUsuario;

    @Column(name = "titulo", nullable = false, length = 255)
    public String titulo;

    @Column(name = "mensagem", columnDefinition = "TEXT")
    public String mensagem;

    @Column(name = "tipo", length = 50)
    public String tipo;

    @Column(name = "categoria", length = 50)
    public String categoria;

    @Column(name = "link", length = 500)
    public String link;

    @Column(name = "data_envio")
    public OffsetDateTime dataEnvio;

    @Column(name = "status", length = 20, nullable = false)
    @Enumerated(EnumType.STRING)
    public StatusComunicacao status = StatusComunicacao.RASCUNHO;

    @Column(name = "canal_sistema", nullable = false)
    public boolean canalSistema = true;

    @Column(name = "canal_mobile", nullable = false)
    public boolean canalMobile = false;

    @Column(name = "canal_email", nullable = false)
    public boolean canalEmail = false;

    @Column(name = "canal_telegram", nullable = false)
    public boolean canalTelegram = false;

    @Column(name = "canal_sms", nullable = false)
    public boolean canalSms = false;

    @Column(name = "canal_whatsapp", nullable = false)
    public boolean canalWhatsapp = false;

    @Column(name = "canal_notificacao", nullable = false)
    public boolean canalNotificacao = true;

    @Column(name = "created_at", nullable = false, updatable = false)
    public OffsetDateTime createdAt = OffsetDateTime.now();

    @Column(name = "updated_at", nullable = false)
    public OffsetDateTime updatedAt = OffsetDateTime.now();

    @PrePersist
    void onCreate() {
        if (createdAt == null) {
            createdAt = OffsetDateTime.now();
        }
        updatedAt = OffsetDateTime.now();
    }

    @PreUpdate
    void onUpdate() {
        updatedAt = OffsetDateTime.now();
    }

    public enum StatusComunicacao {
        RASCUNHO,
        ENVIADO,
        AGENDADO,
        ERRO
    }
}