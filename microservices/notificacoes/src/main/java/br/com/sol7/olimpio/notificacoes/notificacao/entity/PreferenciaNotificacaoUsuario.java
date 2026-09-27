package br.com.sol7.olimpio.notificacoes.notificacao.entity;

import io.quarkus.hibernate.reactive.panache.PanacheEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Index;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

import java.time.OffsetDateTime;

@Entity
@Table(
        name = "not_preferencia_notificacao_usuario",
        uniqueConstraints = @UniqueConstraint(columnNames = {"username", "categoria", "tipo", "canal"}),
        indexes = {
                @Index(name = "idx_pref_notif_user_cat", columnList = "username, categoria"),
                @Index(name = "idx_pref_notif_user", columnList = "username")
        }
)
public class PreferenciaNotificacaoUsuario extends PanacheEntity {

    public static final String CATEGORIA_TURMA = "TURMA";
    public static final String CATEGORIA_CONTRATO = "CONTRATO";
    public static final String CATEGORIA_USUARIO = "USUARIO";
    public static final String CATEGORIA_ALUNO = "ALUNO";
    public static final String CATEGORIA_PROFESSOR = "PROFESSOR";
    public static final String CATEGORIA_AGENDA = "AGENDA";

    public static final String TIPO_NOTAS = "NOTAS";
    public static final String TIPO_PRESENCAS = "PRESENCAS";
    public static final String TIPO_AULAS = "AULAS";
    public static final String TIPO_REGISTRO_AULA = "REGISTRO_AULA";
    public static final String TIPO_ALTERACAO_CONTRATO = "ALTERACAO_CONTRATO";
    // Usuario logado
    public static final String TIPO_ALTERACAO_AGENDA = "ALTERACAO_AGENDA";
    public static final String TIPO_ALTERACAO_CADASTRO = "ALTERACAO_CADASTRO";
    // Aluno logado
    public static final String TIPO_CONTRATO_CRIACAO = "CONTRATO_CRIACAO";
    public static final String TIPO_CONTRATO_CANCELAMENTO = "CONTRATO_CANCELAMENTO";
    public static final String TIPO_ALTERACAO_AULA = "ALTERACAO_AULA";
    public static final String TIPO_ALTERACAO_NOTA = "ALTERACAO_NOTA";
    public static final String TIPO_ALTERACAO_PRESENCA = "ALTERACAO_PRESENCA";
    public static final String TIPO_ALTERACAO_REGISTRO_AULA = "ALTERACAO_REGISTRO_AULA";
    // Professor logado
    public static final String TIPO_PERGUNTA_RESPONDIDA = "PERGUNTA_RESPONDIDA";
    public static final String TIPO_ALTERACAO_TURMA = "ALTERACAO_TURMA";
    public static final String TIPO_ALTERACAO_PROFESSOR = "ALTERACAO_PROFESSOR";

    public static final String CANAL_PUSH = "PUSH";
    public static final String CANAL_TELEGRAM = "TELEGRAM";
    public static final String CANAL_WHATSAPP = "WHATSAPP";
    public static final String CANAL_EMAIL = "EMAIL";
    public static final String CANAL_SMS = "SMS";

    @Column(name = "username", nullable = false, length = 120)
    public String username;

    @Column(name = "categoria", nullable = false, length = 30)
    public String categoria;

    @Column(name = "tipo", nullable = false, length = 30)
    public String tipo;

    @Column(name = "canal", nullable = false, length = 30)
    public String canal;

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