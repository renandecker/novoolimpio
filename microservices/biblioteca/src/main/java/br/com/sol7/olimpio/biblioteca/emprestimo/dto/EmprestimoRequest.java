package br.com.sol7.olimpio.biblioteca.emprestimo.dto;

import br.com.sol7.olimpio.biblioteca.emprestimo.entity.Emprestimo;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class EmprestimoRequest {

    @NotNull
    public Long exemplarId;

    @NotNull
    public Long usuarioId;

    public LocalDateTime dataRetirada;

    @NotNull
    public LocalDate dataPrevistaDevolucao;

    public Integer quantidadeRenovacoes = 0;

    public Emprestimo.StatusEmprestimo status = Emprestimo.StatusEmprestimo.ATIVO;

    public String observacoes;

    public LocalDate dataCadastro;

    public Boolean flAtivo = true;

    public Emprestimo toEntity() {
        Emprestimo emprestimo = new Emprestimo();
        emprestimo.usuarioId = this.usuarioId;
        emprestimo.dataRetirada = this.dataRetirada != null ? this.dataRetirada : LocalDateTime.now();
        emprestimo.dataPrevistaDevolucao = this.dataPrevistaDevolucao;
        emprestimo.quantidadeRenovacoes = this.quantidadeRenovacoes;
        emprestimo.status = this.status;
        emprestimo.observacoes = this.observacoes;
        emprestimo.dataCadastro = this.dataCadastro != null ? this.dataCadastro : LocalDate.now();
        emprestimo.flAtivo = this.flAtivo;
        return emprestimo;
    }

    public void updateEntity(Emprestimo emprestimo) {
        emprestimo.dataPrevistaDevolucao = this.dataPrevistaDevolucao;
        emprestimo.quantidadeRenovacoes = this.quantidadeRenovacoes;
        emprestimo.status = this.status;
        emprestimo.observacoes = this.observacoes;
        emprestimo.flAtivo = this.flAtivo;
    }
}