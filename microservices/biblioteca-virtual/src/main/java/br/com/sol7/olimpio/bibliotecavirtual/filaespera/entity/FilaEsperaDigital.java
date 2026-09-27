package br.com.sol7.olimpio.bibliotecavirtual.filaespera.entity;

import br.com.sol7.olimpio.bibliotecavirtual.livrodigital.entity.LivroDigital;
import io.quarkus.hibernate.reactive.panache.PanacheEntityBase;
import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "bib_fila_espera_digital")
public class FilaEsperaDigital extends PanacheEntityBase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    public Long id;

    @Column(name = "usuario_id", nullable = false)
    public Long usuarioId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "livro_digital_id", nullable = false)
    public LivroDigital livroDigital;

    @Column(name = "posicao_fila", nullable = false)
    public Integer posicaoFila;

    @Column(name = "data_solicitacao", nullable = false)
    public LocalDateTime dataSolicitacao;

    @Column(name = "data_notificacao")
    public LocalDateTime dataNotificacao;

    @Column(name = "data_limite_resgate")
    public LocalDateTime dataLimiteResgate;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 30)
    public StatusFila status = StatusFila.AGUARDANDO;

    @Column(name = "data_resgate")
    public LocalDateTime dataResgate;

    @Column(name = "data_cadastro", nullable = false)
    public LocalDate dataCadastro;

    @Column(name = "fl_ativo", nullable = false)
    public Boolean flAtivo = true;

    @Version
    @Column(name = "version")
    public Long version;

    public enum StatusFila {
        AGUARDANDO,
        NOTIFICADO,
        RESGATADO,
        EXPIRADO,
        CANCELADO
    }
}