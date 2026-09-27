package br.com.sol7.olimpio.biblioteca.reserva.dto;

import br.com.sol7.olimpio.biblioteca.reserva.entity.Reserva;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class ReservaRequest {

    @NotNull
    public Long usuarioId;

    @NotNull
    public Long obraId;

    public Integer posicaoFila;

    public Reserva.StatusReserva status = Reserva.StatusReserva.AGUARDANDO_FILA;

    public LocalDateTime dataDisponibilizacao;

    public LocalDateTime dataLimiteRetirada;

    public String motivoCancelamento;

    public LocalDate dataCadastro;

    public Boolean flAtivo = true;

    public Reserva toEntity() {
        Reserva reserva = new Reserva();
        reserva.usuarioId = this.usuarioId;
        reserva.posicaoFila = this.posicaoFila != null ? this.posicaoFila : 0;
        reserva.status = this.status;
        reserva.dataDisponibilizacao = this.dataDisponibilizacao;
        reserva.dataLimiteRetirada = this.dataLimiteRetirada;
        reserva.motivoCancelamento = this.motivoCancelamento;
        reserva.dataCadastro = this.dataCadastro != null ? this.dataCadastro : LocalDate.now();
        reserva.flAtivo = this.flAtivo;
        return reserva;
    }

    public void updateEntity(Reserva reserva) {
        reserva.status = this.status;
        reserva.dataDisponibilizacao = this.dataDisponibilizacao;
        reserva.dataLimiteRetirada = this.dataLimiteRetirada;
        reserva.motivoCancelamento = this.motivoCancelamento;
        reserva.flAtivo = this.flAtivo;
    }
}