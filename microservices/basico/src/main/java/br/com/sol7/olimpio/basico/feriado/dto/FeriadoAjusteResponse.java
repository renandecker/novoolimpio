package br.com.sol7.olimpio.basico.feriado.dto;

import java.util.Date;
import java.util.List;

public record FeriadoAjusteResponse(
        Long id,
        Long feriadoId,
        String feriadoNome,
        Date feriadoData,
        Long usuarioId,
        String usuarioLogin,
        Boolean ativo,
        Boolean ocorrencia,
        List<Long> ocorrenciaAjustarIds,
        List<Long> ocorrenciaNaoAjustarIds
) {
}