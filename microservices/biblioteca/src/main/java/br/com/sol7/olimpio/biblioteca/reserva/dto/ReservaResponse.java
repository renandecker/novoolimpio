package br.com.sol7.olimpio.biblioteca.reserva.dto;

import br.com.sol7.olimpio.biblioteca.reserva.entity.Reserva;
import br.com.sol7.olimpio.biblioteca.obra.dto.ObraResponse;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class ReservaResponse {

    public Long id;
    public Long usuarioId;
    public ObraResponse obra;
    public LocalDateTime dataSolicitacao;
    public Integer posicaoFila;
    public Reserva.StatusReserva status;
    public LocalDateTime dataDisponibilizacao;
    public LocalDateTime dataLimiteRetirada;
    public LocalDateTime dataCancelamento;
    public String motivoCancelamento;
    public LocalDate dataCadastro;
    public Boolean flAtivo;

    public static ReservaResponse fromEntity(Reserva reserva) {
        ReservaResponse resp = new ReservaResponse();
        resp.id = reserva.id;
        resp.usuarioId = reserva.usuarioId;
        resp.obra = reserva.obra != null ? ObraResponse.fromEntity(reserva.obra) : null;
        resp.dataSolicitacao = reserva.dataSolicitacao;
        resp.posicaoFila = reserva.posicaoFila;
        resp.status = reserva.status;
        resp.dataDisponibilizacao = reserva.dataDisponibilizacao;
        resp.dataLimiteRetirada = reserva.dataLimiteRetirada;
        resp.dataCancelamento = reserva.dataCancelamento;
        resp.motivoCancelamento = reserva.motivoCancelamento;
        resp.dataCadastro = reserva.dataCadastro;
        resp.flAtivo = reserva.flAtivo;
        return resp;
    }
}