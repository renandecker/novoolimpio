package br.com.sol7.olimpio.central.turnotrabalho;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.util.List;

public record TurnoTrabalhoRequest(
        @NotBlank(message = "Descricao e obrigatoria") @Size(min = 3, max = 255, message = "Descricao deve ter entre 3 e 255 caracteres") String descricao,
        @NotBlank(message = "Inicio e obrigatorio") String inicio,
        @NotBlank(message = "Fim e obrigatorio") String fim,
        @NotNull(message = "Dia da semana e obrigatorio") Long diaSemanaId,
        List<Long> unidadeIds) {}
