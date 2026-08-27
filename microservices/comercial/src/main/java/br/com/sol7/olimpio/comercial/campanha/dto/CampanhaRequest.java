package br.com.sol7.olimpio.comercial.campanha;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.util.Date;
import java.util.List;

public record CampanhaRequest(
        @NotBlank @Size(min = 3, max = 255) String descricao,
        @NotNull Integer meta,
        boolean ativo,
        @NotNull Date dataInicial,
        List<Long> unidadeIds,
        List<AcaoDeCampanhaRequest> acoes
) {}
