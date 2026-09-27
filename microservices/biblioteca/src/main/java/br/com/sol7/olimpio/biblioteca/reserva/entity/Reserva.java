package br.com.sol7.olimpio.biblioteca.reserva.entity;

import br.com.sol7.olimpio.biblioteca.obra.entity.Obra;
import io.quarkus.hibernate.reactive.panache.PanacheEntityBase;
import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "bib_reserva")
public class Reserva extends PanacheEntityBase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    public Long id;

    @Column(name = "usuario_id", nullable = false)
    public Long usuarioId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "obra_id", nullable = false)
    public Obra obra;

    @Column(name = "data_solicitacao", nullable = false)
    public LocalDateTime dataSolicitacao;

    @Column(name = "posicao_fila", nullable = false)
    public Integer posicaoFila;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 30)
    public StatusReserva status = StatusReserva.AGUARDANDO_FILA;

    @Column(name = "data_disponibilizacao")
    public LocalDateTime dataDisponibilizacao;

    @Column(name = "data_limite_retirada")
    public LocalDateTime dataLimiteRetirada;

    @Column(name = "data_cancelamento")
    public LocalDateTime dataCancelamento;

    @Column(name = "motivo_cancelamento", columnDefinition = "TEXT")
    public String motivoCancelamento;

    @Column(name = "data_cadastro", nullable = false)
    public LocalDate dataCadastro;

    @Column(name = "fl_ativo", nullable = false)
    public Boolean flAtivo = true;

    @Version
    @Column(name = "version")
    public Long version;

    public enum StatusReserva {
        AGUARDANDO_FILA,
        DISPONIVEL_PARA_RETIRADA,
        CONCLUIDA,
        CANCELADA,
        EXPIRADA
    }
}