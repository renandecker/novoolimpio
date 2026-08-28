package br.com.sol7.olimpio.central.ligacao;

public record LigacaoTrocarPacoteRequest(
    Long operacionalId,
    Long novoOperacionalId,
    Long usuarioId
) {}