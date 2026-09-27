package br.com.sol7.olimpio.bibliotecavirtual.filaespera.dto;

import br.com.sol7.olimpio.bibliotecavirtual.filaespera.entity.FilaEsperaDigital;
import br.com.sol7.olimpio.bibliotecavirtual.livrodigital.dto.LivroDigitalResponse;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class FilaEsperaDigitalResponse {

    public Long id;
    public Long usuarioId;
    public LivroDigitalResponse livroDigital;
    public Integer posicaoFila;
    public LocalDateTime dataSolicitacao;
    public LocalDateTime dataNotificacao;
    public LocalDateTime dataLimiteResgate;
    public FilaEsperaDigital.StatusFila status;
    public LocalDateTime dataResgate;
    public LocalDate dataCadastro;
    public Boolean flAtivo;

    public static FilaEsperaDigitalResponse fromEntity(FilaEsperaDigital fila) {
        FilaEsperaDigitalResponse resp = new FilaEsperaDigitalResponse();
        resp.id = fila.id;
        resp.usuarioId = fila.usuarioId;
        resp.livroDigital = fila.livroDigital != null ? LivroDigitalResponse.fromEntity(fila.livroDigital) : null;
        resp.posicaoFila = fila.posicaoFila;
        resp.dataSolicitacao = fila.dataSolicitacao;
        resp.dataNotificacao = fila.dataNotificacao;
        resp.dataLimiteResgate = fila.dataLimiteResgate;
        resp.status = fila.status;
        resp.dataResgate = fila.dataResgate;
        resp.dataCadastro = fila.dataCadastro;
        resp.flAtivo = fila.flAtivo;
        return resp;
    }
}