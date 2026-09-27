package br.com.sol7.olimpio.biblioteca.emprestimo.dto;

import br.com.sol7.olimpio.biblioteca.emprestimo.entity.Emprestimo;
import br.com.sol7.olimpio.biblioteca.exemplar.dto.ExemplarResponse;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class EmprestimoResponse {

    public Long id;
    public ExemplarResponse exemplar;
    public Long usuarioId;
    public LocalDateTime dataRetirada;
    public LocalDate dataPrevistaDevolucao;
    public LocalDateTime dataEfetivaDevolucao;
    public Integer quantidadeRenovacoes;
    public Emprestimo.StatusEmprestimo status;
    public String observacoes;
    public LocalDate dataCadastro;
    public Boolean flAtivo;

    public static EmprestimoResponse fromEntity(Emprestimo emprestimo) {
        EmprestimoResponse resp = new EmprestimoResponse();
        resp.id = emprestimo.id;
        resp.exemplar = emprestimo.exemplar != null ? ExemplarResponse.fromEntity(emprestimo.exemplar) : null;
        resp.usuarioId = emprestimo.usuarioId;
        resp.dataRetirada = emprestimo.dataRetirada;
        resp.dataPrevistaDevolucao = emprestimo.dataPrevistaDevolucao;
        resp.dataEfetivaDevolucao = emprestimo.dataEfetivaDevolucao;
        resp.quantidadeRenovacoes = emprestimo.quantidadeRenovacoes;
        resp.status = emprestimo.status;
        resp.observacoes = emprestimo.observacoes;
        resp.dataCadastro = emprestimo.dataCadastro;
        resp.flAtivo = emprestimo.flAtivo;
        return resp;
    }
}