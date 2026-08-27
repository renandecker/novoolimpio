package br.com.sol7.olimpio.comercial.campanha;

import jakarta.validation.constraints.NotNull;
import java.util.Date;

public record AcaoDeCampanhaRequest(
        @NotNull Long tipoCanalId,
        @NotNull Long estrategiaId,
        @NotNull Date dataInicial,
        @NotNull Date dataFinal
) {}
