package br.com.sol7.olimpio.central.ligacao;

import java.util.Date;

public record LigacaoAgendarRetornoRequest(
    Long ligacaoId,
    Long ordemLigacaoId,
    Date data,
    Long usuarioId
) {}