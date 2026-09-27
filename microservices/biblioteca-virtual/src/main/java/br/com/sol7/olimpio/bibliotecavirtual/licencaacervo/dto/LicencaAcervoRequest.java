package br.com.sol7.olimpio.bibliotecavirtual.licencaacervo.dto;

import br.com.sol7.olimpio.bibliotecavirtual.licencaacervo.entity.LicencaAcervo;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;

public class LicencaAcervoRequest {

    @NotNull
    public Long livroDigitalId;

    @NotNull
    public LicencaAcervo.ModeloLicenca modeloLicenca;

    public Integer totalLicencasContratadas = 1;

    public LocalDate dataInicioVigencia;

    public LocalDate dataFimVigencia;

    public Integer maxAcessosContados;

    public LocalDate dataCadastro;

    public Boolean flAtivo = true;

    public LicencaAcervo toEntity() {
        LicencaAcervo licenca = new LicencaAcervo();
        licenca.modeloLicenca = this.modeloLicenca;
        licenca.totalLicencasContratadas = this.totalLicencasContratadas;
        licenca.dataInicioVigencia = this.dataInicioVigencia;
        licenca.dataFimVigencia = this.dataFimVigencia;
        licenca.maxAcessosContados = this.maxAcessosContados;
        licenca.dataCadastro = this.dataCadastro != null ? this.dataCadastro : LocalDate.now();
        licenca.flAtivo = this.flAtivo;
        return licenca;
    }

    public void updateEntity(LicencaAcervo licenca) {
        licenca.modeloLicenca = this.modeloLicenca;
        licenca.totalLicencasContratadas = this.totalLicencasContratadas;
        licenca.dataInicioVigencia = this.dataInicioVigencia;
        licenca.dataFimVigencia = this.dataFimVigencia;
        licenca.maxAcessosContados = this.maxAcessosContados;
        licenca.flAtivo = this.flAtivo;
    }
}