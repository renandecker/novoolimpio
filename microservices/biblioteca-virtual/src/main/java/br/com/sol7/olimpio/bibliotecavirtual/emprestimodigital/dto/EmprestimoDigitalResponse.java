package br.com.sol7.olimpio.bibliotecavirtual.emprestimodigital.dto;

import br.com.sol7.olimpio.bibliotecavirtual.emprestimodigital.entity.EmprestimoDigital;
import br.com.sol7.olimpio.bibliotecavirtual.livrodigital.dto.LivroDigitalResponse;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class EmprestimoDigitalResponse {

    public Long id;
    public Long usuarioId;
    public LivroDigitalResponse livroDigital;
    public LocalDateTime dataInicio;
    public LocalDateTime dataExpiracao;
    public EmprestimoDigital.TipoAcesso tipoAcesso;
    public String tokenDrm;
    public EmprestimoDigital.StatusEmprestimoDigital status;
    public Integer progressoLeitura;
    public Integer ultimaPaginaLida;
    public LocalDateTime dataDevolucaoAntecipada;
    public LocalDate dataCadastro;
    public Boolean flAtivo;

    public static EmprestimoDigitalResponse fromEntity(EmprestimoDigital emprestimo) {
        EmprestimoDigitalResponse resp = new EmprestimoDigitalResponse();
        resp.id = emprestimo.id;
        resp.usuarioId = emprestimo.usuarioId;
        resp.livroDigital = emprestimo.livroDigital != null ? LivroDigitalResponse.fromEntity(emprestimo.livroDigital) : null;
        resp.dataInicio = emprestimo.dataInicio;
        resp.dataExpiracao = emprestimo.dataExpiracao;
        resp.tipoAcesso = emprestimo.tipoAcesso;
        resp.tokenDrm = emprestimo.tokenDrm;
        resp.status = emprestimo.status;
        resp.progressoLeitura = emprestimo.progressoLeitura;
        resp.ultimaPaginaLida = emprestimo.ultimaPaginaLida;
        resp.dataDevolucaoAntecipada = emprestimo.dataDevolucaoAntecipada;
        resp.dataCadastro = emprestimo.dataCadastro;
        resp.flAtivo = emprestimo.flAtivo;
        return resp;
    }
}