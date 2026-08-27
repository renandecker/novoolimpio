package br.com.sol7.olimpio.comercial.campanha;

import java.util.Date;
import java.util.List;

public record CampanhaResponse(
        Long id,
        String descricao,
        Integer meta,
        boolean ativo,
        Date dataInicial,
        List<Long> unidadeIds,
        List<AcaoDeCampanhaResponse> acoes
) {}
