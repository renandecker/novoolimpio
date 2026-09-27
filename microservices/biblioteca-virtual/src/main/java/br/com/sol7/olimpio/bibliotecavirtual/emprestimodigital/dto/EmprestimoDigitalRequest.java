package br.com.sol7.olimpio.bibliotecavirtual.emprestimodigital.dto;

import br.com.sol7.olimpio.bibliotecavirtual.emprestimodigital.entity.EmprestimoDigital;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class EmprestimoDigitalRequest {

    @NotNull
    public Long usuarioId;

    @NotNull
    public Long livroDigitalId;

    public LocalDateTime dataInicio;

    @NotNull
    public LocalDateTime dataExpiracao;

    @NotNull
    public EmprestimoDigital.TipoAcesso tipoAcesso;

    public String tokenDrm;

    public EmprestimoDigital.StatusEmprestimoDigital status = EmprestimoDigital.StatusEmprestimoDigital.ATIVO;

    public Integer progressoLeitura = 0;

    public Integer ultimaPaginaLida;

    public LocalDate dataCadastro;

    public Boolean flAtivo = true;

    public EmprestimoDigital toEntity() {
        EmprestimoDigital emprestimo = new EmprestimoDigital();
        emprestimo.usuarioId = this.usuarioId;
        emprestimo.dataInicio = this.dataInicio != null ? this.dataInicio : LocalDateTime.now();
        emprestimo.dataExpiracao = this.dataExpiracao;
        emprestimo.tipoAcesso = this.tipoAcesso;
        emprestimo.tokenDrm = this.tokenDrm;
        emprestimo.status = this.status;
        emprestimo.progressoLeitura = this.progressoLeitura;
        emprestimo.ultimaPaginaLida = this.ultimaPaginaLida;
        emprestimo.dataCadastro = this.dataCadastro != null ? this.dataCadastro : LocalDate.now();
        emprestimo.flAtivo = this.flAtivo;
        return emprestimo;
    }

    public void updateEntity(EmprestimoDigital emprestimo) {
        emprestimo.dataExpiracao = this.dataExpiracao;
        emprestimo.tipoAcesso = this.tipoAcesso;
        emprestimo.tokenDrm = this.tokenDrm;
        emprestimo.status = this.status;
        emprestimo.progressoLeitura = this.progressoLeitura;
        emprestimo.ultimaPaginaLida = this.ultimaPaginaLida;
        emprestimo.flAtivo = this.flAtivo;
    }
}