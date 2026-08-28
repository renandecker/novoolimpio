package br.com.sol7.olimpio.central.ligacao;

public record LigacaoPausaRequest(
    Long ligacaoId,
    Long usuarioId,
    Long tipoPausaId,
    String observacao
) {}