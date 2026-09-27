package br.com.sol7.olimpio.bibliotecavirtual.filaespera.dto;

import br.com.sol7.olimpio.bibliotecavirtual.filaespera.entity.FilaEsperaDigital;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class FilaEsperaDigitalRequest {

    @NotNull
    public Long usuarioId;

    @NotNull
    public Long livroDigitalId;

    public Integer posicaoFila;

    public LocalDateTime dataSolicitacao;

    public LocalDateTime dataLimiteResgate;

    public FilaEsperaDigital.StatusFila status = FilaEsperaDigital.StatusFila.AGUARDANDO;

    public LocalDate dataCadastro;

    public Boolean flAtivo = true;

    public FilaEsperaDigital toEntity() {
        FilaEsperaDigital fila = new FilaEsperaDigital();
        fila.usuarioId = this.usuarioId;
        fila.posicaoFila = this.posicaoFila != null ? this.posicaoFila : 0;
        fila.dataSolicitacao = this.dataSolicitacao != null ? this.dataSolicitacao : LocalDateTime.now();
        fila.dataLimiteResgate = this.dataLimiteResgate;
        fila.status = this.status;
        fila.dataCadastro = this.dataCadastro != null ? this.dataCadastro : LocalDate.now();
        fila.flAtivo = this.flAtivo;
        return fila;
    }

    public void updateEntity(FilaEsperaDigital fila) {
        fila.status = this.status;
        fila.dataLimiteResgate = this.dataLimiteResgate;
        fila.flAtivo = this.flAtivo;
    }
}