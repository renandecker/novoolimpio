package br.com.sol7.olimpio.biblioteca.multa.entity;

import br.com.sol7.olimpio.biblioteca.emprestimo.entity.Emprestimo;
import io.quarkus.hibernate.reactive.panache.PanacheEntityBase;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "bib_multa")
public class Multa extends PanacheEntityBase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    public Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "emprestimo_id", nullable = false)
    public Emprestimo emprestimo;

    @Column(name = "usuario_id", nullable = false)
    public Long usuarioId;

    @Column(name = "dias_atraso", nullable = false)
    public Integer diasAtraso;

    @Column(name = "valor_por_dia", nullable = false, precision = 10, scale = 2)
    public BigDecimal valorPorDia;

    @Column(name = "valor_total", nullable = false, precision = 10, scale = 2)
    public BigDecimal valorTotal;

    @Enumerated(EnumType.STRING)
    @Column(name = "motivo", nullable = false, length = 30)
    public MotivoMulta motivo;

    @Enumerated(EnumType.STRING)
    @Column(name = "status_pagamento", nullable = false, length = 20)
    public StatusPagamento statusPagamento = StatusPagamento.PENDENTE;

    @Column(name = "data_pagamento")
    public LocalDateTime dataPagamento;

    @Enumerated(EnumType.STRING)
    @Column(name = "forma_pagamento", length = 20)
    public FormaPagamento formaPagamento;

    @Column(name = "observacoes", columnDefinition = "TEXT")
    public String observacoes;

    @Column(name = "data_cadastro", nullable = false)
    public LocalDate dataCadastro;

    @Column(name = "fl_ativo", nullable = false)
    public Boolean flAtivo = true;

    @Version
    @Column(name = "version")
    public Long version;

    public enum MotivoMulta {
        ATRASO_DEVOLUCAO,
        LIVRO_DANIFICADO,
        PERDA_EXEMPLAR
    }

    public enum StatusPagamento {
        PENDENTE,
        PAGO,
        ISENTO_ANULADO
    }

    public enum FormaPagamento {
        PIX,
        CARTAO,
        DINHEIRO,
        BOLETO
    }
}