package br.com.sol7.olimpio.central.ligacao;

public record LigacaoRetornoPausaRequest(
    Long ligacaoId,
    Long usuarioId
) {}