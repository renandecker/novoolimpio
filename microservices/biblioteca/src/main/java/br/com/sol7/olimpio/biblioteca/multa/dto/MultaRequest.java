package br.com.sol7.olimpio.biblioteca.multa.dto;

import br.com.sol7.olimpio.biblioteca.multa.entity.Multa;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class MultaRequest {

    @NotNull
    public Long emprestimoId;

    @NotNull
    public Long usuarioId;

    @NotNull
    public Integer diasAtraso;

    @NotNull
    public BigDecimal valorPorDia;

    @NotNull
    public BigDecimal valorTotal;

    @NotNull
    public Multa.MotivoMulta motivo;

    public Multa.StatusPagamento statusPagamento = Multa.StatusPagamento.PENDENTE;

    public LocalDateTime dataPagamento;

    public Multa.FormaPagamento formaPagamento;

    public String observacoes;

    public LocalDate dataCadastro;

    public Boolean flAtivo = true;

    public Multa toEntity() {
        Multa multa = new Multa();
        multa.usuarioId = this.usuarioId;
        multa.diasAtraso = this.diasAtraso;
        multa.valorPorDia = this.valorPorDia;
        multa.valorTotal = this.valorTotal;
        multa.motivo = this.motivo;
        multa.statusPagamento = this.statusPagamento;
        multa.dataPagamento = this.dataPagamento;
        multa.formaPagamento = this.formaPagamento;
        multa.observacoes = this.observacoes;
        multa.dataCadastro = this.dataCadastro != null ? this.dataCadastro : LocalDate.now();
        multa.flAtivo = this.flAtivo;
        return multa;
    }

    public void updateEntity(Multa multa) {
        multa.statusPagamento = this.statusPagamento;
        multa.dataPagamento = this.dataPagamento;
        multa.formaPagamento = this.formaPagamento;
        multa.observacoes = this.observacoes;
        multa.flAtivo = this.flAtivo;
    }
}