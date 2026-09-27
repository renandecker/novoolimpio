package br.com.sol7.olimpio.biblioteca.emprestimo.entity;

import br.com.sol7.olimpio.biblioteca.exemplar.entity.Exemplar;
import io.quarkus.hibernate.reactive.panache.PanacheEntityBase;
import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "bib_emprestimo")
public class Emprestimo extends PanacheEntityBase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    public Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "exemplar_id", nullable = false)
    public Exemplar exemplar;

    @Column(name = "usuario_id", nullable = false)
    public Long usuarioId;

    @Column(name = "data_retirada", nullable = false)
    public LocalDateTime dataRetirada;

    @Column(name = "data_prevista_devolucao", nullable = false)
    public LocalDate dataPrevistaDevolucao;

    @Column(name = "data_efetiva_devolucao")
    public LocalDateTime dataEfetivaDevolucao;

    @Column(name = "quantidade_renovacoes", nullable = false)
    public Integer quantidadeRenovacoes = 0;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 30)
    public StatusEmprestimo status = StatusEmprestimo.ATIVO;

    @Column(name = "observacoes", columnDefinition = "TEXT")
    public String observacoes;

    @Column(name = "data_cadastro", nullable = false)
    public LocalDate dataCadastro;

    @Column(name = "fl_ativo", nullable = false)
    public Boolean flAtivo = true;

    @Version
    @Column(name = "version")
    public Long version;

    public enum StatusEmprestimo {
        ATIVO,
        DEVOLVIDO_COM_ATRASO,
        DEVOLVIDO_NO_PRAZO,
        PERDIDO
    }
}