package br.com.sol7.olimpio.comercial.campanha;

import java.util.Date;

public record AcaoDeCampanhaResponse(
        Long id,
        Long tipoCanalId,
        String tipoCanalDescricao,
        Long estrategiaId,
        String estrategiaDescricao,
        Date dataInicial,
        Date dataFinal
) {}
