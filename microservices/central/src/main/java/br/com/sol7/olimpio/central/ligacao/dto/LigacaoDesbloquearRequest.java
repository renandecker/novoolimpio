package br.com.sol7.olimpio.central.ligacao;

public record LigacaoDesbloquearRequest(
    Long usuarioId,
    String senha,
    boolean pausaCoordenador,
    boolean tempoEsgotado
) {}