package br.com.sol7.olimpio.central.tipopausa;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record TipoPausaRequest(
        @NotBlank(message = "Descricao e obrigatoria")
        @Size(min = 3, max = 255, message = "Descricao deve ter entre 3 e 255 caracteres")
        String descricao,

        @NotNull(message = "Insira o tempo intervalo")
        Integer tempo
) {}
