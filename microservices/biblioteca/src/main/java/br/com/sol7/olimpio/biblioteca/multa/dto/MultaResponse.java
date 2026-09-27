package br.com.sol7.olimpio.biblioteca.multa.dto;

import br.com.sol7.olimpio.biblioteca.multa.entity.Multa;
import br.com.sol7.olimpio.biblioteca.emprestimo.dto.EmprestimoResponse;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class MultaResponse {

    public Long id;
    public EmprestimoResponse emprestimo;
    public Long usuarioId;
    public Integer diasAtraso;
    public BigDecimal valorPorDia;
    public BigDecimal valorTotal;
    public Multa.MotivoMulta motivo;
    public Multa.StatusPagamento statusPagamento;
    public LocalDateTime dataPagamento;
    public Multa.FormaPagamento formaPagamento;
    public String observacoes;
    public LocalDate dataCadastro;
    public Boolean flAtivo;

    public static MultaResponse fromEntity(Multa multa) {
        MultaResponse resp = new MultaResponse();
        resp.id = multa.id;
        resp.emprestimo = multa.emprestimo != null ? EmprestimoResponse.fromEntity(multa.emprestimo) : null;
        resp.usuarioId = multa.usuarioId;
        resp.diasAtraso = multa.diasAtraso;
        resp.valorPorDia = multa.valorPorDia;
        resp.valorTotal = multa.valorTotal;
        resp.motivo = multa.motivo;
        resp.statusPagamento = multa.statusPagamento;
        resp.dataPagamento = multa.dataPagamento;
        resp.formaPagamento = multa.formaPagamento;
        resp.observacoes = multa.observacoes;
        resp.dataCadastro = multa.dataCadastro;
        resp.flAtivo = multa.flAtivo;
        return resp;
    }
}