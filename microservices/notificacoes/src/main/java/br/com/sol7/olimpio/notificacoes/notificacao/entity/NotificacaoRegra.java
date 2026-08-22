package br.com.sol7.olimpio.notificacoes.notificacao.entity;

import io.quarkus.hibernate.reactive.panache.PanacheEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;

import java.time.OffsetDateTime;

@Entity
@Table(name = "not_notificacao_regra")
public class NotificacaoRegra extends PanacheEntity {

    @Column(name = "nome", nullable = false, length = 100)
    public String nome;

    @Column(name = "descricao", length = 255)
    public String descricao;

    @Column(name = "tipo_regra", nullable = false, length = 50)
    public String tipoRegra;

    @Column(name = "canal", nullable = false, length = 30)
    public String canal;

    @Column(name = "destinatario", nullable = false, length = 50)
    public String destinatario;

    @Column(name = "destinatario_professor")
    public boolean destinatarioProfessor = false;

    @Column(name = "valor_limite")
    public Double valorLimite;

    @Column(name = "ativo", nullable = false)
    public boolean ativo = true;

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