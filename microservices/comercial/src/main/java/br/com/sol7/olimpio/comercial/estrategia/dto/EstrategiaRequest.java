package br.com.sol7.olimpio.comercial.estrategia;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record EstrategiaRequest(
        @NotBlank(message = "Descrição é obrigatória")
        @Size(min = 3, max = 255, message = "Descrição deve ter entre 3 e 255 caracteres")
        String descricao){}
