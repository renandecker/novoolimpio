package br.com.sol7.olimpio.bibliotecavirtual.licencaacervo.dto;

import br.com.sol7.olimpio.bibliotecavirtual.licencaacervo.entity.LicencaAcervo;
import java.time.LocalDate;

public class LicencaAcervoResponse {

    public Long id;
    public Long livroDigitalId;
    public LicencaAcervo.ModeloLicenca modeloLicenca;
    public Integer totalLicencasContratadas;
    public Integer licencasEmUso;
    public Integer licencasDisponiveis;
    public LocalDate dataInicioVigencia;
    public LocalDate dataFimVigencia;
    public Integer maxAcessosContados;
    public Integer acessosRealizados;
    public LocalDate dataCadastro;
    public Boolean flAtivo;

    public static LicencaAcervoResponse fromEntity(LicencaAcervo licenca) {
        LicencaAcervoResponse resp = new LicencaAcervoResponse();
        resp.id = licenca.id;
        resp.livroDigitalId = licenca.livroDigital != null ? licenca.livroDigital.id : null;
        resp.modeloLicenca = licenca.modeloLicenca;
        resp.totalLicencasContratadas = licenca.totalLicencasContratadas;
        resp.licencasEmUso = licenca.licencasEmUso;
        resp.licencasDisponiveis = switch (licenca.modeloLicenca) {
            case USO_SIMULTANEO_ILIMITADO -> Integer.MAX_VALUE;
            case COPIA_UNICA -> licenca.totalLicencasContratadas - licenca.licencasEmUso;
            case METERED_ACCESS -> licenca.maxAcessosContados != null ? licenca.maxAcessosContados - licenca.acessosRealizados : Integer.MAX_VALUE;
        };
        resp.dataInicioVigencia = licenca.dataInicioVigencia;
        resp.dataFimVigencia = licenca.dataFimVigencia;
        resp.maxAcessosContados = licenca.maxAcessosContados;
        resp.acessosRealizados = licenca.acessosRealizados;
        resp.dataCadastro = licenca.dataCadastro;
        resp.flAtivo = licenca.flAtivo;
        return resp;
    }
}